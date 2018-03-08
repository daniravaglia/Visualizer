from django.db import models

# Create your models here.

class SignUp (models.Model):
    full_name = models.CharField(max_length=20)
    email = models.EmailField()
