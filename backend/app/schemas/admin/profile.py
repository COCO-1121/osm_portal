from pydantic import BaseModel, EmailStr


class AdminProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    