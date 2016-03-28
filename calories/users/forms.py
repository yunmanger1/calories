from rest_framework import serializers
from rest_framework import validators

from . import models


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.User
        fields = ('id', 'name', 'username', 'daily_calories', 'is_superuser', 'is_manager', 'is_staff', 'email')
        read_only_fields = ('id', 'username', 'is_superuser', 'is_manager', 'is_staff')


class ManagerUserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(min_length=6, required=False)
    username = serializers.CharField(validators=[
        validators.UniqueValidator(models.User.objects.all())
    ])
    email = serializers.EmailField(validators=[
        validators.UniqueValidator(models.User.objects.all())
    ])

    class Meta:
        model = models.User
        fields = ('id', 'name', 'email', 'username', 'password', 'is_superuser', 'is_manager', 'is_staff')
        read_only_fields = ('is_superuser', 'is_manager', 'is_staff')

    def create(self, validated_data):
        new_password = self.validated_data.pop('password')
        user = super(ManagerUserSerializer, self).create(validated_data)
        if new_password:
            user.set_password(new_password)
            user.save()
        return user

    def update(self, instance, validated_data):
        new_password = self.validated_data.pop('password', None)
        user = super(ManagerUserSerializer, self).update(instance, validated_data)
        if new_password:
            user.set_password(new_password)
            user.save()
        return user


class AdminUserSerializer(ManagerUserSerializer):

    class Meta(ManagerUserSerializer.Meta):
        read_only_fields = ('is_superuser',)


class JWTSerializer(serializers.Serializer):
    """
    Serializer for JWT authentication.
    """
    token = serializers.CharField()
    user = UserSerializer()
