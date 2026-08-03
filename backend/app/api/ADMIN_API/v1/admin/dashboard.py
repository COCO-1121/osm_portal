from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.profile import AdminProfileUpdate, ChangePasswordRequest
from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.script_rejection import ScriptRejection
from fastapi import HTTPException
from app.core.security import verify_password, hash_password


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"],
)


# ---------------------------------------------------------
# Get currently logged-in admin profile
# ---------------------------------------------------------
@router.get("/me")
def get_admin_profile(
    current_admin: User = Depends(require_admin),
):
    return {
        "id": str(current_admin.id),
        "user_id": current_admin.user_id,
        "name": current_admin.name,
        "email": current_admin.email,
        "phone": current_admin.phone,
        "institute_id": current_admin.institute_id,
        "role": current_admin.role.name,
        "is_active": current_admin.is_active,
    }

@router.put("/me")
def update_admin_profile(
    profile: AdminProfileUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    if profile.email and profile.email != current_admin.email:
        existing = db.query(User).filter(User.email == profile.email, User.id != current_admin.id).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Email address '{profile.email}' is already registered.")

    if profile.phone and profile.phone != current_admin.phone:
        existing = db.query(User).filter(User.phone == profile.phone, User.id != current_admin.id).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Phone number '{profile.phone}' is already registered.")

    current_admin.name = profile.name
    current_admin.email = profile.email
    current_admin.phone = profile.phone

    db.commit()
    db.refresh(current_admin)

    return {
        "id": str(current_admin.id),
        "user_id": current_admin.user_id,
        "name": current_admin.name,
        "email": current_admin.email,
        "phone": current_admin.phone,
        "institute_id": current_admin.institute_id,
        "role": current_admin.role.name,
        "is_active": current_admin.is_active,
    }
    
@router.put("/password")
def change_admin_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    if not verify_password(data.old_password, current_admin.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password.")

    if verify_password(data.new_password, current_admin.password_hash):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the existing password.")
    
    current_admin.password_hash = hash_password(data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
    
# ---------------------------------------------------------
# Get Admin Dashboard Statistics
# ---------------------------------------------------------
@router.get("/dashboard/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    # Scripts rejected today
    rejected_today = (
        db.query(func.count(ScriptRejection.id))
        .filter(
            func.date(ScriptRejection.rejected_at)
            == func.current_date()
        )
        .scalar()
        or 0
    )

    # Scripts awaiting admin review
    pending_review = (
        db.query(func.count(ScriptRejection.id))
        .filter(
            ScriptRejection.status == "PENDING_ADMIN_REVIEW"
        )
        .scalar()
        or 0
    )

    # Returned to uploader
    returned_to_uploader = (
        db.query(func.count(ScriptRejection.id))
        .filter(
            ScriptRejection.status == "RETURNED_TO_UPLOADER"
        )
        .scalar()
        or 0
    )

    # Returned to examiner
    returned_to_examiner = (
        db.query(func.count(ScriptRejection.id))
        .filter(
            ScriptRejection.status == "RETURNED_TO_EXAMINER"
        )
        .scalar()
        or 0
    )

    return {
        "rejected_today": rejected_today,
        "pending_review": pending_review,
        "returned_to_uploader": returned_to_uploader,
        "returned_to_examiner": returned_to_examiner,
    }

# ---------------------------------------------------------
# Get Admin Login History
# ---------------------------------------------------------
from app.models.login_history import LoginHistory
from app.schemas.login_history import PaginatedLoginHistoryResponse

@router.get("/login-history", response_model=PaginatedLoginHistoryResponse)
def get_admin_login_history(
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    offset = (page - 1) * size
    
    query = db.query(LoginHistory).filter(LoginHistory.user_id == current_admin.id)
    total = query.count()
    
    histories = query.order_by(LoginHistory.login_at.desc()).offset(offset).limit(size).all()
    
    import math
    pages = math.ceil(total / size) if total > 0 else 0
    
    return {
        "items": histories,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }