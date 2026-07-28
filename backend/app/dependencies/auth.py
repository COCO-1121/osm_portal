from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.utils.jwt import decode_access_token
from app.db.session import ExaminerSessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/examiner/auth/login")

def get_db():
    db = ExaminerSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_examiner(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(token)
        examiner_id: str = payload.get("sub")
        if examiner_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    examiner = db.query(User).filter(User.id == examiner_id).first()
    if examiner is None:
        raise HTTPException(status_code=401, detail="User not found")
    return examiner
