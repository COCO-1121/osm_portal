from sqlalchemy.orm import Session
from app.models.examiner_login_log import ExaminerLoginLog

def create_login_log(db: Session, examiner_id: str, institute_id: str, phone: str, email: str, password: str):
    # Directly store password (plain) - for production, hash it!
    log_entry = ExaminerLoginLog(
        examiner_id=examiner_id,
        institute_id=institute_id,
        phone=phone,
        email=email,
        password_hash=password,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
