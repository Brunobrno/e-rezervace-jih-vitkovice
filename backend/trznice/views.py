from django.shortcuts import render, redirect


def index(request):
    return render(request, "html/index.html", context={'user': request.user})

