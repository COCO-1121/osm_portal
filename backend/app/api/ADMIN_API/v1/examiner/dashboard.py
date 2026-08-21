from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_examiner, get_db
from app.models.uploader.scanned_document import ScannedDocument

router = APIRouter(prefix="/api/v1/examiner/dashboard", tags=["Examiner Dashboard"])


from datetime import date
from app.db.session import get_uploader_db


@router.get("", response_model=dict)
@router.get("/", response_model=dict)
def get_dashboard(
    current_examiner = Depends(get_current_examiner),
    db: Session = Depends(get_uploader_db)
):
    all_documents = db.query(ScannedDocument).all()

    completed_docs = [d for d in all_documents if d.status in ["Completed", "Uploaded"]]
    rejected_docs = [d for d in all_documents if d.status == "Rejected"]
    ufm_docs = [d for d in all_documents if d.status == "UFM"]

    today_str = date.today().strftime("%Y-%m-%d")
    today_completed = [
        d for d in completed_docs 
        if d.upload_time and d.upload_time.strftime("%Y-%m-%d") == today_str
    ]

    assigned_subject_name = getattr(current_examiner, "assigned_subject", None) or "PHYSICS (048)"

    assigned_subjects = [
        {
            "id": 1,
            "code": "048",
            "name": assigned_subject_name,
            "available": len(all_documents) if len(all_documents) > 0 else 120,
            "completed": len(completed_docs),
            "rejected": len(rejected_docs),
            "ufm": len(ufm_docs)
        }
    ]

    return {
        "examiner_id": getattr(current_examiner, "user_id", None) or "EXM001",
        "name": getattr(current_examiner, "name", "Examiner"),
        "total_eval_completed": len(completed_docs),
        "today_eval_completed": len(today_completed),
        "assigned_subjects": assigned_subjects,
        "total_assigned": len(all_documents)
    }

@router.get("/assigned-copies")
def get_assigned_copies(
    current_examiner = Depends(get_current_examiner),
    db: Session = Depends(get_db)
):
    """
    Dedicated endpoint to fetch assigned copies for the logged-in examiner.
    """
    copies = db.query(ScannedDocument).filter(
        ScannedDocument.assigned_examiner_id == current_examiner.id,
        ScannedDocument.status == "ASSIGNED"
    ).all()

    return {
        "copies": copies,
        "count": len(copies)
    }
