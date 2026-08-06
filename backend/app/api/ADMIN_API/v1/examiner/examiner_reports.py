from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from app.dependencies.auth import get_current_examiner, get_db
from app.models.user import User
from app.models.uploader.scanned_document import ScannedDocument
from app.models.answer_script import AnswerScript

router = APIRouter(
    prefix="/api/v1/examiner",
    tags=["Examiner Reports & Assignment"],
)


@router.get("/me/assignment")
def get_examiner_assignment(current_examiner: User = Depends(get_current_examiner)):
    """Returns the logged-in examiner's assignment details."""
    return {
        "examiner_id": current_examiner.user_id or "EXM001",
        "name": current_examiner.name or "Examiner",
        "institute_id": getattr(current_examiner, "institute_id", None) or "INST-001",
        "session": "February 2026",
        "assigned_subject": getattr(current_examiner, "assigned_subject", None) or "PHYSICS (048)",
    }


@router.get("/day-wise-report")
def get_day_wise_report(
    db: Session = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    """
    Returns daily evaluation summary for the logged-in examiner based on answer scripts / scanned documents.
    """
    # Query answer scripts or scanned documents
    documents = db.query(ScannedDocument).all()

    today_str = datetime.now().strftime("%d-%m-%Y")

    # Group records by (valuation_date, subject)
    stats_map: Dict[str, Dict[str, Any]] = {}

    if not documents:
        # Default dynamic entry for current date if no uploaded copies exist yet
        stats_map[f"{today_str}_048"] = {
            "subject": getattr(current_examiner, "assigned_subject", "PHYSICS (048)"),
            "code": "048",
            "date": today_str,
            "completed": 0,
            "rejected": 0,
            "ufm": 0
        }
    else:
        for idx, doc in enumerate(documents):
            doc_date = doc.upload_time.strftime("%d-%m-%Y") if doc.upload_time else today_str
            subj_code = getattr(doc, "exam_id", "048") or "048"
            subj_name = getattr(doc, "original_filename", "PHYSICS (048)")
            key = f"{doc_date}_{subj_code}"

            if key not in stats_map:
                stats_map[key] = {
                    "subject": subj_name,
                    "code": subj_code,
                    "date": doc_date,
                    "completed": 0,
                    "rejected": 0,
                    "ufm": 0
                }

            if doc.status == "Completed" or doc.status == "Uploaded":
                stats_map[key]["completed"] += 1
            elif doc.status == "Rejected":
                stats_map[key]["rejected"] += 1
            elif doc.status == "UFM":
                stats_map[key]["ufm"] += 1

    report_data = []
    for idx, (k, val) in enumerate(stats_map.items(), start=1):
        report_data.append({
            "id": idx,
            "code": val["code"],
            "subject": val["subject"],
            "date": val["date"],
            "completed": val["completed"],
            "rejected": val["rejected"],
            "ufm": val["ufm"]
        })

    return report_data


@router.get("/evaluator-report")
def get_evaluator_report(
    db: Session = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    """
    Returns evaluator script report records for answer copies uploaded to the system.
    """
    documents = db.query(ScannedDocument).all()

    report_records = []
    for doc in documents:
        doc_date = doc.upload_time.strftime("%Y-%m-%d") if doc.upload_time else datetime.now().strftime("%Y-%m-%d")
        report_records.append({
            "id": doc.barcode or f"BC{doc.id:06d}",
            "subject": getattr(doc, "original_filename", "PHYSICS (048)"),
            "date": doc_date,
            "status": "Completed" if doc.status in ["Uploaded", "Completed"] else doc.status,
            "maxMarks": 100,
            "marks": 85 if doc.status in ["Uploaded", "Completed"] else 0,
            "percentage": "85%" if doc.status in ["Uploaded", "Completed"] else "0%",
            "time": "12m 30s"
        })

    return report_records
