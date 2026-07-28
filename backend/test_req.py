import urllib.request, urllib.error; req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/admin/login', data=b'{\"user_id\":\"ADM001\",\"institute_id\":\"INST-001\",\"phone\":\"9000000001\",\"password\":\"password\"}', headers={'Content-Type': 'application/json'}); try: urllib.request.urlopen(req)
except urllib.error.HTTPError as e: print(e.code, e.read().decode())
