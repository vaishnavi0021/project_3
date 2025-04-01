from django.shortcuts import get_object_or_404
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import models
from django.conf import settings
from django.core.files.storage import FileSystemStorage
import os

# Models
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)

class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    upload_date = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=50)

# Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'

# Views
class FileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        file = self.request.FILES['file']
        ext = file.name.split('.')[-1].lower()
        file_type = 'PDF' if ext == 'pdf' else 'Excel' if ext in ['xls','xlsx'] else 'Word' if ext in ['doc','docx'] else 'Other'
        serializer.save(user=self.request.user, file_type=file_type)

class AuthView(APIView):
    def post(self, request):
        user = get_object_or_404(User, username=request.data['username'])
        if not user.check_password(request.data['password']):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"token": "generated-jwt-token", "user": UserSerializer(user).data})

# URLs (Conceptual)
"""
urlpatterns = [
    path('api/auth/', AuthView.as_view()),
    path('api/files/', FileViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('api/files/<int:pk>/', FileViewSet.as_view({'delete': 'destroy'})),
]
"""