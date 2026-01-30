from rest_framework import serializers
from .models import Transaction, Bank, PayoutRequest

class InitializeTransactionSerializer(serializers.ModelSerializer):
    property_id = serializers.IntegerField()
    # output only
    authorization_url = serializers.URLField(read_only=True)
    paystack_reference = serializers.CharField(read_only=True)

    class Meta:
        model = Transaction
        fields = ['property_id', 'authorization_url', 'paystack_reference']

class BankListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ['name','code']

class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = ['amount', 'bank_code', 'account_number']
