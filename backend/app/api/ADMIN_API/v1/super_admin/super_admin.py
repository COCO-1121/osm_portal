from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import (
    AdminSessionLocal,
    ExaminerSessionLocal,
    UploaderSessionLocal,
    get_db,
)
from app.models.institution import Institution
from app.models.user import User
from app.models.role import Role
from app.schemas.institution import (
    CreateInstitutionRequest,
    InstitutionResponse,
    SuperAdminLoginRequest,
    SuperAdminLoginResponse,
    UpdateInstitutionStatusRequest,
)

router = APIRouter(
    prefix="/api/v1/super-admin",
    tags=["OSM Super Admin"],
)


@router.post("/login", response_model=SuperAdminLoginResponse)
def super_admin_login(
    credentials: SuperAdminLoginRequest,
    db: Session = Depends(get_db),
):
    """
    OSM Super Admin Login Endpoint.
    Validates Super Admin User ID and Password.
    """
    user = db.scalar(
        select(User).where(User.user_id == credentials.user_id)
    )

    # Check fallback default SUPERADMIN credentials if db record not found or password matches
    if credentials.user_id == "SUPERADMIN" and credentials.password == "SuperAdmin@123":
        access_token = create_access_token(
            subject="SUPERADMIN",
            role="SUPER_ADMIN",
            expires_delta=timedelta(minutes=480),
        )
        return SuperAdminLoginResponse(
            access_token=access_token,
            user_id="SUPERADMIN",
            name="OSM Super Administrator",
            role="SUPER_ADMIN",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Super Admin credentials.",
        )

    if user.role and user.role.name != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privilege required.",
        )

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Super Admin credentials.",
        )

    access_token = create_access_token(
        subject=str(user.id),
        role="SUPER_ADMIN",
        expires_delta=timedelta(minutes=480),
    )

    return SuperAdminLoginResponse(
        access_token=access_token,
        user_id=user.user_id,
        name=user.name,
        role="SUPER_ADMIN",
    )


def sync_institution_creation(inst_data: dict):
    """
    Saves created Institution across all active database sessions (Admin DB, Examiner DB, Uploader DB).
    """
    sessions = [
        ("Admin DB", AdminSessionLocal),
        ("Examiner DB", ExaminerSessionLocal),
        ("Uploader DB", UploaderSessionLocal),
    ]

    for name, session_factory in sessions:
        db = session_factory()
        try:
            existing = db.scalar(
                select(Institution).where(Institution.institute_id == inst_data["institute_id"])
            )
            if existing:
                db.close()
                continue

            inst = Institution(
                name=inst_data["name"],
                institute_id=inst_data["institute_id"],
                institution_type=inst_data["institution_type"],
                email=inst_data["email"],
                phone=inst_data["phone"],
                address=inst_data["address"],
                city=inst_data["city"],
                state=inst_data["state"],
                pincode=inst_data["pincode"],
                contact_person_name=inst_data["contact_person_name"],
                contact_person_email=inst_data["contact_person_email"],
                contact_person_phone=inst_data["contact_person_phone"],
                password_hash=hash_password(inst_data["password"]),
                status="Active",
                is_active=True,
            )
            db.add(inst)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[{name}] Sync Institution Error: {e}")
        finally:
            db.close()


@router.post("/institutions", response_model=InstitutionResponse)
def create_institution(
    payload: CreateInstitutionRequest,
    db: Session = Depends(get_db),
):
    """
    Super Admin Action: Create & Register Institution with full metadata.
    """
    code = payload.institute_id.strip()
    existing = db.scalar(
        select(Institution).where(Institution.institute_id == code)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Institution Code '{code}' already exists.",
        )

    inst_data = payload.dict()
    inst_data["institute_id"] = code

    sync_institution_creation(inst_data)

    return InstitutionResponse(
        name=payload.name,
        institute_id=code,
        institution_type=payload.institution_type,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        contact_person_name=payload.contact_person_name,
        contact_person_email=payload.contact_person_email,
        contact_person_phone=payload.contact_person_phone,
        status="Active",
        created_at=datetime.utcnow().isoformat(),
        admin_count=0,
        uploader_count=0,
    )


@router.get("/institutions", response_model=List[InstitutionResponse])
def list_institutions(
    db: Session = Depends(get_db),
):
    """
    Super Admin Action: Retrieve list of all registered institutions with metadata & child account metrics.
    """
    institutions = db.scalars(
        select(Institution).order_by(Institution.created_at.desc())
    ).all()

    result = []
    for inst in institutions:
        # Count Admins & Uploaders under this institution
        users = db.scalars(
            select(User).where(User.institute_id == inst.institute_id)
        ).all()

        admin_count = 0
        uploader_count = 0
        for u in users:
            r_name = u.role.name if u.role else ""
            if r_name == "ADMIN":
                admin_count += 1
            elif r_name == "UPLOADER":
                uploader_count += 1

        result.append(
            InstitutionResponse(
                id=str(inst.id),
                name=inst.name,
                institute_id=inst.institute_id,
                institution_type=inst.institution_type or "University",
                email=inst.email,
                phone=inst.phone,
                address=inst.address,
                city=inst.city,
                state=inst.state,
                pincode=inst.pincode,
                contact_person_name=inst.contact_person_name,
                contact_person_email=inst.contact_person_email,
                contact_person_phone=inst.contact_person_phone,
                status=inst.status or "Active",
                created_at=inst.created_at.isoformat() if inst.created_at else None,
                admin_count=admin_count,
                uploader_count=uploader_count,
            )
        )

    return result


@router.patch("/institutions/{institute_id}/status", response_model=InstitutionResponse)
def update_institution_status(
    institute_id: str,
    payload: UpdateInstitutionStatusRequest,
    db: Session = Depends(get_db),
):
    """
    Super Admin Action: Activate or Deactivate Institution.
    """
    inst = db.scalar(
        select(Institution).where(Institution.institute_id == institute_id)
    )
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution '{institute_id}' not found.",
        )

    inst.status = payload.status
    inst.is_active = (payload.status == "Active")
    db.commit()

    return InstitutionResponse(
        id=str(inst.id),
        name=inst.name,
        institute_id=inst.institute_id,
        institution_type=inst.institution_type,
        email=inst.email,
        phone=inst.phone,
        address=inst.address,
        city=inst.city,
        state=inst.state,
        pincode=inst.pincode,
        contact_person_name=inst.contact_person_name,
        contact_person_email=inst.contact_person_email,
        contact_person_phone=inst.contact_person_phone,
        status=inst.status,
        created_at=inst.created_at.isoformat() if inst.created_at else None,
        admin_count=0,
        uploader_count=0,
    )
