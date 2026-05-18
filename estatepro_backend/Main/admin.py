from django.contrib import admin
from .models import AgentApplication, AppUser, Property, PropertyImage
# Register your models here.
admin.site.register(AgentApplication)
admin.site.register(AppUser)
admin.site.register(Property)
admin.site.register(PropertyImage)