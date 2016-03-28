# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView
from django.views import defaults as default_views

import rest_framework_jwt.views
from rest_framework import routers

from calories.records.views import RecordViewSet, StatsView
from calories.users.views import UserViewSet


router = routers.DefaultRouter()
router.register(r'records', RecordViewSet, base_name='records')
router.register(r'users', UserViewSet, base_name='users')


import allauth.account.views


urlpatterns = [
    # url(r'^$', TemplateView.as_view(template_name='pages/home.html'), name="home"),
    # url(r'^about/$', TemplateView.as_view(template_name='pages/about.html'), name="about"),

    # Django Admin, use {% url 'admin:index' %}
    url(settings.ADMIN_URL, include(admin.site.urls)),

    # User management
    url(r'^(?P<version>(v1|v2))/', include(router.urls)),
    url(r'^v1/stats/', StatsView.as_view()),
    url(r'^users/', include("calories.users.urls", namespace="users")),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-token-auth/', rest_framework_jwt.views.obtain_jwt_token),
    url(r'^api-token-refresh/', rest_framework_jwt.views.refresh_jwt_token),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r"^accounts/confirm-email/(?P<key>\w+)/$", allauth.account.views.confirm_email, name="account_confirm_email"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from allauth import urls
if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        url(r'^400/$', default_views.bad_request, kwargs={'exception': Exception("Bad Request!")}),
        url(r'^403/$', default_views.permission_denied, kwargs={'exception': Exception("Permission Denied")}),
        url(r'^404/$', default_views.page_not_found, kwargs={'exception': Exception("Page not Found")}),
        url(r'^500/$', default_views.server_error),
    ]
