from django.db import models
from django.conf import settings


# DEPRECATED: balances are now derived from released Transactions.
# Keep until AgentApprovalView no longer creates wallets, then delete.
class Wallet(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.IntegerField(default=0)


class Payout(models.Model):
    STATUS = (
        ("processing", "Processing"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("reversed", "Reversed"),
    )
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payouts")
    amount_kobo = models.BigIntegerField()
    reference = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=15, choices=STATUS, default="processing")
    created_at = models.DateTimeField(auto_now_add=True)


class Transaction(models.Model):
    STATUS = (
        ("pending", "Pending"),                      # initialized, not yet paid
        ("held", "Held"),                            # paid, funds in escrow
        ("viewing_confirmed", "Viewing confirmed"),  # viewing code accepted, dispute window open
        ("released", "Released"),                    # owed to agent, awaiting weekly payout
        ("disputed", "Disputed"),                    # frozen until admin decides
        ("refunded", "Refunded"),
        ("paid_out", "Paid out"),                    # included in a successful transfer
        ("failed", "Failed"),
    )
    property = models.ForeignKey("Main.Property", on_delete=models.PROTECT, related_name="transactions")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="transactions")
    paystack_reference = models.CharField(max_length=64, unique=True)
    amount_kobo = models.BigIntegerField()
    commission_kobo = models.BigIntegerField()
    seller_kobo = models.BigIntegerField()
    currency = models.CharField(max_length=3, default="NGN")
    status = models.CharField(max_length=20, choices=STATUS, default="pending", db_index=True)
    authorization_url = models.URLField(max_length=300, blank=True)

    viewing_code_attempts = models.PositiveSmallIntegerField(default=0)
    viewing_deadline = models.DateTimeField(null=True, blank=True)
    dispute_deadline = models.DateTimeField(null=True, blank=True)
    dispute_reason = models.TextField(blank=True)

    payout = models.ForeignKey(Payout, null=True, blank=True, on_delete=models.PROTECT, related_name="transactions")
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def summary(self):
        return {
            "id": self.pk,
            "property_id": self.property_id,
            "paystack_reference": self.paystack_reference,
            "status": self.status,
            "authorization_url": self.authorization_url if self.status == "pending" else "",
            "viewing_deadline": self.viewing_deadline,
            "dispute_deadline": self.dispute_deadline,
            "created_at": self.created_at,
        }


class PayoutAccount(models.Model):
    """Only the Paystack recipient code is stored, never the account number."""
    agent = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payout_account")
    recipient_code = models.CharField(max_length=40)
    bank_name = models.CharField(max_length=100, blank=True)
    account_name = models.CharField(max_length=150, blank=True)
    last4 = models.CharField(max_length=4, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ReferralCommision(models.Model):
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="referral_commisions")
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commision_paid")
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="commission")
    STATUSCHOICES = (("pending", "Pending"), ("paid", "Paid"))
    status = models.CharField(max_length=40, choices=STATUSCHOICES, default="pending")


class Bank(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)  # Paystack bank code
    slug = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
