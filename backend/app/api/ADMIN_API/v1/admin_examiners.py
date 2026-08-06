from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db, get_examiner_db
from app.models.user import User
from app.models.role import Role
from app.schemas.examiner import (
    CreateExaminerRequest,
    UpdateExaminerRequest,
    ResetPasswordRequest,
    UpdateExaminerStatusRequest,
    ExaminerResponse,
)
from app.core.dependencies import require_admin
from app.core.security import hash_password
from app.utils.audit_logger import create_audit_log


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Examiner Management"],
)


@router.post(
    "/examiners",
    response_model=ExaminerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_examiner(
    payload: CreateExaminerRequest,
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    print("\n" + "=" * 50)
    print("[DEBUG] RECEIVED EXAMINER CREATION DATA")
    print(f"  - Login User ID: '{payload.user_id}'")
    print(f"  - Name:          '{payload.name}'")
    print(f"  - Email:         '{payload.email}'")
    print(f"  - Phone:         '{payload.phone}'")
    print(f"  - Password:      '{payload.password}'")
    print(f"  - Institute ID:  '{payload.institute_id or getattr(current_admin, 'institute_id', 'INST-001')}'")
    print("=" * 50 + "\n")

    # -----------------------------
    # Check duplicate Login User ID in osm_examiner
    # -----------------------------
    existing = examiner_db.scalar(
        select(User).where(
            User.user_id == payload.user_id
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Login User ID already exists.",
        )

    # -----------------------------
    # Check duplicate Email in osm_examiner
    # -----------------------------
    existing = examiner_db.scalar(
        select(User).where(
            User.email == payload.email
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    # -----------------------------
    # Check duplicate Phone in osm_examiner
    # -----------------------------
    existing = examiner_db.scalar(
        select(User).where(
            User.phone == payload.phone
        )
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already exists.",
        )

    # -----------------------------
    # Get EXAMINER role from osm_examiner
    # -----------------------------
    examiner_role = examiner_db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if examiner_role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="EXAMINER role not found.",
        )

    # -----------------------------
    # Create Examiner in osm_examiner
    # -----------------------------
    examiner_institute_id = payload.institute_id or getattr(current_admin, "institute_id", "INST-001")

    examiner = User(
        user_id=payload.user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        institute_id=examiner_institute_id,
        password_hash=hash_password(payload.password),
        role_id=examiner_role.id,
        managed_by_admin_id=None,
        is_active=True,
    )

    examiner_db.add(examiner)
    examiner_db.commit()
    examiner_db.refresh(examiner)

    # Log the action in admin db
    create_audit_log(
        db=db,
        admin=current_admin,
        action="Created Examiner",
        target=examiner.user_id,
    )

    return ExaminerResponse(
        id=str(examiner.id),
        user_id=examiner.user_id,
        name=examiner.name,
        email=examiner.email,
        phone=examiner.phone,
        institute_id=examiner.institute_id,
        is_active=examiner.is_active,
    )


@router.get(
    "/examiners",
    response_model=list[ExaminerResponse],
)
def get_examiners(
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner_role = examiner_db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if examiner_role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="EXAMINER role not found.",
        )

    examiners = (
        examiner_db.query(User)
        .filter(
            User.role_id == examiner_role.id,
            User.managed_by_admin_id == current_admin.id,
        )
        .order_by(User.user_id)
        .all()
    )

    return [
        ExaminerResponse(
            id=str(examiner.id),
            user_id=examiner.user_id,
            name=examiner.name,
            email=examiner.email,
            phone=examiner.phone,
            institute_id=examiner.institute_id,
            is_active=examiner.is_active,
        )
        for examiner in examiners
    ]

@router.get(
    "/examiners/{examiner_id}",
    response_model=ExaminerResponse,
)
def get_examiner_by_id(
    examiner_id: str,
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner = examiner_db.scalar(
        select(User).where(
            User.id == examiner_id
        )
    )

    if examiner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    examiner_role = examiner_db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if examiner.role_id != examiner_role.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    # Security check
    if examiner.managed_by_admin_id != current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this examiner.",
        )

    return ExaminerResponse(
        id=str(examiner.id),
        user_id=examiner.user_id,
        name=examiner.name,
        email=examiner.email,
        phone=examiner.phone,
        institute_id=examiner.institute_id,
        is_active=examiner.is_active,
    )
    
@router.put(
    "/examiners/{examiner_id}",
    response_model=ExaminerResponse,
)
def update_examiner(
    examiner_id: str,
    payload: UpdateExaminerRequest,
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner = examiner_db.scalar(
        select(User).where(
            User.id == examiner_id
        )
    )

    if examiner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    if examiner.managed_by_admin_id != current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this examiner.",
        )

    # -----------------------------
    # Uniqueness checks (only on modified fields)
    # -----------------------------
    if payload.user_id and payload.user_id != examiner.user_id:
        existing = examiner_db.scalar(
            select(User).where(
                User.user_id == payload.user_id,
                User.id != examiner.id,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Login User ID '{payload.user_id}' already exists.",
            )

    if payload.email and payload.email != examiner.email:
        existing = examiner_db.scalar(
            select(User).where(
                User.email == payload.email,
                User.id != examiner.id,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email address '{payload.email}' already exists.",
            )

    if payload.phone and payload.phone != examiner.phone:
        existing = examiner_db.scalar(
            select(User).where(
                User.phone == payload.phone,
                User.id != examiner.id,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Phone number '{payload.phone}' already exists.",
            )

    changes = []
    if payload.user_id and payload.user_id != examiner.user_id:
        changes.append(f"User ID: {examiner.user_id} -> {payload.user_id}")
    if payload.name and payload.name != examiner.name:
        changes.append(f"Name: {examiner.name} -> {payload.name}")
    if payload.email and payload.email != examiner.email:
        changes.append(f"Email: {examiner.email} -> {payload.email}")
    if payload.phone and payload.phone != examiner.phone:
        changes.append(f"Phone: {examiner.phone or 'N/A'} -> {payload.phone}")
    if payload.is_active is not None and payload.is_active != examiner.is_active:
        changes.append(f"Status: {'Active' if examiner.is_active else 'Inactive'} -> {'Active' if payload.is_active else 'Inactive'}")

    examiner.user_id = payload.user_id
    examiner.name = payload.name
    examiner.email = payload.email
    examiner.phone = payload.phone
    examiner.is_active = payload.is_active

    examiner_db.commit()
    examiner_db.refresh(examiner)

    if changes:
        target_details = f"{payload.user_id} ({', '.join(changes)})"
        if len(target_details) > 250:
            target_details = target_details[:247] + "..."
    else:
        target_details = payload.user_id

    create_audit_log(
        db=db,
        admin=current_admin,
        action="Updated Examiner",
        target=target_details,
    )

    return ExaminerResponse(
        id=str(examiner.id),
        user_id=examiner.user_id,
        name=examiner.name,
        email=examiner.email,
        phone=examiner.phone,
        institute_id=examiner.institute_id,
        is_active=examiner.is_active,
    )
    
@router.put(
    "/examiners/{examiner_id}/password",
    status_code=status.HTTP_200_OK,
)
def reset_examiner_password(
    examiner_id: str,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner = examiner_db.scalar(
        select(User).where(
            User.id == examiner_id
        )
    )

    if examiner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    if examiner.managed_by_admin_id != current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to reset this examiner's password.",
        )

    examiner.password_hash = hash_password(
        payload.password
    )

    examiner_db.commit()

    # Log the action
    create_audit_log(
        db=db,
        admin=current_admin,
        action="Password Reset",
        target=examiner.user_id,
    )

    return {
        "message": "Password reset successfully."
    }
    
@router.patch(
    "/examiners/{examiner_id}/status",
    response_model=ExaminerResponse,
)
def update_examiner_status(
    examiner_id: str,
    payload: UpdateExaminerStatusRequest,
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner = examiner_db.scalar(
        select(User).where(
            User.id == examiner_id
        )
    )

    if examiner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    if examiner.managed_by_admin_id != current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this examiner.",
        )

    examiner.is_active = payload.is_active

    examiner_db.commit()
    examiner_db.refresh(examiner)

    # Log the action
    action = "Activated Examiner" if payload.is_active else "Deactivated Examiner"
    create_audit_log(
        db=db,
        admin=current_admin,
        action=action,
        target=examiner.user_id,
    )

    return ExaminerResponse(
        id=str(examiner.id),
        user_id=examiner.user_id,
        name=examiner.name,
        email=examiner.email,
        phone=examiner.phone,
        institute_id=examiner.institute_id,
        is_active=examiner.is_active,
    )