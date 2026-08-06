from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_examiner_db
from app.schemas.auth import LoginRequest
from app.services.auth_service import login_user

router = APIRouter(
    prefix="/api/v1/examiner/auth",
    tags=["Examiner Auth"],
)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_examiner_db)):

    user = login_user(db, data)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Login Details"
        )

    from app.utils.jwt import create_access_token
    from datetime import timedelta
    # Create JWT token with examiner_id as subject
    access_token = create_access_token({"sub": str(user.id)}, expires_delta=timedelta(minutes=30))
    return {
        "access_token": access_token,
        "message": "Login Successful",
        "examiner_id": user.user_id,
        "name": user.name,
        "institute_id": getattr(user, "institute_id", None) or "INST-001",
        "role": user.role.name if user.role else "EXAMINER",
    }