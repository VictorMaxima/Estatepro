import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from Payment.models import Bank

class Command(BaseCommand):
    help = "Sync Nigerian banks from Paystack"

    def handle(self, *args, **kwargs):
        url = "https://api.paystack.co/bank?country=nigeria"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        }

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        banks = response.json()["data"]

        for bank in banks:
            Bank.objects.update_or_create(
                code=bank["code"],
                defaults={
                    "name": bank["name"],
                    "slug": bank.get("slug", ""),
                    "is_active": bank["active"],
                }
            )

        self.stdout.write(
            self.style.SUCCESS("Paystack banks synced successfully")
        )
