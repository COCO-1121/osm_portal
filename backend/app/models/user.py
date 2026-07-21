from sqlalchemy import Column, Integer, String, Date
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    examiner_id = Column(String, unique=True, nullable=False)

    institute_id = Column(String, nullable=False)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    dob = Column(Date, nullable=False)

    role = Column(String, default="Examiner")