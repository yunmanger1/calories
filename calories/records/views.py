# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.utils import timezone

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import filters

import django_filters

from . import forms
from .models import Record

from django.db import connection


class RecordFilter(filters.FilterSet):
    user = django_filters.CharFilter(name="user__username")
    from_date = django_filters.IsoDateTimeFilter(name="time", lookup_type='gte')
    to_date = django_filters.IsoDateTimeFilter(name="time", lookup_type='lte')

    class Meta:
        model = Record
        fields = ['user', 'from_date', 'to_date']


class RecordViewSet(viewsets.ModelViewSet):

    serializer_class = forms.RecordSerializer
    staff_serializer_class = forms.StaffRecordSerializer
    filter_class = RecordFilter

    permission_classes = (permissions.IsAuthenticated,)
    ordering = '-time'

    def get_serializer_class(self):
        if not self.request.user.is_authenticated():
            return self.serializer_class
        if self.request.user.is_staff:
            return self.staff_serializer_class
        return self.serializer_class

    def get_queryset(self):
        if not self.request.user.is_authenticated():
            return Record.objects.none()
        if self.request.user.is_superuser:
            qs = Record.objects.all()
        else:
            qs = Record.objects.filter(user=self.request.user)
        qs = qs.filter(time__lte=timezone.now()).select_related('user__username')
        return qs

    def perform_create(self, serializer):
        if self.request.user.is_authenticated() and self.request.user.is_superuser:
            serializer.save()
        else:
            serializer.save(user=self.request.user)


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


class StatsView(APIView):
    queryset = Record.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_data(self, user_id, query):
        zone_name = query['timezone']
        cursor = connection.cursor()
        sql = """
        select (r.time AT TIME ZONE '{tz}')::date as date, SUM(r.calories) as calories
        from records_record r
        where r.time between %s and %s
        and (r.time AT TIME ZONE '{tz}')::time between %s and %s
        and r.user_id = %s
        group by (r.time AT TIME ZONE '{tz}')::date
        ORDER BY date DESC
        """.format(tz=zone_name)
        cursor.execute(sql, [
            query['from_date'],
            query['to_date'],
            query['from_time'],
            query['to_time'],
            user_id
        ])

        return dictfetchall(cursor)

    def get(self, request, *args, **kw):
        serializer = forms.QuerySerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        result = self.get_data(self.request.user.pk, serializer.validated_data)
        return Response({
            "count": len(result),
            "next": None,
            "previous": None,
            "results": result
        }, status=status.HTTP_200_OK)
