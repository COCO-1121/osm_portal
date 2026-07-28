from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date as date_type
from typing import Optional
from pydantic import BaseModel

from app.db.session import get_uploader_db
from app.models.uploader.exam import Exam
from app.core.dependencies import require_uploader_role
from app.models.user import User

router = APIRouter(prefix="/api/exams", tags=["Exams"])


class ExamCreate(BaseModel):
    name: str
    exam_date: date_type


class ExamResponse(BaseModel):
    id: int
    name: str
    exam_date: date_type

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ExamResponse])
def list_exams(
    date: Optional[date_type] = None,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    List exams. If `date` is provided (YYYY-MM-DD), only exams conducted
    on that date are returned - this powers the "Select Exam" dropdown
    on the uploader dashboard, which only shows exams matching the
    selected date.
    """
    query = db.query(Exam)
    if date:
        query = query.filter(Exam.exam_date == date)
    return query.order_by(Exam.name).all()


@router.post("/", response_model=ExamResponse)
def create_exam(
    exam: ExamCreate,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Create a new exam (name + date). Use this to add exams so they show
    up in the dashboard's date-filtered dropdown.
    """
    new_exam = Exam(name=exam.name, exam_date=exam.exam_date)
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    return new_exam