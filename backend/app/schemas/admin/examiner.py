from pydantic import BaseModel, EmailStr, Field


class CreateExaminerRequest(BaseModel):
    user_id: str = Field(..., min_length=4, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    dob: str | None = None
    institute_id: str | None = None

class UpdateExaminerRequest(BaseModel):
    user_id: str = Field(..., min_length=4, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    dob: str | None = None
    is_active: bool
    
    
class ExaminerResponse(BaseModel):
    id: str
    user_id: str
    name: str
    email: str
    phone: str
    dob: str | None = None
    institute_id: str | None = None
    is_active: bool

    class Config:
        from_attributes = True
        
class ResetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=8)
    
class UpdateExaminerStatusRequest(BaseModel):
    is_active: bool