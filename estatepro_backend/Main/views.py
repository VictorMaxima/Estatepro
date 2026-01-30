from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets, permissions
from django.shortcuts import render
from django.contrib.auth.backends import BaseBackend
from .serializers import (LoginSerializer, RegisterSerializer, CreateAgentApplySerializer, ContactSerializer, ApplicationListSerializer,
                          CreatePropertyListingSerializer, CreatePropertyImageSerializer, ListAgentPropertySerializer, ListPropertySerializer, PropertyDetailSerializer,
                            )
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import AppUser, AgentApplication, ContactRequest, Property, PropertyImage
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.apps import apps

Wallet = apps.get_model("Payment", "Wallet")

class UserBackend(BaseBackend):
    #user backend for authentication

    def authenticate(request, email=None, password=None):
        try:
            user = AppUser.objects.get(email=email)
            if user.check_password(password):
                return user
        except AppUser.DoesNotExist:
            print(AppUser.objects) #for debugging
            return None
  

    def get_user(self, client_id):
        try:
            return AppUser.objects.get(pk=user_id)
        except AppUser.DoesNotExist:
            return None

class LoginView(APIView):
    #login view to be used as api end point
    @swagger_auto_schema(
        request_body=LoginSerializer,
        responses={
            200: openapi.Response(
                description="Success",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = UserBackend.authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": "Logged in successfully"})
        
        return Response({"error": "Invalid credentials"})

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"})

class RegisterView(APIView):

    @swagger_auto_schema(
        request_body = RegisterSerializer,
        responses={
            200: openapi.Response(
                description="Success",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created. Please verify your email.',
                            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)

class VerifyEmail(APIView):
    def get(self, request):
        token = request.GET.get('token')
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = AppUser.objects.get(email=user_id)
            if not user.is_active:
                user.is_active = True
                user.save()
            return render(request, "verify.html", {
        "message": "Email successfully verified! ",
        "redirect_url": "/"
    })
        except TokenError:
            return render(request, "alert_page.html", {
        "message": "expired Token",
        "redirect_url": "/home/"
    })
        
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        user = UserBackend.authenticate(request, email=request.data['email'], password=request.data['password'])
        if user is not None:
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token
            print(type(user))
            return Response(
                {
                    'access_token': str(access_token),
                    'refresh_token': str(refresh_token),
                    'user_id': user.id,
                    'agentstatus': user.agent_status
                }
            )
        return Response({'error': 'Invalid credentials'})
class ContactUsView(CreateAPIView):
    queryset = ContactRequest.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = ContactSerializer

    def post(self, request):
        serializer = ContactSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'message sent',
                            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)


class AgentApplyView(CreateAPIView):
    queryset = AgentApplication.objects.all()
    serializer_class = CreateAgentApplySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    

    def perform_create(self, serializer):
        agent = self.request.user
        agent.phone_number = self.phone_number
        if agent.agent_application.count() > 0:
            raise ValidationError("This agent has already made an application to be an agent")
        serializer.save(agent=agent)

class AgentApplicationList(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        applications = AgentApplication.objects.all()
        serializer = ApplicationListSerializer(applications, many=True)
        return Response(serializer.data)

class AgentApprovalView(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, id):
        agent = get_object_or_404(AppUser, id=id)
        agent.agent_status = True
        agent.save()
        wallet = Wallet.objects.create(owner=agent, balance=0)
        return Response({
            "message": f"{agent.email} has been successfully approved to be an agent"
        })

class CreatePropertyListingView(CreateAPIView):
    serializer_class = CreatePropertyListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        agent = self.request.user
        if not agent.agent_status:
            raise ValidationError("Apply to be an agent first before trying to list a property")
        print(agent)
        serializer.save(agent=agent)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)  # side effects here
        instance = serializer.instance  # get saved object

        data = {
        "message": "Property Listing created!",
        "property_id": instance.id,
    }
        return Response(data, status=status.HTTP_201_CREATED)

class CreatePropertyImageView(CreateAPIView):
    serializer_class = CreatePropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        agent = self.request.user
        if not agent.agent_status:
            raise ValidationError("Apply to be an agent first before trying to list a property")
        property_id = self.kwargs['property_id']
        serializer.save(property_id = property_id)
    
class ListAgentPropertiesView(APIView):
    serializer = ListAgentPropertySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        if not self.request.user.agent_status:
            raise ValidationError("Apply to be an agent first before trying to list a property")
        properties = request.user.properties.all()
        serializer = ListAgentPropertySerializer(properties, many=True)
        return Response(serializer.data)

class ListPropertiesView(APIView):
    serializer = ListPropertySerializer
    def get(self, request):
        properties = Property.objects.all()
        serializer = ListPropertySerializer(properties, many=True)
        return Response(serializer.data)

class PropertyDetailView(APIView):
    serializer = PropertyDetailSerializer
    def get(self, request, slug):
        property = get_object_or_404(Property, slug=slug)
        serializer = PropertyDetailSerializer(property)
        return Response(serializer.data)
    


    


