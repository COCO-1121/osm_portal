from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_examiner, get_db
from app.models.uploader.scanned_document import ScannedDocument

router = APIRouter(prefix="/api/v1/examiner/dashboard", tags=["Examiner Dashboard"])


from datetime import date
from app.db.session import get_uploader_db
from app.models.user import User


@router.get("", response_model=dict)
@router.get("/", response_model=dict)
def get_dashboard(
    current_examiner = Depends(get_current_examiner),
    db: Session = Depends(get_uploader_db)
):
    all_documents = db.query(ScannedDocument).all()

    completed_docs = [d for d in all_documents if (d.status or "").strip().upper() in ["COMPLETED", "EVALUATED"]]
    rejected_docs = [d for d in all_documents if "REJECT" in (d.status or "").strip().upper()]
    ufm_docs = [d for d in all_documents if "UFM" in (d.status or "").strip().upper()]
    assigned_docs = [d for d in all_documents if (d.status or "").strip().upper() in ["ASSIGNED", "UPLOADED", "PENDING"]]

    today_str = date.today().strftime("%Y-%m-%d")
    today_completed = [
        d for d in completed_docs 
        if d.upload_time and d.upload_time.strftime("%Y-%m-%d") == today_str
    ]

    assigned_subject_name = getattr(current_examiner, "assigned_subject", None) or "PHYSICS (048)"

    # Determine first pending script barcode to allow instant Start navigation
    first_barcode = assigned_docs[0].barcode if assigned_docs else (all_documents[0].barcode if all_documents else "048")

    # Count scripts returned to examiner from Admin DB (both rejections & UFM)
    returned_count = len(rejected_docs)
    try:
        from app.db.session import AdminSessionLocal
        from app.models.answer_script import AnswerScript
        with AdminSessionLocal() as admin_db:
            db_returned = admin_db.query(AnswerScript).filter(
                AnswerScript.status == "RETURNED_TO_EXAMINER"
            ).count()
            if db_returned > 0:
                returned_count = db_returned
    except Exception:
        pass

    assigned_subjects = [
        {
            "id": 1,
            "code": "048",
            "first_barcode": first_barcode,
            "name": assigned_subject_name,
            "available": len(assigned_docs) if len(assigned_docs) > 0 else len(all_documents),
            "completed": len(completed_docs),
            "rejected": returned_count,
            "ufm": len(ufm_docs)
        }
    ]

    return {
        "examiner_id": getattr(current_examiner, "user_id", None) or "EXM001",
        "name": getattr(current_examiner, "name", "Examiner"),
        "total_eval_completed": len(completed_docs),
        "today_eval_completed": len(today_completed),
        "assigned_subjects": assigned_subjects,
        "total_assigned": len(assigned_docs) if len(assigned_docs) > 0 else len(all_documents)
    }

@router.get("/assigned-copies")
def get_assigned_copies(
    current_examiner = Depends(get_current_examiner),
    db: Session = Depends(get_uploader_db)
):
    """
    Dedicated endpoint to fetch assigned copies for the logged-in examiner.
    """
    # Find matching uploader DB user for this examiner
    uploader_examiner = db.query(User).filter(
        (User.id == current_examiner.id) | (User.user_id == current_examiner.user_id)
    ).first()
    target_id = uploader_examiner.id if uploader_examiner else current_examiner.id

    copies = db.query(ScannedDocument).filter(
        (ScannedDocument.assigned_examiner_id == target_id) | (ScannedDocument.assigned_examiner_id == current_examiner.id),
        ScannedDocument.status.in_(["ASSIGNED", "Uploaded", "Pending"])
    ).all()

    # If distribution assigned them generally, fallback to all available active copies
    if not copies:
        copies = db.query(ScannedDocument).filter(
            ScannedDocument.status.in_(["ASSIGNED", "Uploaded", "Pending"])
        ).all()

    formatted_copies = []
    for c in copies:
        formatted_copies.append({
            "id": c.id,
            "docId": c.id,
            "barcode": c.barcode or f"OSM-{c.id}",
            "original_filename": c.original_filename,
            "subject": getattr(c, "original_filename", "PHYSICS (048)"),
            "status": c.status,
            "upload_time": c.upload_time.isoformat() if c.upload_time else None
        })

    return {
        "copies": formatted_copies,
        "count": len(formatted_copies)
    }
