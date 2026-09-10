from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import (
    AdminSessionLocal,
    ExaminerSessionLocal,
    UploaderSessionLocal,
    get_db,
    get_uploader_db
)
from app.models.institution import Institution
from app.models.role import Role
from app.models.user import User
from app.schemas.institution import (
    CreateAdminRequest,
    CreateUploaderRequest,
    CreatedAccountResponse,
    InstitutionLoginRequest,
    InstitutionLoginResponse,
    CreateExamRequest,
    ExamResponse,
)
from app.models.uploader.exam import Exam

router = APIRouter(
    prefix="/api/v1/institution",
    tags=["Institution Management"],
)


@router.post("/login", response_model=InstitutionLoginResponse)
def institution_login(
    credentials: InstitutionLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Institution Login Endpoint.
    Validates Institute ID & Password against institutions table.
    """
    inst = db.scalar(
        select(Institution).where(Institution.institute_id == credentials.institute_id)
    )

    # Fallback default check for INST-001 if seed or db record matches
    if not inst:
        if credentials.institute_id == "INST-001" and credentials.password == "Inst@123":
            access_token = create_access_token(
                subject="INST-001",
                role="INSTITUTION",
                expires_delta=timedelta(minutes=480),
            )
            return InstitutionLoginResponse(
                access_token=access_token,
                institute_id="INST-001",
                name="Central Assessment Institution",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Institute ID or Password.",
        )

    if not verify_password(credentials.password, inst.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Institute ID or Password.",
        )

    if not inst.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institution account is inactive.",
        )

    access_token = create_access_token(
        subject=str(inst.id),
        role="INSTITUTION",
        expires_delta=timedelta(minutes=480),
    )

    return InstitutionLoginResponse(
        access_token=access_token,
        institute_id=inst.institute_id,
        name=inst.name,
    )


def sync_user_creation_across_databases(user_dict: dict, role_name: str):
    """
    Helper function to save new User across Admin, Examiner, and Uploader databases.
    Raises HTTPException if database creation fails due to unique constraint or other error.
    """
    sessions = [
        ("Admin DB", AdminSessionLocal),
        ("Examiner DB", ExaminerSessionLocal),
        ("Uploader DB", UploaderSessionLocal),
    ]

    errors = []
    for name, session_factory in sessions:
        db = session_factory()
        try:
            role = db.scalar(select(Role).where(Role.name == role_name))
            if not role:
                role = Role(name=role_name)
                db.add(role)
                db.flush()

            # Check existing user by user_id
            existing_user = db.scalar(
                select(User).where(User.user_id == user_dict["user_id"])
            )
            if existing_user:
                existing_user.name = user_dict["name"]
                existing_user.phone = user_dict["phone"]
                existing_user.institute_id = user_dict["institute_id"]
                existing_user.password_hash = hash_password(user_dict["password"])
                existing_user.role_id = role.id
                existing_user.is_active = True
                db.commit()
                continue

            # Check phone collision before inserting
            existing_phone_user = db.scalar(
                select(User).where(User.phone == user_dict["phone"])
            )
            if existing_phone_user:
                raise ValueError(
                    f"Phone number '{user_dict['phone']}' is already assigned to account '{existing_phone_user.user_id}'."
                )

            new_user = User(
                user_id=user_dict["user_id"],
                name=user_dict["name"],
                email=user_dict.get("email"),
                phone=user_dict["phone"],
                institute_id=user_dict["institute_id"],
                password_hash=hash_password(user_dict["password"]),
                role_id=role.id,
                is_active=True,
            )
            db.add(new_user)
            db.commit()
        except Exception as e:
            db.rollback()
            err_msg = str(e)
            print(f"[{name}] Sync User Error: {err_msg}")
            if "duplicate key" in err_msg or "users_phone_key" in err_msg or "already assigned" in err_msg:
                errors.append(f"Phone number '{user_dict['phone']}' is already registered for another account.")
            elif "users_user_id_key" in err_msg:
                errors.append(f"User ID '{user_dict['user_id']}' is already registered in the system.")
            else:
                errors.append(f"Database error on {name}: {err_msg}")
        finally:
            db.close()

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors[0],
        )


@router.post("/create-admin", response_model=CreatedAccountResponse)
def create_admin(
    payload: CreateAdminRequest,
    db: Session = Depends(get_db),
):
    """
    Institution Action: Create Admin Account
    Hierarchy parameters: ID + Password + Phone No + Institute ID
    """
    if not payload.user_id or not payload.password or not payload.phone or not payload.institute_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin creation requires ID, Password, Phone No, and Institute ID.",
        )

    user_dict = {
        "user_id": payload.user_id.strip(),
        "name": payload.name or f"Admin ({payload.user_id})",
        "email": payload.email,
        "phone": payload.phone.strip(),
        "institute_id": payload.institute_id.strip(),
        "password": payload.password,
    }

    sync_user_creation_across_databases(user_dict, "ADMIN")

    return CreatedAccountResponse(
        user_id=payload.user_id.strip(),
        name=user_dict["name"],
        phone=payload.phone.strip(),
        institute_id=payload.institute_id.strip(),
        role="ADMIN",
        created_at=datetime.utcnow().isoformat(),
    )


@router.post("/create-uploader", response_model=CreatedAccountResponse)
def create_uploader(
    payload: CreateUploaderRequest,
    db: Session = Depends(get_db),
):
    """
    Institution Action: Create Uploader Account
    Hierarchy parameters: ID + Password + Phone No
    """
    if not payload.user_id or not payload.password or not payload.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploader creation requires ID, Password, and Phone No.",
        )

    institute_id = payload.institute_id or "INST-001"

    user_dict = {
        "user_id": payload.user_id.strip(),
        "name": payload.name or f"Uploader ({payload.user_id})",
        "email": payload.email,
        "phone": payload.phone.strip(),
        "institute_id": institute_id.strip(),
        "password": payload.password,
    }

    sync_user_creation_across_databases(user_dict, "UPLOADER")

    return CreatedAccountResponse(
        user_id=payload.user_id.strip(),
        name=user_dict["name"],
        phone=payload.phone.strip(),
        institute_id=institute_id.strip(),
        role="UPLOADER",
        created_at=datetime.utcnow().isoformat(),
    )


@router.get("/accounts", response_model=List[CreatedAccountResponse])
def get_created_accounts(
    institute_id: str = "INST-001",
    db: Session = Depends(get_db),
):
    """
    Retrieve all Admin & Uploader accounts saved in the OSM Database for the given Institution.
    """
    users = db.scalars(
        select(User)
        .options(joinedload(User.role))
        .where(User.institute_id == institute_id)
        .order_by(User.created_at.desc())
    ).all()

    response = []
    for u in users:
        role_name = u.role.name if u.role else "USER"
        if role_name in ["ADMIN", "UPLOADER"]:
            response.append(
                CreatedAccountResponse(
                    user_id=u.user_id,
                    name=u.name,
                    phone=u.phone,
                    institute_id=u.institute_id,
                    role=role_name,
                    created_at=u.created_at.isoformat() if u.created_at else None,
                )
            )

    return response


@router.post("/create-exam", response_model=ExamResponse)
def create_exam(
    payload: CreateExamRequest,
    db: Session = Depends(get_uploader_db)
):
    """
    Institution Action: Create Exam
    """
    name = payload.name if payload.name else f"Exam: {payload.exam_code}"
    
    new_exam = Exam(
        name=name,
        exam_code=payload.exam_code,
        exam_date=payload.exam_date,
        num_students=payload.num_students,
        institute_id=payload.institute_id
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    
    return ExamResponse(
        id=new_exam.id,
        exam_code=new_exam.exam_code,
        name=new_exam.name,
        exam_date=new_exam.exam_date,
        num_students=new_exam.num_students,
        institute_id=new_exam.institute_id,
        created_at=new_exam.created_at.isoformat() if new_exam.created_at else None
    )


@router.get("/exams", response_model=List[ExamResponse])
def get_exams(
    institute_id: str,
    db: Session = Depends(get_uploader_db)
):
    """
    Retrieve all Exams for the given Institution.
    """
    exams = db.scalars(
        select(Exam)
        .where(Exam.institute_id == institute_id)
        .order_by(Exam.created_at.desc())
    ).all()

    return [
        ExamResponse(
            id=e.id,
            exam_code=e.exam_code,
            name=e.name,
            exam_date=e.exam_date,
            num_students=e.num_students,
            institute_id=e.institute_id,
            created_at=e.created_at.isoformat() if e.created_at else None
        ) for e in exams
    ]
