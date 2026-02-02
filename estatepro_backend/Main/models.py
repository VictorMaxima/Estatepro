from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator

#create models here
class AppUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)

        # auto-fill username if not provided
        extra_fields.setdefault("username", email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        # sanity checks
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


AbstractUser._meta.get_field('email')._unique = True
AbstractUser._meta.get_field('username')._unique = False
class AppUser(AbstractUser):
    #user model
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['full_name',]
    backend = 'Main.views.UserBackend'
    full_name = models.CharField(max_length=500)
    agent_status = models.BooleanField(default=False)
    objects = AppUserManager()
    phone_number = models.CharField(blank=True, default='')
    referral_code = models.CharField(max_length=45, blank=True)
    invite_code = models.CharField(max_length=45, blank=True)
    

class AgentApplication(models.Model):
    agent = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="agent_application")
    full_name = models.CharField(max_length=500)
    phone_number = models.CharField(max_length=500)
    nin_number = models.CharField(max_length=11)
    years_of_experience = models.CharField(max_length=32)
    id_file = models.FileField(upload_to="id_files")
    license_file = models.FileField(upload_to="licence_files")

class ContactRequest(models.Model):
    name = models.CharField(max_length=500)
    email = models.EmailField()
    phone_number = models.CharField(max_length=400)
    message = models.TextField(blank=False)

class Property(models.Model):
    TYPECHOICES = (("sale", "Sale"), ("rent", "Rent"),("lease", "Lease"), ("shortLet","ShortLet"),("land", "Land"))
    STATUSCHOICES = (("available", "Available"), ("reserved", "Reserved"),("sold", "Sold"))
    title = models.CharField(max_length=33)
    agent = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="listings")
    description = models.TextField()
    status = models.CharField(max_length=44, choices=STATUSCHOICES, default="available")
    location = models.CharField(max_length=50)
    price = models.IntegerField(validators=[
            MinValueValidator(100),  # minimum value allowed
            MaxValueValidator(1000000000)  # maximum value allowed
        ])
    property_type = models.CharField(max_length=60, choices=TYPECHOICES)
    size = models.IntegerField(validators=[
            MinValueValidator(100),  # minimum value allowed
            MaxValueValidator(1000000000)  # maximum value allowed
        ])
    no_of_bedrooms = models.IntegerField(validators=[
            MinValueValidator(1),  # minimum value allowed
            MaxValueValidator(1000)  # maximum value allowed
        ])
    no_of_bathrooms = models.IntegerField(validators=[
            MinValueValidator(1),  # minimum value allowed
            MaxValueValidator(1000)  # maximum value allowed
        ])
    swimming_pool = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    borehole = models.BooleanField(default=False)
    gym = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    wifi = models.BooleanField(default=False)
    furnished = models.BooleanField(default=False)
    security = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    generator = models.BooleanField(default=False)
    serviced = models.BooleanField(default=False)
    slug = models.SlugField(blank=True, unique=True)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title + self.location + str(self.id))
        super().save( *args, **kwargs)

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="property_pictures")
    

    
