from pydantic import BaseModel, EmailStr

class ExaminerLoginLogCreate(BaseModel):
    examiner_id: str
    institute_id: str
    phone: str
    email: EmailStr
    password: str
