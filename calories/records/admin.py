# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.contrib import admin

from . import models


@admin.register(models.Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'calories', 'time')
    search_fields = ('title', 'user__name', 'user__username')
    date_hierarchy = 'time'
