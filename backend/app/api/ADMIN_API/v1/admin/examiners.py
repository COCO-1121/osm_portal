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
    print(f"  - Date of Birth: '{payload.dob}'")
    print(f"  - Password:      '{payload.password}'")
    print(f"  - Institute ID:  '{payload.institute_id or getattr(current_admin, 'institute_id', 'INST-001')}'")
    print("=" * 50 + "\n")

    # -----------------------------
    # Check duplicate User ID, Email, Phone across both DBs
    # -----------------------------
    for check_ssn in [examiner_db, db]:
        if check_ssn.scalar(select(User).where(User.user_id == payload.user_id)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Login User ID '{payload.user_id}' already exists.",
            )

        if check_ssn.scalar(select(User).where(User.email == payload.email)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email address '{payload.email}' already exists.",
            )

        if check_ssn.scalar(select(User).where(User.phone == payload.phone)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Phone number '{payload.phone}' already exists.",
            )

    # -----------------------------
    # Get EXAMINER role from both DBs
    # -----------------------------
    examiner_role = examiner_db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if examiner_role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="EXAMINER role not found in examiner DB.",
        )

    admin_examiner_role = db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if admin_examiner_role is None:
        # Create EXAMINER role in admin DB if missing
        admin_examiner_role = Role(name="EXAMINER", description="Examiner Role")
        db.add(admin_examiner_role)
        db.commit()
        db.refresh(admin_examiner_role)

    # -----------------------------
    # Create Examiner in both osm_examiner and osm_admin
    # -----------------------------
    examiner_institute_id = payload.institute_id or getattr(current_admin, "institute_id", "INST-001")
    hashed_pwd = hash_password(payload.password)

    examiner = User(
        user_id=payload.user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        dob=payload.dob,
        institute_id=examiner_institute_id,
        password_hash=hashed_pwd,
        role_id=examiner_role.id,
        managed_by_admin_id=None,
        is_active=True,
    )

    admin_examiner_record = User(
        user_id=payload.user_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        dob=payload.dob,
        institute_id=examiner_institute_id,
        password_hash=hashed_pwd,
        role_id=admin_examiner_role.id,
        managed_by_admin_id=current_admin.id,
        is_active=True,
    )

    try:
        examiner_db.add(examiner)
        examiner_db.commit()
        examiner_db.refresh(examiner)

        db.add(admin_examiner_record)
        db.commit()
    except Exception as e:
        examiner_db.rollback()
        db.rollback()
        print(f"[ERROR] Failed dual-DB examiner insert: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create examiner: {str(e)}",
        )

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
        dob=examiner.dob,
        institute_id=examiner.institute_id,
        is_active=examiner.is_active,
    )


@router.get(
    "/examiners",
    response_model=list[ExaminerResponse],
)
def get_examiners(
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    admin_examiner_role = db.scalar(
        select(Role).where(
            Role.name == "EXAMINER"
        )
    )

    if admin_examiner_role:
        examiners = (
            db.query(User)
            .filter(
                User.role_id == admin_examiner_role.id,
                User.managed_by_admin_id == current_admin.id,
            )
            .order_by(User.user_id)
            .all()
        )
    else:
        examiner_role = examiner_db.scalar(select(Role).where(Role.name == "EXAMINER"))
        if examiner_role is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="EXAMINER role not found.",
            )
        examiners = (
            examiner_db.query(User)
            .filter(User.role_id == examiner_role.id)
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
            dob=examiner.dob,
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
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    examiner = db.scalar(select(User).where(User.id == examiner_id))
    if examiner is None:
        examiner = examiner_db.scalar(select(User).where(User.id == examiner_id))

    if examiner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    return ExaminerResponse(
        id=str(examiner.id),
        user_id=examiner.user_id,
        name=examiner.name,
        email=examiner.email,
        phone=examiner.phone,
        dob=examiner.dob,
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
    db: Session = Depends(get_db),
    examiner_db: Session = Depends(get_examiner_db),
    current_admin: User = Depends(require_admin),
):
    admin_rec = db.scalar(select(User).where(User.id == examiner_id))
    exam_rec = examiner_db.scalar(select(User).where(User.id == examiner_id))

    if admin_rec is None and exam_rec is None:
        admin_rec = db.scalar(select(User).where(User.user_id == payload.user_id))
        exam_rec = examiner_db.scalar(select(User).where(User.user_id == payload.user_id))

    if admin_rec is None and exam_rec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    target_rec = admin_rec or exam_rec
    target_ids = [u.id for u in [admin_rec, exam_rec] if u]

    original_user_id = target_rec.user_id
    original_email = target_rec.email
    original_phone = target_rec.phone

    # Check duplicates in examiner_db and admin db ONLY for fields that were modified
    for check_ssn in [examiner_db, db]:
        if check_ssn:
            if payload.user_id and payload.user_id != original_user_id:
                existing = check_ssn.scalar(
                    select(User).where(
                        User.user_id == payload.user_id,
                        User.id.not_in(target_ids) if target_ids else True,
                    )
                )
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Login User ID '{payload.user_id}' already exists.",
                    )

            if payload.email and payload.email != original_email:
                existing = check_ssn.scalar(
                    select(User).where(
                        User.email == payload.email,
                        User.id.not_in(target_ids) if target_ids else True,
                    )
                )
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Email address '{payload.email}' already exists.",
                    )

            if payload.phone and payload.phone != original_phone:
                existing = check_ssn.scalar(
                    select(User).where(
                        User.phone == payload.phone,
                        User.id.not_in(target_ids) if target_ids else True,
                    )
                )
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Phone number '{payload.phone}' already exists.",
                    )

    target_rec = admin_rec or exam_rec

    changes = []
    if payload.user_id and payload.user_id != target_rec.user_id:
        changes.append(f"User ID: {target_rec.user_id} -> {payload.user_id}")
    if payload.name and payload.name != target_rec.name:
        changes.append(f"Name: {target_rec.name} -> {payload.name}")
    if payload.email and payload.email != target_rec.email:
        changes.append(f"Email: {target_rec.email} -> {payload.email}")
    if payload.phone and payload.phone != target_rec.phone:
        changes.append(f"Phone: {target_rec.phone or 'N/A'} -> {payload.phone}")
    if payload.dob and payload.dob != target_rec.dob:
        changes.append(f"DOB: {target_rec.dob or 'N/A'} -> {payload.dob}")
    if payload.is_active is not None and payload.is_active != target_rec.is_active:
        changes.append(f"Status: {'Active' if target_rec.is_active else 'Inactive'} -> {'Active' if payload.is_active else 'Inactive'}")

    for rec, ssn in [(admin_rec, db), (exam_rec, examiner_db)]:
        if rec and ssn:
            rec.user_id = payload.user_id
            rec.name = payload.name
            rec.email = payload.email
            rec.phone = payload.phone
            rec.dob = payload.dob
            rec.is_active = payload.is_active
            ssn.commit()

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
        id=str(target_rec.id),
        user_id=target_rec.user_id,
        name=target_rec.name,
        email=target_rec.email,
        phone=target_rec.phone,
        dob=target_rec.dob,
        institute_id=target_rec.institute_id,
        is_active=target_rec.is_active,
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
    admin_rec = db.scalar(select(User).where(User.id == examiner_id))
    exam_rec = examiner_db.scalar(select(User).where(User.id == examiner_id))

    if admin_rec is None and exam_rec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    target_rec = admin_rec or exam_rec
    if target_rec and target_rec.password_hash:
        from app.core.security import verify_password
        if verify_password(payload.password, target_rec.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password cannot be the same as the existing password.",
            )

    new_pwd_hash = hash_password(payload.password)

    if admin_rec:
        admin_rec.password_hash = new_pwd_hash
        db.commit()
    if exam_rec:
        exam_rec.password_hash = new_pwd_hash
        examiner_db.commit()

    target_user_id = (admin_rec or exam_rec).user_id
    create_audit_log(
        db=db,
        admin=current_admin,
        action="Password Reset",
        target=target_user_id,
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
    admin_rec = db.scalar(select(User).where(User.id == examiner_id))
    exam_rec = examiner_db.scalar(select(User).where(User.id == examiner_id))

    if admin_rec is None and exam_rec is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examiner not found.",
        )

    if admin_rec:
        admin_rec.is_active = payload.is_active
        db.commit()
        db.refresh(admin_rec)
    if exam_rec:
        exam_rec.is_active = payload.is_active
        examiner_db.commit()
        examiner_db.refresh(exam_rec)

    target_rec = admin_rec or exam_rec
    action = "Activated Examiner" if payload.is_active else "Deactivated Examiner"
    create_audit_log(
        db=db,
        admin=current_admin,
        action=action,
        target=target_rec.user_id,
    )

    return ExaminerResponse(
        id=str(target_rec.id),
        user_id=target_rec.user_id,
        name=target_rec.name,
        email=target_rec.email,
        phone=target_rec.phone,
        dob=target_rec.dob,
        institute_id=target_rec.institute_id,
        is_active=target_rec.is_active,
    )