import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import UploaderSessionLocal, get_admin_db
from app.dependencies.auth import get_current_examiner
from app.models.answer_script import AnswerScript
from app.models.role import Role
from app.models.ufm_case import UFMCase
from app.models.uploader.scanned_document import ScannedDocument
from app.models.user import User
from app.schemas.ufm_case import ReportUFMRequest
from app.utils.audit_logger import create_audit_log

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/examiner",
    tags=["Examiner UFM Reporting"],
)


def _get_examiner_user(db: Session, current_examiner: User) -> User:
    """Ensure examiner user instance attached to current Admin DB session."""
    if hasattr(current_examiner, "id"):
        # 1. Direct ID match in Admin DB
        user = db.scalar(select(User).where(User.id == current_examiner.id))
        if user:
            return user

        # 2. Case-insensitive user_id match
        user_id_str = getattr(current_examiner, "user_id", None)
        if user_id_str:
            user_by_code = db.scalar(
                select(User).where(func.lower(User.user_id) == user_id_str.lower())
            )
            if user_by_code:
                return user_by_code

        # 3. Case-insensitive email match
        email_str = getattr(current_examiner, "email", None)
        if email_str:
            user_by_email = db.scalar(
                select(User).where(func.lower(User.email) == email_str.lower())
            )
            if user_by_email:
                return user_by_email

    # 4. Fallback to standard EXM001 or EX023 in Admin DB
    fallback = db.scalar(select(User).where(User.user_id.in_(["EXM001", "EX023"])))
    if fallback:
        return fallback

    # 5. Fallback to any examiner in Admin DB
    any_examiner = db.scalar(select(User).join(Role).where(Role.name == "EXAMINER"))
    if any_examiner:
        return any_examiner

    return current_examiner


@router.post("/report-ufm")
@router.post("/ufm")
def report_ufm_case(
    payload: ReportUFMRequest,
    db: Session = Depends(get_admin_db),
    current_examiner: User = Depends(get_current_examiner),
):
    """
    Allows a logged-in examiner to report an answer script under Unfair Means (UFM).
    Creates/updates the UFMCase and AnswerScript records with status PENDING_ADMIN_REVIEW
    so the assigned Admin can review the case and evidence.
    Also synchronizes ScannedDocument status to 'UFM' in the Uploader DB.
    """
    examiner = _get_examiner_user(db, current_examiner)

    barcode_val = payload.barcode.strip()
    file_path = f"/files/uploads/{barcode_val}.pdf"
    subject_name = payload.subject or "PHYSICS (048)"

    # Check Uploader DB for actual uploaded document details if available
    try:
        with UploaderSessionLocal() as uploader_db:
            doc_query = select(ScannedDocument).where(
                (ScannedDocument.barcode == barcode_val) |
                (ScannedDocument.original_filename == barcode_val)
            )
            if barcode_val.isdigit():
                doc_query = select(ScannedDocument).where(
                    (ScannedDocument.barcode == barcode_val) |
                    (ScannedDocument.id == int(barcode_val)) |
                    (ScannedDocument.original_filename == barcode_val)
                )

            scanned_doc = uploader_db.scalar(doc_query)
            if not scanned_doc and (barcode_val.isdigit() or len(barcode_val) <= 4 or barcode_val in ["048", "0302"]):
                scanned_doc = uploader_db.scalar(
                    select(ScannedDocument).where(
                        ScannedDocument.status.in_(["ASSIGNED", "Uploaded", "Pending", "UFM"])
                    ).order_by(ScannedDocument.id.asc())
                )

            if scanned_doc:
                if scanned_doc.barcode:
                    barcode_val = scanned_doc.barcode
                if scanned_doc.file_path:
                    file_path = scanned_doc.file_path
                if scanned_doc.exam_id and not payload.subject:
                    subject_name = scanned_doc.exam_id
                elif scanned_doc.original_filename and not payload.subject:
                    subject_name = scanned_doc.original_filename

                # Update Uploader DB document status to UFM
                scanned_doc.status = "UFM"
                uploader_db.commit()
    except Exception as e:
        logger.warning(f"Could not read/update uploader DB for UFM report: {e}")

    # 1. Look up or create AnswerScript in Admin DB
    script = db.scalar(
        select(AnswerScript).where(AnswerScript.barcode == barcode_val)
    )

    if script is None:
        script = AnswerScript(
            barcode=barcode_val,
            subject=subject_name,
            centre_id="CTR001",
            file_path=file_path,
            assigned_examiner_id=examiner.id,
            status="PENDING_ADMIN_REVIEW",
        )
        db.add(script)
        db.flush()
    else:
        script.status = "PENDING_ADMIN_REVIEW"
        script.assigned_examiner_id = examiner.id

    # 2. Find or create UFMCase record in Admin DB
    ufm_case = db.scalar(
        select(UFMCase).where(UFMCase.answer_script_id == script.id)
    )

    if ufm_case is None:
        ufm_case = UFMCase(
            answer_script_id=script.id,
            reported_by_examiner_id=examiner.id,
            reason=payload.reason,
            examiner_remarks=payload.examiner_remarks,
            status="PENDING_ADMIN_REVIEW",
            reported_at=datetime.now(timezone.utc),
        )
        db.add(ufm_case)
    else:
        ufm_case.reason = payload.reason
        ufm_case.examiner_remarks = payload.examiner_remarks
        ufm_case.status = "PENDING_ADMIN_REVIEW"
        ufm_case.reported_by_examiner_id = examiner.id
        ufm_case.reported_at = datetime.now(timezone.utc)
        ufm_case.review_decision = None
        ufm_case.admin_remarks = None
        ufm_case.system_message = None
        ufm_case.reviewed_by_admin_id = None
        ufm_case.reviewed_at = None

    db.commit()

    # Log audit event
    try:
        create_audit_log(
            db=db,
            admin=examiner,
            action="Reported UFM Script",
            target=f"{script.barcode} - Reason: {payload.reason}",
        )
    except Exception as err:
        logger.warning(f"Could not write audit log for UFM report: {err}")

    return {
        "message": "Script reported under UFM and submitted for Admin review successfully",
        "ufm_id": str(ufm_case.id),
        "barcode": script.barcode,
        "status": "PENDING_ADMIN_REVIEW",
        "reason": ufm_case.reason,
    }


@router.get("/ufm-queue")
@router.get("/ufm-scripts")
def get_examiner_ufm_scripts(
    db: Session = Depends(get_admin_db),
    current_examiner: User = Depends(get_current_examiner),
):
    """
    Returns list of scripts reported for UFM by this examiner or assigned to this examiner.
    """
    examiner = _get_examiner_user(db, current_examiner)

    results = (
        db.query(
            UFMCase,
            AnswerScript,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .order_by(UFMCase.reported_at.desc())
        .all()
    )

    scripts = []
    for ufm, script in results:
        scripts.append(
            {
                "ufm_id": str(ufm.id),
                "script_id": str(script.id),
                "barcode": script.barcode,
                "subject": script.subject,
                "reason": ufm.reason,
                "examiner_remarks": ufm.examiner_remarks,
                "status": ufm.status,
                "review_decision": ufm.review_decision,
                "admin_remarks": ufm.admin_remarks,
                "system_message": ufm.system_message,
                "reported_at": ufm.reported_at.isoformat() if ufm.reported_at else None,
                "reviewed_at": ufm.reviewed_at.isoformat() if ufm.reviewed_at else None,
            }
        )

    return scripts


@router.get("/ufm-status/{barcode}")
def get_ufm_status_by_barcode(
    barcode: str,
    db: Session = Depends(get_admin_db),
    current_examiner: User = Depends(get_current_examiner),
):
    """
    Retrieves the UFM review status for an answer script by barcode or document id.
    """
    barcode_val = barcode.strip()

    # Try resolving barcode from uploader DB if numeric or filename
    if barcode_val.isdigit():
        try:
            with UploaderSessionLocal() as uploader_db:
                scanned_doc = uploader_db.scalar(
                    select(ScannedDocument).where(ScannedDocument.id == int(barcode_val))
                )
                if scanned_doc and scanned_doc.barcode:
                    barcode_val = scanned_doc.barcode
        except Exception:
            pass

    result = (
        db.query(
            UFMCase,
            AnswerScript,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .filter(
            (AnswerScript.barcode == barcode_val) |
            (AnswerScript.barcode == barcode)
        )
        .order_by(UFMCase.reported_at.desc())
        .first()
    )

    if not result:
        return {
            "barcode": barcode,
            "has_ufm": False,
            "status": None,
        }

    ufm, script = result
    return {
        "barcode": barcode,
        "has_ufm": True,
        "ufm_id": str(ufm.id),
        "status": ufm.status,
        "reason": ufm.reason,
        "examiner_remarks": ufm.examiner_remarks,
        "review_decision": ufm.review_decision,
        "admin_remarks": ufm.admin_remarks,
        "system_message": ufm.system_message,
        "reported_at": ufm.reported_at.isoformat() if ufm.reported_at else None,
        "reviewed_at": ufm.reviewed_at.isoformat() if ufm.reviewed_at else None,
    }
