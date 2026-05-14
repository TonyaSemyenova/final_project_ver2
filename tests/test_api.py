import unittest
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_health(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'ok')
    
    def test_get_furniture_types(self):
        response = self.app.get('/api/furniture/types')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('types', data)
        self.assertIsInstance(data['types'], list)
    
    def test_get_styles(self):
        response = self.app.get('/api/furniture/styles')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('styles', data)
        self.assertIsInstance(data['styles'], list)
    
    def test_search_params_empty(self):
        response = self.app.post('/api/search/params', json={})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('results', data)

if __name__ == '__main__':
    unittest.main()
