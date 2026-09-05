from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    RegisterView, VerifyEmail, AgentApplyView, refresh_token_view,
    ContactUsView, AgentApplicationList, AgentApprovalView, CreatePropertyListingView, CreatePropertyImageView,
    ListAgentPropertiesView, ListPropertiesView, PropertyDetailView, EditPropertyView, DeletePropertyImageView,
    login_view, logout_view, DeletePropertyView, csrf_token)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken import views
urlpatterns = [
    path('api/register', RegisterView.as_view(), name='register'),
    path('api/verify-email/', VerifyEmail.as_view(), name='email-verify'),
    path('api/token/', login_view, name='token_obtain_pair'),
    path('api/token/refresh/', refresh_token_view, name='token_refresh'),
    path('api/contact', ContactUsView.as_view(), name='contact_us'),
    path('api/agent_apply', AgentApplyView.as_view(), name='agent_apply'),
    path('api/list_applications', AgentApplicationList.as_view(), name='list_application'),
    path('api/approve_application/<int:id>/', AgentApprovalView.as_view(), name='approve-agent'),
    path('api/agent/properties/add', CreatePropertyListingView.as_view(), name="add_property"),
    path('api/property/<int:property_id>/add_image', CreatePropertyImageView.as_view(), name="add_image"),
    path('api/agent/properties', ListAgentPropertiesView.as_view(), name="list_agent_properties"),
    path('api/properties', ListPropertiesView.as_view(), name='list_properties'),
    path('api/properties/detail/<int:id>', PropertyDetailView.as_view(), name='property_detail'),
    path('api/agent/properties/<int:property_id>', EditPropertyView.as_view(), name='edit-property'),
    path('api/property/images/<int:image_id>', DeletePropertyImageView.as_view(), name='delete-property-image'),
    path('api/property/<int:property_id>/delete', DeletePropertyView.as_view(), name='delete_property'),
    path('api/get-csrf-token/', csrf_token, name="csrf_handler")
]


