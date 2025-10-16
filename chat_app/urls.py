from django.urls import path
from . import views

# ---------------------------
# URL Configuration for Chat App
# ---------------------------
# This file maps specific URLs (routes) to their corresponding views (functions)
# Each path() call connects a route to a Django view defined in views.py

urlpatterns = [
    # Main chat page (GET: show page, POST: send message)
    path('', views.chat_view, name='chat'),

    # Route for resetting the chat history (AJAX POST)
    path('reset_chat/', views.reset_chat, name='reset_chat'),
]
