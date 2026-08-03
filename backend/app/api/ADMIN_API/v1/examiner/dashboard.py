from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_examiner

router = APIRouter(prefix="/examiner/dashboard", tags=["Examiner Dashboard"])

@router.get("/", response_model=dict)
def get_dashboard(current_examiner = Depends(get_current_examiner)):
    # Placeholder response – you can extend with real data later
    return {
        "examiner_id": str(current_examiner.id),
        "name": current_examiner.name,
        "assigned_subjects": [],
    }
