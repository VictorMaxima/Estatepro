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
from django.apps import apps
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from django.views.decorators.clickjacking import xframe_options_exempt

Wallet = apps.get_model("Payment", "Wallet")
Transaction = apps.get_model("Payment", "Transaction")


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None  # Fall through to other authenticators
        
        try:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            return None

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


class RegisterView(APIView):

    @swagger_auto_schema(
        request_body = RegisterSerializer,
        responses= {
            200: openapi.Response(
                description="Success",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties= {
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
    authentication_classes = [CookieJWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    

    def perform_create(self, serializer):
        agent = self.request.user
        agent.phone_number = self.phone_number
        if agent.agent_application.count() > 0:
            raise ValidationError("This agent has already made an application to be an agent")
        serializer.save(agent=agent)

class AgentApplicationList(APIView):
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]
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
    authentication_classes = [CookieJWTAuthentication]

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
    authentication_classes = [CookieJWTAuthentication]
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
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        if not self.request.user.agent_status:
            raise ValidationError("Apply to be an agent first before trying to list a property")
        properties = request.user.listings.all()
        serializer = ListAgentPropertySerializer(properties, many=True)
        return Response(serializer.data)

class ListPropertiesView(APIView):
    serializer = ListPropertySerializer
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        properties = Property.objects.all()
        serializer = ListPropertySerializer(properties, many=True)
        return Response(serializer.data)

class PropertyDetailView(APIView):
    serializer = PropertyDetailSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, id):
        property = get_object_or_404(Property, id=id)
        serializer = PropertyDetailSerializer(property)
        if request.user.is_authenticated and Transaction.objects.filter(property=property, buyer=request.user).exists():
            transaction = get_object_or_404(Transaction, buyer=request.user, property=property)
            data = serializer.data
            data['transaction'] = transaction.summary()
            print(data['transaction'])
            return Response(data)
        return Response(serializer.data)
    


class EditPropertyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    @swagger_auto_schema(
        operation_description="Update a property listing",
        request_body=PropertyDetailSerializer,
        responses={
            200: openapi.Response('Property updated successfully', PropertyDetailSerializer),
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Property not found'
        }
    )
    def put(self, request, property_id):
        """
        Update an existing property
        """
        # Get the property or return 404
        property_obj = get_object_or_404(Property, id=property_id)
        
        # Check if the logged-in user is the agent who owns this property
        if property_obj.agent != request.user:
            return Response(
                {'error': 'You do not have permission to edit this property'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate required fields
        required_fields = ['title', 'description', 'location', 'price', 
                          'property_type', 'size', 'no_of_bedrooms', 'no_of_bathrooms']
        
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response(
                {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the property
        serializer = PropertyDetailSerializer(property_obj, data=request.data, partial=False)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Property updated successfully',
                    'property': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Partially update a property listing",
        request_body=PropertyDetailSerializer,
        responses={
            200: openapi.Response('Property updated successfully', PropertyDetailSerializer),
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Property not found'
        }
    )
    def patch(self, request, property_id):
        """
        Partially update an existing property
        """
        property_obj = get_object_or_404(Property, id=property_id)
        
        # Check permission
        if property_obj.agent != request.user:
            return Response(
                {'error': 'You do not have permission to edit this property'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PropertyDetailSerializer(property_obj, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Property updated successfully',
                    'property': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeletePropertyImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    @swagger_auto_schema(
        operation_description="Delete a property image",
        responses={
            200: 'Image deleted successfully',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Image not found'
        }
    )
    def delete(self, request, image_id):
        """
        Delete a specific property image
        """
        image = get_object_or_404(PropertyImage, id=image_id)
        
        # Check if the logged-in user owns the property
        if image.property.agent != request.user:
            return Response(
                {'error': 'You do not have permission to delete this image'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete the image file from storage
        if image.image:
            image.image.delete(save=False)
        
        # Delete the database record
        image.delete()
        
        return Response(
            {'message': 'Image deleted successfully'},
            status=status.HTTP_200_OK
        )

@csrf_exempt
@xframe_options_exempt
def login_view(request):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)

        user = UserBackend.authenticate(request, email=data.get('email'), password=data.get('password'))
        
        if user:
            refresh = RefreshToken.for_user(user)
    
            response = JsonResponse({
                'message': 'Login successful',
                'full_name': user.get_full_name() or user.email,
                'user_id': user.id,
                'email': user.email,
                'is_agent': getattr(user, 'agent_status', False)  # Use getattr for safety
            })
            
            response.set_cookie(
                'access_token', 
                str(refresh.access_token),
                httponly=True,
                secure=False,  # CHANGE to False for local development
                samesite='Lax',
                path='/',
                max_age=5000 * 60  # 5000 minutes in seconds
            )
            
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=False,  # CHANGE to False for local development
                samesite='Lax',
                path='/',
                max_age=86400  # 1 day in seconds
            )
            
            # Add CORS headers
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            
            return response
        
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt
def logout_view(request):
    response = JsonResponse({'message': 'Logged out successfully'})
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    
    # Add CORS headers
    response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response['Access-Control-Allow-Credentials'] = 'true'
    
    return response

# views.py
@csrf_exempt
def refresh_token_view(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Get refresh token from cookie
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return JsonResponse({'error': 'No refresh token'}, status=401)
    
    try:
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        
        response = JsonResponse({'message': 'Token refreshed'})
        
        # Set new access token cookie
        response.set_cookie(
            'access_token',
            new_access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/',
            max_age=5000 * 60
        )
        
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
        
    except Exception as e:
        return JsonResponse({'error': 'Invalid refresh token'}, status=401)
