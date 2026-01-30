from django.contrib import admin
from .models import Transaction, Wallet, Bank

# Register your models here.
admin.site.register(Transaction)
admin.site.register(Wallet)
admin.site.register(Bank)