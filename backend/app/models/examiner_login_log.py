from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class ExaminerLoginLog(Base):
    __tablename__ = "examiner_login_logs"

    id = Column(Integer, primary_key=True, index=True)
    examiner_id = Column(String, nullable=False)
    institute_id = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)  # store hashed password
    created_at = Column(DateTime(timezone=True), server_default=func.now())
