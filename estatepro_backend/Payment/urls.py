# Payment/urls.py  (replace the file, or merge these paths into it)
from django.urls import path
from . import views

urlpatterns = [
    path("api/payment/initialize/<int:property_id>/", views.InitializePaymentView.as_view()),
    path("api/payment/transaction/<str:reference>/", views.MyTransactionView.as_view()),
    path("api/payment/confirm-viewing/<int:txn_id>/", views.ConfirmViewingView.as_view()),
    path("api/payment/dispute/<int:txn_id>/", views.DisputeView.as_view()),
    path("api/payment/refund/<int:txn_id>/", views.RequestRefundView.as_view()),
    path("api/payment/resolve/<int:txn_id>/", views.ResolveDisputeView.as_view()),
    path("api/payment/payout-account/", views.PayoutAccountView.as_view()),
    path("api/payment/banks/", views.BanksView.as_view()),
    path("api/payment/earnings/", views.AgentEarningsView.as_view()),
    path("api/payment/webhook/", views.paystack_webhook),  # public: set this URL in the Paystack dashboard
]
# Note: payment_views.py must be saved as Payment/views.py for the import above.
