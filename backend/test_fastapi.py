from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
response = client.post('/api/v1/auth/admin/login', json={'user_id':'ADM001', 'institute_id':'INST-001', 'phone':'9000000001', 'password':'password'})
print(response.status_code)
print(response.text)

