from typing import Optional, List
from pydantic import BaseModel, EmailStr


class SuperAdminLoginRequest(BaseModel):
    user_id: str
    password: str


class SuperAdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str = "SUPER_ADMIN"


class InstitutionLoginRequest(BaseModel):
    institute_id: str
    password: str


class InstitutionLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    institute_id: str
    name: str


class CreateInstitutionRequest(BaseModel):
    name: str                       # Institution Name
    institute_id: str               # Institution Code (e.g. INST001)
    institution_type: str           # University / College / Institute
    email: EmailStr                 # Official Email
    phone: str                      # Official Phone Number
    address: str                    # Address
    city: str                       # City
    state: str                      # State
    pincode: str                    # Postal code
    contact_person_name: str        # Main contact person
    contact_person_email: EmailStr  # Contact email
    contact_person_phone: str       # Contact phone
    password: str                   # Password for Institution Login


class InstitutionResponse(BaseModel):
    id: Optional[str] = None
    name: str
    institute_id: str
    institution_type: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    contact_person_name: str
    contact_person_email: str
    contact_person_phone: str
    status: str
    created_at: Optional[str] = None
    admin_count: Optional[int] = 0
    uploader_count: Optional[int] = 0


class UpdateInstitutionStatusRequest(BaseModel):
    status: str  # Active / Inactive


class CreateAdminRequest(BaseModel):
    user_id: str          # ID
    password: str         # Password
    phone: str            # Phone No
    institute_id: str     # Institute ID
    name: Optional[str] = "Admin User"
    email: Optional[str] = None


class CreateUploaderRequest(BaseModel):
    user_id: str          # ID
    password: str         # Password
    phone: str            # Phone No
    name: Optional[str] = "Uploader User"
    email: Optional[str] = None
    institute_id: Optional[str] = None


class CreatedAccountResponse(BaseModel):
    user_id: str
    name: str
    phone: Optional[str] = None
    institute_id: str
    role: str
    created_at: Optional[str] = None


from datetime import date

class CreateExamRequest(BaseModel):
    exam_code: str
    exam_date: date
    num_students: int
    institute_id: str
    name: Optional[str] = None


class ExamResponse(BaseModel):
    id: int
    exam_code: Optional[str] = None
    name: str
    exam_date: date
    num_students: Optional[int] = None
    institute_id: Optional[str] = None
    created_at: Optional[str] = None
