from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import LoginRequest


def login_user(db: Session, data: LoginRequest):

    user = db.query(User).filter(
        User.examiner_id == data.examiner_id,
        User.institute_id == data.institute_id,
        User.password == data.password,
        User.email == data.contact,
        User.dob == data.dob
    ).first()

    return user