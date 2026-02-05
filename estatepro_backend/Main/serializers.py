from rest_framework import serializers
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AppUser, AgentApplication, ContactRequest, Property, PropertyImage

class LoginSerializer(serializers.ModelSerializer):
    #serializer for logging in
    password = serializers.CharField(write_only=True)
    class Meta:
        model = AppUser
        fields = ['email', 'password']


class RegisterSerializer(serializers.ModelSerializer):
    #serializer for creating users
    password = serializers.CharField(write_only=True)

    class Meta:
        model = AppUser
        fields = ['full_name', 'email', 'password']

    def create(self, validated_data):
        user = AppUser.objects.create_user(
            username=validated_data['full_name'],
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            password=validated_data['password'],
      # Inactive until verified
            is_active=True
        )
        self.send_verification_email(user)
        return user

    def send_verification_email(self, user):
        token = RefreshToken.for_user(user).access_token
        current_site = get_current_site(self.context['request']).domain
        relative_link = reverse('email-verify')
        absurl = f'http://{current_site}{relative_link}?token={str(token)}'
        subject = 'Verify your email'
        message = f'Hi {user.first_name} Click the link to verify your account: {absurl}'
        #send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['name', 'email', 'phone_number', 'message'] 

class CreateAgentApplySerializer(serializers.ModelSerializer):
    id_file = serializers.FileField(required=True)
    license_file = serializers.FileField(required=True)

    class Meta:
        model = AgentApplication
        fields = ['full_name', 'phone_number', "nin_number", "years_of_experience", 'id_file', "license_file"]

class ApplicationListSerializer(serializers.ModelSerializer):
    id_file_url = serializers.SerializerMethodField()
    license_file_url = serializers.SerializerMethodField()
    class Meta:
        model = AgentApplication
        fields = '__all__'

    def get_id_file_url(self, obj):
        return self._build_file_url(obj.id_file)

    def get_license_file_url(self, obj):
        return self._build_file_url(obj.license_file)

    def _build_file_url(self, file_field):
        request = self.context.get("request")
        if not file_field:
            return None
        if request:
            return request.build_absolute_uri(file_field.url)
        return file_field.url

class CreatePropertyListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['title', 'description','location','price','property_type', 'size', 'no_of_bedrooms','no_of_bathrooms',
                  'swimming_pool', 'parking', 'air_conditioning', 'borehole', 'gym', 'garden', 'wifi', 'furnished', 'balcony', 'generator', 'serviced']
        
class CreatePropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=True)
    class Meta:
        model = PropertyImage
        fields = ['image']

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

class ListAgentPropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ['title', 'description','location','price','property_type', 'size', 'no_of_bedrooms','no_of_bathrooms',
                  'swimming_pool', 'parking', 'air_conditioning', 'borehole', 'gym', 'garden', 'wifi', 'furnished', 'balcony', 'generator', 'serviced',
                  'images', 'slug']

class ListPropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ['title', 'description','location','price','property_type', 'size', 'no_of_bedrooms','no_of_bathrooms',
                  'slug','images', ]

class AgentDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppUser
        fields = ["full_name", "phone_number", "email"]

class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentDetailSerializer(read_only=True)

    class Meta:
        model = Property
        fields = ['agent','title', 'description','location','price','property_type', 'size', 'no_of_bedrooms','no_of_bathrooms',
                  'swimming_pool', 'parking', 'air_conditioning', 'borehole', 'gym', 'garden', 'wifi', 'furnished', 'balcony', 'generator', 'serviced',
                  'images', 'status']
