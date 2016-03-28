# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import


from django.db import models
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _


@python_2_unicode_compatible
class Record(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    title = models.CharField(max_length=100)
    calories = models.IntegerField()
    time = models.DateTimeField()

    def __str__(self):
        return self.title

