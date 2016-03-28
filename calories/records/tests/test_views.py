from test_plus.test import TestCase
from rest_framework.test import APITestCase

from django.core.urlresolvers import reverse
from django.utils import timezone


from .factories import RecordFactory


class TestCRUDRecords(TestCase, APITestCase):

    def setUp(self):
        self.user = self.make_user()
        self.records = RecordFactory.create_batch(10, user=self.user)

    def test_get_list_of_records(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('records-list', kwargs={'version': 'v1'}))
        assert response.data['count'] == 10

    def test_get_list_of_records_noauth(self):
        self.client.logout()
        response = self.client.get(reverse('records-list', kwargs={'version': 'v1'}))
        assert response.status_code == 401

    def test_create_update_delete(self):
        self.client.force_login(self.user)
        response = self.client.post(
            reverse('records-list', kwargs={'version': 'v1'}),
            data={
                "title": "Apple",
                "calories": 300,
                "time": timezone.now().isoformat()
            }
        )
        assert response.status_code == 201
        record_id = response.data['id']

        response = self.client.get(reverse('records-list', kwargs={'version': 'v1'}))
        assert response.data['count'] == 11

        response = self.client.get(reverse('records-detail', kwargs={'version': 'v1', 'pk': record_id}))
        assert response.status_code == 200
        assert response.data['title'] == 'Apple'

        response = self.client.patch(reverse('records-detail', kwargs={'version': 'v1', 'pk': record_id}), data={
            "title": "Apple 2"
        })
        assert response.status_code == 200
        assert response.data['title'] == 'Apple 2'

        response = self.client.delete(reverse('records-detail', kwargs={'version': 'v1', 'pk': record_id}))
        assert response.status_code == 204
