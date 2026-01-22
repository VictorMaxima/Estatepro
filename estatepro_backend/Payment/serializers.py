from rest_framework import serializers
from .models import Transaction
from .models import Bank

class TransactionSerializer(serializers.ModelSerializer):
    account = serializers.PrimaryKeyRelatedField(
        queryset=Bank.objects.all()
    )

    class Meta:
        model = Transaction
        fields = ["account", "amount"]
