from pydantic import BaseModel
from datetime import date

class LoginRequest(BaseModel):
    examiner_id: str
    institute_id: str
    password: str
    dob: date
    contact: str