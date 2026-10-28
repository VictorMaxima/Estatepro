"""
Escrow payment flow for the Payment app.

Flow:  pending -> held -> viewing_confirmed -> released -> paid_out
       held/viewing_confirmed -> disputed -> refunded | released
       held (viewing window expired) -> refunded

Money is only ever confirmed by the signed Paystack webhook, never by the
browser redirect. Amounts and commission are computed server-side.
"""
import hashlib
import hmac
import json
import logging
import uuid
from datetime import timedelta
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction as db_transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from Main.models import Property
from Main.views import CookieJWTAuthentication
from django.db.models import Sum
from .models import Bank, Payout, PayoutAccount, Transaction

log = logging.getLogger(__name__)

# ---- Tunables (change here only) -------------------------------------------
COMMISSION_PERCENT = Decimal("5")
VIEWING_WINDOW = timedelta(days=7)    # buyer has this long to view the property
DISPUTE_WINDOW = timedelta(hours=48)  # after viewing is confirmed
MAX_CODE_ATTEMPTS = 5
PENDING_HOLD = timedelta(minutes=30)  # a pending payment blocks other buyers this long
PAYSTACK = "https://api.paystack.co"
AVAILABLE_STATUS = "available"


def payable_kobo(prop):
    """Amount charged for a property. Swap this out if you charge a deposit."""
    return int((Decimal(prop.price) * 100).to_integral_value())


def _headers():
    return {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}


def viewing_code(txn):
    """6-digit code derived from the reference + server secret. Shown only to the
    buyer, so nothing sensitive is stored and it can't be guessed from the reference."""
    digest = hmac.new(settings.SECRET_KEY.encode(), f"view:{txn.paystack_reference}".encode(),
                      hashlib.sha256).hexdigest()
    return str(int(digest, 16) % 1_000_000).zfill(6)


def property_is_taken(prop, exclude_txn=None):
    qs = Transaction.objects.filter(property=prop)
    if exclude_txn:
        qs = qs.exclude(pk=exclude_txn.pk)
    live = qs.filter(status__in=["held", "viewing_confirmed", "released", "disputed", "paid_out"])
    recent_pending = qs.filter(status="pending", created_at__gte=timezone.now() - PENDING_HOLD)
    return live.exists() or recent_pending.exists() or prop.status == "sold"


def reopen_property(txn):
    Property.objects.filter(pk=txn.property_id).update(status=AVAILABLE_STATUS)


def refund_via_paystack(txn):
    r = requests.post(f"{PAYSTACK}/refund", headers=_headers(), timeout=15,
                      json={"transaction": txn.paystack_reference})
    return r.status_code in (200, 201) and r.json().get("status") is True


# ---- Buyer: start payment ---------------------------------------------------
class InitializePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, property_id):
        prop = get_object_or_404(Property, id=property_id)
        if prop.agent_id == request.user.id:
            return Response({"error": "You cannot buy your own listing"}, status=400)
        if not prop.agent.agent_status:
            return Response({"error": "This listing is not available"}, status=400)
        # The same buyer retrying: hand back their still-valid pending payment link.
        existing = (Transaction.objects
                    .filter(property=prop, buyer=request.user, status="pending",
                            created_at__gte=timezone.now() - PENDING_HOLD)
                    .exclude(authorization_url="").order_by("-created_at").first())
        if existing:
            return Response({"authorization_url": existing.authorization_url,
                             "reference": existing.paystack_reference})
        if property_is_taken(prop):
            return Response({"error": "This property is no longer available"}, status=409)

        amount = payable_kobo(prop)
        commission = int((Decimal(amount) * COMMISSION_PERCENT / 100).to_integral_value())
        txn = Transaction.objects.create(
            property=prop, buyer=request.user, paystack_reference=uuid.uuid4().hex,
            amount_kobo=amount, commission_kobo=commission, seller_kobo=amount - commission)

        try:
            payload = {
                "email": request.user.email,
                "amount": amount,
                "currency": txn.currency,
                "reference": txn.paystack_reference,
            }
            callback = getattr(settings, "PAYSTACK_CALLBACK_URL", "")
            if callback:  # e.g. https://your-site/payment-success
                payload["callback_url"] = callback
            r = requests.post(f"{PAYSTACK}/transaction/initialize", headers=_headers(), timeout=15,
                              json=payload)
            ok = r.status_code == 200 and r.json().get("status")
        except requests.RequestException:
            ok = False
        if not ok:
            txn.status = "failed"
            txn.save(update_fields=["status"])
            return Response({"error": "Could not start payment"}, status=502)

        txn.authorization_url = r.json()["data"]["authorization_url"]
        txn.save(update_fields=["authorization_url"])
        return Response({"authorization_url": txn.authorization_url,
                         "reference": txn.paystack_reference})


class MyTransactionView(APIView):
    """Frontend polls this after the Paystack redirect. Reads our DB only."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, reference):
        txn = get_object_or_404(Transaction, paystack_reference=reference, buyer=request.user)
        data = txn.summary()
        if txn.status == "held":
            data["viewing_code"] = viewing_code(txn)  # buyer reads this out at the viewing
        return Response(data)


# ---- Agent: confirm viewing with the buyer's code ---------------------------
class ConfirmViewingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, txn_id):
        code = str(request.data.get("code", "")).strip()
        with db_transaction.atomic():
            txn = get_object_or_404(Transaction.objects.select_for_update(),
                                    pk=txn_id, property__agent=request.user)
            if txn.status != "held" or timezone.now() > txn.viewing_deadline:
                return Response({"error": "Viewing cannot be confirmed for this transaction"}, status=400)
            if txn.viewing_code_attempts >= MAX_CODE_ATTEMPTS:
                return Response({"error": "Too many attempts. Contact support."}, status=429)
            if not hmac.compare_digest(code, viewing_code(txn)):
                txn.viewing_code_attempts += 1
                txn.save(update_fields=["viewing_code_attempts"])
                return Response({"error": "Invalid code"}, status=400)
            txn.status = "viewing_confirmed"
            txn.dispute_deadline = timezone.now() + DISPUTE_WINDOW
            txn.save(update_fields=["status", "dispute_deadline"])
        return Response({"message": "Viewing confirmed", "dispute_deadline": txn.dispute_deadline})


# ---- Buyer: dispute or request refund ---------------------------------------
class DisputeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, txn_id):
        reason = str(request.data.get("reason", "")).strip()[:2000]
        if not reason:
            return Response({"error": "Please describe the problem"}, status=400)
        with db_transaction.atomic():
            txn = get_object_or_404(Transaction.objects.select_for_update(), pk=txn_id, buyer=request.user)
            if txn.status != "viewing_confirmed" or timezone.now() > txn.dispute_deadline:
                return Response({"error": "This transaction can no longer be disputed"}, status=400)
            txn.status = "disputed"
            txn.dispute_reason = reason
            txn.save(update_fields=["status", "dispute_reason"])
        return Response({"message": "Dispute opened. Our team will review it."})


class RequestRefundView(APIView):
    """Buyer refund when no viewing happened before the deadline."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, txn_id):
        with db_transaction.atomic():
            txn = get_object_or_404(Transaction.objects.select_for_update(), pk=txn_id, buyer=request.user)
            if txn.status != "held" or timezone.now() <= txn.viewing_deadline:
                return Response({"error": "Refund not available yet"}, status=400)
            if not refund_via_paystack(txn):
                return Response({"error": "Refund could not be processed, try again"}, status=502)
            txn.status = "refunded"
            txn.save(update_fields=["status"])
            reopen_property(txn)
        return Response({"message": "Refund initiated"})


# ---- Admin: resolve disputes -------------------------------------------------
class ResolveDisputeView(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, txn_id):
        decision = request.data.get("decision")
        if decision not in ("refund", "release"):
            return Response({"error": "decision must be 'refund' or 'release'"}, status=400)
        with db_transaction.atomic():
            txn = get_object_or_404(Transaction.objects.select_for_update(), pk=txn_id, status="disputed")
            if decision == "refund":
                if not refund_via_paystack(txn):
                    return Response({"error": "Refund failed"}, status=502)
                txn.status = "refunded"
            else:
                txn.status = "released"
            txn.save(update_fields=["status"])
            if decision == "refund":
                reopen_property(txn)
            log.info("dispute %s resolved as %s by %s", txn.pk, decision, request.user.pk)
        return Response({"message": f"Dispute resolved: {decision}"})


# ---- Agent: payout bank details (collected only when needed) ----------------
class PayoutAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        user = request.user
        if not user.agent_status:
            return Response({"error": "Agents only"}, status=403)
        bank_code = str(request.data.get("bank_code", "")).strip()
        account_number = str(request.data.get("account_number", "")).strip()
        if not (bank_code.isdigit() and account_number.isdigit() and len(account_number) == 10):
            return Response({"error": "Invalid bank details"}, status=400)

        r = requests.get(f"{PAYSTACK}/bank/resolve", headers=_headers(), timeout=15,
                         params={"account_number": account_number, "bank_code": bank_code})
        if r.status_code != 200:
            return Response({"error": "Could not verify account"}, status=400)
        account_name = r.json()["data"]["account_name"]

        r = requests.post(f"{PAYSTACK}/transferrecipient", headers=_headers(), timeout=15, json={
            "type": "nuban", "name": account_name, "account_number": account_number,
            "bank_code": bank_code, "currency": "NGN"})
        if r.status_code not in (200, 201):
            return Response({"error": "Could not save bank details"}, status=502)
        code = r.json()["data"]["recipient_code"]

        PayoutAccount.objects.update_or_create(
            agent=user, defaults={"recipient_code": code, "account_name": account_name,
                                  "last4": account_number[-4:]})
        return Response({"account_name": account_name, "last4": account_number[-4:]})

    def get(self, request):
        acct = PayoutAccount.objects.filter(agent=request.user).first()
        if not acct:
            return Response({"configured": False})
        return Response({"configured": True, "account_name": acct.account_name, "last4": acct.last4})


# ---- Webhook ----------------------------------------------------------------
@csrf_exempt
def paystack_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    sig = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), request.body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return HttpResponse(status=400)

    try:
        event = json.loads(request.body)
        name, data = event["event"], event["data"]
    except (ValueError, KeyError):
        return HttpResponse(status=400)

    if name == "charge.success":
        _handle_charge_success(data)
    elif name in ("transfer.success", "transfer.failed", "transfer.reversed"):
        _handle_transfer(name, data)
    return HttpResponse(status=200)  # always 200 once the signature is valid


def _handle_charge_success(data):
    with db_transaction.atomic():
        txn = Transaction.objects.select_for_update().filter(paystack_reference=data.get("reference")).first()
        if txn is None or txn.status != "pending":
            return  # unknown or already processed (webhook retry)
        if data.get("amount") != txn.amount_kobo or data.get("currency") != txn.currency:
            txn.status = "failed"
            txn.save(update_fields=["status"])
            log.error("Amount mismatch on %s: got %s %s", txn.paystack_reference,
                      data.get("amount"), data.get("currency"))
            return
        prop = Property.objects.select_for_update().get(pk=txn.property_id)
        if property_is_taken(prop, exclude_txn=txn):
            # Another buyer got there first: money received, so refund this one.
            txn.status = "refunded" if refund_via_paystack(txn) else "failed"
            txn.save(update_fields=["status"])
            log.warning("Property %s already taken; txn %s -> %s", prop.pk, txn.pk, txn.status)
            return
        txn.status = "held"
        txn.paid_at = timezone.now()
        txn.viewing_deadline = timezone.now() + VIEWING_WINDOW
        txn.save(update_fields=["status", "paid_at", "viewing_deadline"])
        Property.objects.filter(pk=prop.pk).update(status="reserved")


def _handle_transfer(name, data):
    with db_transaction.atomic():
        payout = Payout.objects.select_for_update().filter(reference=data.get("reference")).first()
        if payout is None or payout.status != "processing":
            return
        if name == "transfer.success":
            payout.status = "success"
            payout.save(update_fields=["status"])
            payout.transactions.update(status="paid_out")
            Property.objects.filter(transactions__payout=payout).update(status="sold")
        else:
            payout.status = "failed" if name == "transfer.failed" else "reversed"
            payout.save(update_fields=["status"])
            payout.transactions.update(payout=None)  # picked up by next run
            log.error("Payout %s %s", payout.reference, payout.status)


# ---- Read-only endpoints for the frontend -----------------------------------
class BanksView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        if not Bank.objects.exists():  # first use: seed from Paystack
            try:
                r = requests.get(f"{PAYSTACK}/bank", headers=_headers(), timeout=15,
                                 params={"country": "nigeria", "currency": "NGN", "perPage": 200})
                for b in r.json().get("data", []):
                    Bank.objects.get_or_create(code=b["code"], defaults={"name": b["name"], "slug": b.get("slug", "")})
            except (requests.RequestException, ValueError):
                pass
        return Response(list(Bank.objects.filter(is_active=True).values("name", "code")))


class AgentEarningsView(APIView):
    """Agent dashboard data. Amounts are in kobo."""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        if not request.user.agent_status:
            return Response({"error": "Agents only"}, status=403)
        mine = Transaction.objects.filter(property__agent=request.user)

        def total(qs):
            return qs.aggregate(t=Sum("seller_kobo"))["t"] or 0

        sales = (mine.exclude(status__in=["pending", "failed"]).select_related("property")
                 .order_by("-created_at")[:50])
        payouts = Payout.objects.filter(agent=request.user).order_by("-created_at")[:50]
        return Response({
            "in_escrow_kobo": total(mine.filter(status__in=["held", "viewing_confirmed", "disputed"])),
            "next_payout_kobo": total(mine.filter(status="released", payout__isnull=True)),
            "paid_out_kobo": total(mine.filter(status="paid_out")),
            "sales": [{
                "id": t.pk, "property_title": t.property.title, "status": t.status,
                "seller_kobo": t.seller_kobo, "viewing_deadline": t.viewing_deadline,
                "dispute_deadline": t.dispute_deadline,
            } for t in sales],
            "payouts": [{
                "id": p.pk, "amount_kobo": p.amount_kobo, "status": p.status, "created_at": p.created_at,
            } for p in payouts],
        })
