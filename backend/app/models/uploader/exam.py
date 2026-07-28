from sqlalchemy import Column, Integer, String, Date, DateTime
from datetime import datetime
from app.db.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)     # e.g. "Mathematics Paper 1"
    exam_date = Column(Date, nullable=False, index=True)  # the date this exam is conducted on
    created_at = Column(DateTime, default=datetime.utcnow)