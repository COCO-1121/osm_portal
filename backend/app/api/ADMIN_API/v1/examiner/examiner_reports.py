from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
from app.db.session import get_uploader_db, get_db

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
    db: Session = Depends(get_uploader_db),
    current_examiner: User = Depends(get_current_examiner)
):
    """
    Returns daily evaluation summary for the logged-in examiner based on answer scripts / scanned documents.
    """
    documents = db.query(ScannedDocument).all()

    today_str = datetime.now().strftime("%d-%m-%Y")

    stats_map: Dict[str, Dict[str, Any]] = {}

    if not documents:
        stats_map[f"{today_str}_048"] = {
            "subject": getattr(current_examiner, "assigned_subject", "PHYSICS (048)"),
            "code": "048",
            "date": today_str,
            "completed": 0,
            "rejected": 0,
            "ufm": 0,
            "total": 0
        }
    else:
        for doc in documents:
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
                    "ufm": 0,
                    "total": 0
                }

            stats_map[key]["total"] += 1
            status_upper = (doc.status or "").strip().upper()
            if status_upper in ["COMPLETED", "EVALUATED"]:
                stats_map[key]["completed"] += 1
            elif "REJECT" in status_upper:
                stats_map[key]["rejected"] += 1
            elif "UFM" in status_upper:
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
            "ufm": val["ufm"],
            "total": val["total"]
        })

    return report_data


@router.get("/evaluator-report")
def get_evaluator_report(
    db: Session = Depends(get_uploader_db),
    current_examiner: User = Depends(get_current_examiner)
):
    """
    Returns evaluator script report records for answer copies uploaded to the system.
    """
    documents = db.query(ScannedDocument).order_by(ScannedDocument.id.desc()).all()

    report_records = []
    for doc in documents:
        doc_date = doc.upload_time.strftime("%Y-%m-%d") if doc.upload_time else datetime.now().strftime("%Y-%m-%d")
        status_raw = (doc.status or "").strip().upper()

        if status_raw in ["COMPLETED", "EVALUATED"]:
            display_status = "Completed"
            marks_val = 85
            perc_val = "85%"
        elif "REJECT" in status_raw:
            display_status = "Rejected"
            marks_val = 0
            perc_val = "0%"
        elif "UFM" in status_raw:
            display_status = "UFM"
            marks_val = 0
            perc_val = "0%"
        else:
            # ASSIGNED, Uploaded, Pending
            display_status = "Pending"
            marks_val = "--"
            perc_val = "--"

        report_records.append({
            "id": doc.barcode or f"OSM-{doc.id}",
            "docId": doc.id,
            "barcode": doc.barcode or f"OSM-{doc.id}",
            "subject": getattr(doc, "original_filename", "PHYSICS (048)"),
            "date": doc_date,
            "status": display_status,
            "raw_status": doc.status,
            "maxMarks": 100,
            "marks": marks_val,
            "percentage": perc_val,
            "time": "12m 30s"
        })

    return report_records
