from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    LoginView, LogoutView, RegisterView, VerifyEmail, CustomTokenObtainPairView, AgentApplyView,
    ContactUsView, AgentApplicationList, AgentApprovalView, CreatePropertyListingView, CreatePropertyImageView,
    ListAgentPropertiesView, ListPropertiesView, PropertyDetailView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken import views
urlpatterns = [
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/register', RegisterView.as_view(), name='register'),
    path('api/verify-email/', VerifyEmail.as_view(), name='email-verify'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/contact', ContactUsView.as_view(), name='contact_us'),
    path('api/agent_apply', AgentApplyView.as_view(), name='agent_apply'),
    path('api/list_applications', AgentApplicationList.as_view(), name='list_application'),
    path('api/approve_application/<int:id>/', AgentApprovalView.as_view(), name='approve-agent'),
    path('api/agent/properties/add', CreatePropertyListingView.as_view(), name="add_property"),
    path('api/property/<int:property_id>/add_image', CreatePropertyImageView.as_view(), name="add_image"),
    path('api/agent/properties', ListAgentPropertiesView.as_view(), name="list_agent_properties"),
    path('api/properties', ListPropertiesView.as_view(), name='list_properties'),
    path('api/properties/detail/<str:slug>', PropertyDetailView.as_view(), name='property_detail')
]


