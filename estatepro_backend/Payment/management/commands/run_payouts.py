"""
Place at: Payment/management/commands/run_payouts.py
(also create empty __init__.py in management/ and management/commands/)

Run daily:   python manage.py run_payouts --release-only
Run weekly:  python manage.py run_payouts

Step 1 (every run): move viewing_confirmed transactions past their dispute
        window to 'released'.
Step 2 (weekly):    pay each agent's released, unpaid transactions in one
        Paystack transfer.
"""
import logging
import uuid

import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction as db_transaction
from django.db.models import Sum
from django.utils import timezone

from Payment.models import Payout, PayoutAccount, Transaction

log = logging.getLogger(__name__)
PAYSTACK = "https://api.paystack.co"
MIN_PAYOUT_KOBO = 100_00  # skip tiny payouts


def _headers():
    return {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}


class Command(BaseCommand):
    help = "Release due escrow transactions and pay out agents."

    def add_arguments(self, parser):
        parser.add_argument("--release-only", action="store_true")

    def handle(self, *args, **opts):
        released = Transaction.objects.filter(
            status="viewing_confirmed", dispute_deadline__lt=timezone.now()
        ).update(status="released")
        self.stdout.write(f"Released {released} transactions")
        if opts["release_only"]:
            return

        agent_ids = (Transaction.objects.filter(status="released", payout__isnull=True)
                     .values_list("property__agent_id", flat=True).distinct())
        for agent_id in agent_ids:
            self.pay_agent(agent_id)

    def pay_agent(self, agent_id):
        acct = PayoutAccount.objects.filter(agent_id=agent_id).first()
        if not acct:
            log.warning("Agent %s has released funds but no payout account", agent_id)
            return

        # Lock rows and create the Payout BEFORE calling Paystack so a rerun can't pay twice.
        with db_transaction.atomic():
            txns = list(Transaction.objects.select_for_update().filter(
                property__agent_id=agent_id, status="released", payout__isnull=True))
            total = sum(t.seller_kobo for t in txns)
            if not txns or total < MIN_PAYOUT_KOBO:
                return
            payout = Payout.objects.create(agent_id=agent_id, amount_kobo=total,
                                           reference=uuid.uuid4().hex)
            Transaction.objects.filter(pk__in=[t.pk for t in txns]).update(payout=payout)

        try:
            r = requests.post(f"{PAYSTACK}/transfer", headers=_headers(), timeout=20, json={
                "source": "balance", "amount": total, "recipient": acct.recipient_code,
                "reference": payout.reference, "reason": "EstatePro weekly payout"})
            body = r.json()
            ok = r.status_code in (200, 201) and body.get("status") is True
        except (requests.RequestException, ValueError):
            ok, body = False, {}

        if not ok:
            log.error("Transfer request failed for payout %s: %s", payout.reference, body)
            with db_transaction.atomic():
                payout.status = "failed"
                payout.save(update_fields=["status"])
                payout.transactions.update(payout=None)  # retry next run
            return

        # Otherwise stays 'processing'. transfer.success/failed/reversed webhook finalizes it.
        # If body["data"]["status"] == "otp", disable transfer OTP in the Paystack dashboard.
        self.stdout.write(f"Payout {payout.reference}: {total} kobo -> agent {agent_id}")
