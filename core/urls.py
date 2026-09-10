from django.contrib import admin
# 1. Add 'include' to this import line
from django.urls import path, include 

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 2. Add this line so Django knows about your store pages
    path('', include('store.urls')), 
]