from django.db import models
from django.conf import settings

# Create your models here.
class Wallet(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.IntegerField(default=0)

class Transaction(models.Model):
    property = models.ForeignKey("Main.Property", on_delete=models.CASCADE, related_name="transactions")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    paystack_reference = models.CharField(max_length=50)
    STATUSCHOICES = (('pending', 'Pending'), ("success", "Success"), ("failed", "Failed"))
    status = models.CharField(max_length=40, choices=STATUSCHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class ReferralCommision(models.Model):
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="referral_commisions")
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commision_paid")
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="commission")
    STATUSCHOICES = (('pending', 'Pending'), ("paid", "Paid"))
    status = models.CharField(max_length=40, choices=STATUSCHOICES)

class Bank(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)  # Paystack bank code
    slug = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

class PayoutRequest(models.Model):
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_requests")
    amount = models.IntegerField()
    bank = models.ForeignKey(Bank, on_delete=models.CASCADE)
    STATUSCHOICES = (('pending', 'Pending'), ("approved", "Paid"), ("approved", "Approved"), ("paid", "Paid"))
    status = models.CharField(max_length=40, choices=STATUSCHOICES)
