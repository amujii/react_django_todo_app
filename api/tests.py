from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Task


class TaskApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.task1 = Task.objects.create(title="Test Task 1", completed=False)
        self.task2 = Task.objects.create(title="Test Task 2", completed=True)

    def test_api_overview(self):
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('List', response.data)

    def test_task_list(self):
        response = self.client.get('/api/task-list/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_task_detail(self):
        response = self.client.get(f'/api/task-detail/{self.task1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Task 1")

    def test_task_create(self):
        payload = {'title': 'New Created Task', 'completed': False}
        response = self.client.post('/api/task-create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 3)
        self.assertEqual(response.data['title'], 'New Created Task')

    def test_task_update(self):
        payload = {'title': 'Updated Title', 'completed': True}
        response = self.client.post(f'/api/task-update/{self.task1.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, 'Updated Title')
        self.assertTrue(self.task1.completed)

    def test_task_delete(self):
        response = self.client.delete(f'/api/task-delete/{self.task1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Task.objects.count(), 1)
