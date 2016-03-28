from django.contrib.auth import get_user_model
from rest_framework import serializers

from . import models

User = get_user_model()


class RecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Record
        fields = ('id', 'title', 'calories', 'time')


class StaffRecordSerializer(serializers.ModelSerializer):

    user = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())

    class Meta:
        model = models.Record
        fields = ('id', 'title', 'calories', 'time', 'user')


class DailyRecordSerializer(serializers.Serializer):

    date = serializers.DateField
    records = RecordSerializer(many=True)


class QuerySerializer(serializers.Serializer):
    from_date = serializers.DateTimeField()
    to_date = serializers.DateTimeField()
    from_time = serializers.RegexField(regex='^\d{2}:\d{2}$')
    to_time = serializers.RegexField(regex='^\d{2}:\d{2}$')
    timezone = serializers.CharField()
