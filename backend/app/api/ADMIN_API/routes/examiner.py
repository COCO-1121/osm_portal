from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.examiner_login_log import ExaminerLoginLogCreate
from app.services.examiner_login_service import create_login_log

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/examiner/login-log")
def log_examiner_login(data: ExaminerLoginLogCreate, db: Session = Depends(get_db)):
    try:
        entry = create_login_log(
            db,
            examiner_id=data.examiner_id,
            institute_id=data.institute_id,
            phone=data.phone,
            email=data.email,
            password=data.password,
        )
        return {"id": entry.id, "message": "Login logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
