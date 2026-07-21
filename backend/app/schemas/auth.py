from pydantic import BaseModel, ConfigDict


class AdminLoginRequest(BaseModel):
    user_id: str
    institute_id: str
    phone: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str | None
    phone: str | None
    institute_id: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse