from test_plus.test import TestCase
from rest_framework.test import APITestCase

from django.core.urlresolvers import reverse
# from django.contrib.auth import get_user_model


from ..models import User


from .factories import UserFactory


class TestCRUDUsers(TestCase, APITestCase):

    def setUp(self):
        self.user = self.make_user('manager')
        self.user.is_staff=True
        self.user.is_manager=True
        self.user.save()
        self.users = UserFactory.create_batch(10)

    def test_get_list_of_records(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('users-list', kwargs={'version': 'v1'}))
        assert response.data['count'] == 10
        assert 'password' not in response.data['results'][0]


    def test_get_list_of_records_noauth(self):
        self.client.logout()
        response = self.client.get(reverse('users-list', kwargs={'version': 'v1'}))
        assert response.status_code == 401

    def test_create_update_delete(self):
        self.client.force_login(self.user)
        response = self.client.post(
            reverse('users-list', kwargs={'version': 'v1'}),
            data={
                "username": "Make",
                "name": "Meyrambek Zhaparov",
                "email": "make@ok.kz",
                "password": "123456"
            }
        )
        assert response.status_code == 201
        record_id = response.data['id']

        response = self.client.get(reverse('users-list', kwargs={'version': 'v1'}))
        assert response.data['count'] == 11

        assert User.objects.get(username="Make").check_password("123456") == True

        response = self.client.get(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}))
        assert response.status_code == 200
        assert response.data['username'] == 'Make'
        assert 'password' not in response.data

        response = self.client.patch(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}), data={
            "name": "Meyrambek"
        })
        assert response.status_code == 200
        assert response.data['name'] == 'Meyrambek'


        response = self.client.patch(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}), data={
            "username": "manager"
        })
        assert response.status_code == 400

        response = self.client.patch(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}), data={
            "username": "make"
        })
        assert response.status_code == 200

        response = self.client.patch(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}), data={
            "password": "12345678"
        })
        assert response.status_code == 200
        assert User.objects.get(username="make").check_password("12345678") == True

        response = self.client.get(reverse('users-list', kwargs={'version': 'v1'}), data={
            "search": "make"
        })
        assert response.status_code == 200
        assert response.data['count'] == 1

        response = self.client.delete(reverse('users-detail', kwargs={'version': 'v1', 'pk': record_id}))
        assert response.status_code == 204


class TestAdminUsers(TestCase, APITestCase):

    def setUp(self):
        self.user = self.make_user('superuser')
        self.user.is_staff=True
        self.user.is_superuser = True
        self.user.save()
        self.users = UserFactory.create_batch(10)
        self.users = UserFactory.create_batch(3, is_staff=True, is_manager=True)

    def test_get_list_of_managers(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('users-list', kwargs={'version': 'v1'}), data={'is_manager': 'true'})
        assert response.data['count'] == 3
