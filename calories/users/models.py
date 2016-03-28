# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

from django.contrib.auth.models import AbstractUser
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _


@python_2_unicode_compatible
class User(AbstractUser):

    name = models.CharField(_("Name of User"), blank=True, max_length=255)
    is_manager = models.BooleanField(default=False)
    daily_calories = models.IntegerField(default=2000)

    def __str__(self):
        return self.username

    def get_absolute_url(self):
        return reverse('users:detail', kwargs={'username': self.username})

    def save(self, *a, **kw):
        self.is_staff = self.is_manager or self.is_superuser or self.is_staff
        return super(User, self).save(*a, **kw)
