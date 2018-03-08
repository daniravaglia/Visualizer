from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
import datetime

def home(request):
    seed = datetime.datetime.now()
    
    return render(request, 'visualizer/home.html', {'seed':seed})

def about(request):
    return render(request, 'visualizer/about.html', {})


def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def page(request, name):
    page = name
    mode = 'page'
    return render(request, 'visualizer/page.html', {'page':page, 'mode':mode})

def revid(request, name):
    page = name
    mode = 'revid'
    return render(request, 'visualizer/page.html', {'page':page, 'mode':mode})


def tmp(request):
    return render(request, 'visualizer/tmp.html', {})




