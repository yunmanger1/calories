# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.core.urlresolvers import reverse
from django.views.generic import DetailView, ListView, RedirectView, UpdateView

from django.contrib.auth.mixins import LoginRequiredMixin

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework import filters
import django_filters


from . import forms
from .models import User
from django.db.models import Q


class UserDetailView(LoginRequiredMixin, DetailView):
    model = User
    # These next two lines tell the view to index lookups by username
    slug_field = "username"
    slug_url_kwarg = "username"


class UserRedirectView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self):
        return reverse("users:detail",
                       kwargs={"username": self.request.user.username})


class UserUpdateView(LoginRequiredMixin, UpdateView):

    fields = ['name', ]

    # we already imported User in the view code above, remember?
    model = User

    # send the user back to their own page after a successful update
    def get_success_url(self):
        return reverse("users:detail",
                       kwargs={"username": self.request.user.username})

    def get_object(self):
        # Only get the User record for the user making the request
        return User.objects.get(username=self.request.user.username)


class UserListView(LoginRequiredMixin, ListView):
    model = User
    # These next two lines tell the view to index lookups by username
    slug_field = "username"
    slug_url_kwarg = "username"


def strtobool(sb):
    if sb.lower() == 'true':
        return True
    if sb.lower() == 'false':
        return False


class UserFilter(django_filters.FilterSet):
    is_manager = django_filters.TypedChoiceFilter(choices=[('true', 'true'), ('false', 'false')], coerce=strtobool)

    class Meta:
        model = User
        fields = ['is_manager',]


class UserViewSet(viewsets.ModelViewSet):

    serializer_class = forms.UserSerializer
    manager_serializer_class = forms.ManagerUserSerializer
    super_serializer_class = forms.AdminUserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter, filters.DjangoFilterBackend)
    filter_class = UserFilter
    ordering = 'username'
    search_fields = ('username', 'email', 'name')


    def get_serializer_class(self):
        if not self.request.user.is_authenticated():
            return self.serializer_class
        if self.request.user.is_staff and self.request.method.upper() in ("POST", "PATCH", "PUT"):
            if self.request.user.is_manager:
                return self.manager_serializer_class
            elif self.request.user.is_superuser:
                return self.super_serializer_class
        return self.serializer_class

    def get_queryset(self):
        if not self.request.user.is_authenticated():
            return User.objects.none()
        qs = User.objects.all()

        if self.request.user.is_manager:
            qs = qs.exclude(Q(is_staff=True) | Q(is_superuser=True))
        elif self.request.user.is_superuser:
            qs = qs.exclude(Q(is_superuser=True))
        else:
            qs = qs.filter(pk = self.request.user.id)

        return qs

    @list_route(methods=['get'])
    def me(self, request, version):
        return Response(forms.UserSerializer(self.request.user).data)


