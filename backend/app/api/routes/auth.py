from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.auth import LoginRequest
from app.services.auth_service import login_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = login_user(db, data)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Login Details"
        )

    return {
        "message": "Login Successful",
        "examiner_id": user.examiner_id,
        "name": user.name,
        "role": user.role
    }