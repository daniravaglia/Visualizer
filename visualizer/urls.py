from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('home/', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('tmp/', views.tmp, name='tmp'),
    path('home/search:<str:name>/', views.page),
    path('home/revid:<str:name>/', views.revid),
    path('login/', auth_views.login, name='login'),
    
]
