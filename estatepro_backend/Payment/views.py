from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login, logout
from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets, permissions
from .serializers import (InitializeTransactionSerializer, BankListSerializer, PayoutRequestSerializer)
import paystack
from .models import (Transaction, Wallet, Bank) 
from pprint import pprint
from django.apps import apps
import hmac
import hashlib

Property = apps.get_model("Main", "Property")
paystack.api_key = settings.PAYSTACK_SECRET_KEY
# Create your views here.
class TransactionCreateView(CreateAPIView):
    serializer_class = InitializeTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        buyer = self.request.user
        data = serializer.validated_data
        property = get_object_or_404(Property, id = data['property_id'])
        if property.status != "Available":
            raise ValidationError("this property is not available")
        property.status = "reserved"
        property.save()
        response = paystack.Transaction.initialize(
        buyer.email, property.price*100       
        )
        if response.status:
            paystack_reference = response.data['reference']
            authorization_url = response.data['authorization_url']
            serializer.save(buyer=buyer, property=property, status="pending", paystack_reference=paystack_reference, authorization_url=authorization_url)

 

class PaystackWebhookView(APIView):
    authentication_classes = []  
    permission_classes = []      

    def post(self, request):
        # 1️Verify Paystack signature
        signature = request.headers.get("X-Paystack-Signature")
        secret = settings.PAYSTACK_SECRET_KEY.encode()
        computed = hmac.new(secret, request.body, hashlib.sha512).hexdigest()

        if not hmac.compare_digest(signature, computed):
            return Response({"detail": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        # 2️⃣ Parse webhook payload
        event = request.data  # DRF automatically parses JSON
        event_type = event.get("event")
        data = event.get("data", {})

        # 3️⃣ Handle the event
        if event_type == "charge.success":
            reference = data.get("reference")
            amount = data.get("amount")
            metadata = data.get("metadata", {})

            try:
                # Find your transaction in DB
                tx = Transaction.objects.get(paystack_reference=reference, status="pending")
                tx.status = "success"
                tx.save()

                # credit wallet
                agent = tx.property.agent
                if agent:
                    wallet = Wallet.objects.get(owner=agent)
                    wallet.balance += amount*0.3
                    wallet.save()
            except Transaction.DoesNotExist:
                # maybe log an error
                pass

        # 4️⃣ Return 200 OK (Paystack expects 200)
        return Response({"status": "success"}, status=status.HTTP_200_OK)

class BankListView(APIView):
    authentication_classes = []  
    permission_classes = []  

    def get(self, request):
        banks = Bank.objects.all()
        serializer = BankListSerializer(banks, many=True)
        return Response(serializer.data)

class PayoutRequestView(CreateAPIView):
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        agent = self.request.user
        data = serializer.validated_data
        if agent.wallet.balance < data['amount']:
            raise ValidationError("Not enough balance in wallet")
        if data['amount'] < 5000:
            raise ValidationError("Less than the minimum withdrawable amount")
        serializer.save(agent = agent,amount = data['amount'], bank_code = data['bank_code'], account_number = data['account_number'], status= "pending")

