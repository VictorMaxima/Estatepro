from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (TransactionCreateView, PaystackWebhookView, BankListView, PayoutRequestView
                    )

urlpatterns = [
    path("api/payment_init", TransactionCreateView.as_view(), name="payment_init"),
    path("api/paystack/webhook", PaystackWebhookView.as_view(), name="webhook_view"),
    path('api/list_banks', BankListView.as_view(), name="list_banks" ),
    path('api/agent/payout_request', PayoutRequestView.as_view(), name='payment_request' )
]
