from rest_framework import serializers
from .models import User, Analysis, Dataset

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AnalysisSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Analysis
        fields = '__all__'
        read_only_fields = ('user', 'status', 'result', 'created_at', 'updated_at', 'preview_image')

class DatasetSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'created_at')
