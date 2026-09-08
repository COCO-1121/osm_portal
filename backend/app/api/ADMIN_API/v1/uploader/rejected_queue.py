import io
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_uploader_db, AdminSessionLocal, UploaderSessionLocal
from app.models.uploader.scanned_document import ScannedDocument
from app.models.answer_script import AnswerScript
from app.models.script_rejection import ScriptRejection
from app.models.admin_review_action import AdminReviewAction
from app.core.dependencies import require_uploader_role
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/rejected-queue",
    tags=["Rejected Queue"]
)

@router.get("/")
@router.get("")
def get_rejected_documents(
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    # 1. Synchronize any returned scripts from Admin DB into Uploader DB
    admin_details = {}
    returned_barcodes = []
    try:
        with AdminSessionLocal() as admin_db:
            # Query all rejections returned to uploader or answer scripts marked returned
            admin_rejections = (
                admin_db.query(ScriptRejection, AnswerScript, AdminReviewAction)
                .join(AnswerScript, ScriptRejection.answer_script_id == AnswerScript.id)
                .outerjoin(AdminReviewAction, AdminReviewAction.rejection_id == ScriptRejection.id)
                .filter(
                    (ScriptRejection.status == "RETURNED_TO_UPLOADER") |
                    (AnswerScript.status == "RETURNED_TO_UPLOADER")
                )
                .all()
            )
            for rej, script, review in admin_rejections:
                if script.barcode:
                    returned_barcodes.append(script.barcode)
                    admin_details[script.barcode] = {
                        "reason": rej.reason or "Rejected by Examiner",
                        "examiner_remarks": rej.examiner_remarks,
                        "admin_remarks": review.admin_remarks if review else None,
                        "subject": script.subject or "Theory Examination",
                        "file_path": script.file_path,
                    }

            # Also ensure ScannedDocument in Uploader DB reflects status
            if returned_barcodes:
                stale_docs = db.query(ScannedDocument).filter(
                    ScannedDocument.barcode.in_(returned_barcodes),
                    ScannedDocument.status.notin_(["Rejected", "RETURNED_TO_UPLOADER"])
                ).all()
                for s_doc in stale_docs:
                    s_doc.status = "Rejected"
                if stale_docs:
                    db.commit()

    except Exception as err:
        logger.warning(f"Could not load admin rejection details: {err}")

    # 2. Query all rejected documents in Uploader DB
    documents = (
        db.query(ScannedDocument)
        .filter(ScannedDocument.status.in_(["Rejected", "RETURNED_TO_UPLOADER"]))
        .order_by(ScannedDocument.created_at.desc())
        .all()
    )

    seen_barcodes = set()
    result = []

    for doc in documents:
        bcode = doc.barcode or f"OSM-{doc.id}"
        seen_barcodes.add(bcode)
        info = admin_details.get(doc.barcode, {})
        result.append({
            "id": doc.id,
            "barcode": bcode,
            "filename": doc.original_filename,
            "subject": info.get("subject") or doc.original_filename or doc.exam_id or "Theory Examination",
            "reason": info.get("reason") or info.get("admin_remarks") or "Rejected by Admin",
            "admin_remarks": info.get("admin_remarks"),
            "examiner_remarks": info.get("examiner_remarks"),
            "status": doc.status,
            "upload_time": doc.upload_time,
            "created_at": doc.created_at
        })

    # 3. Include any returned scripts from Admin DB not yet tracked in Uploader DB
    for bcode, info in admin_details.items():
        if bcode not in seen_barcodes:
            result.append({
                "id": bcode,
                "barcode": bcode,
                "filename": info.get("subject", f"{bcode}.pdf"),
                "subject": info.get("subject", "Theory Examination"),
                "reason": info.get("reason") or info.get("admin_remarks") or "Rejected by Admin",
                "admin_remarks": info.get("admin_remarks"),
                "examiner_remarks": info.get("examiner_remarks"),
                "status": "Rejected",
                "upload_time": None,
                "created_at": None,
            })

    return result


@router.get("/{barcode}/preview")
@router.get("/by-barcode/{barcode}/preview")
def preview_rejected_document(
    barcode: str,
    db: Session = Depends(get_uploader_db),
    current_user: User = Depends(require_uploader_role),
):
    """
    Streams decrypted PDF for rejected document preview in the Uploader portal.
    """
    from app.services.file_processor import FileProcessorService

    # 1. Search in Uploader DB
    doc = db.query(ScannedDocument).filter(ScannedDocument.barcode == barcode).first()
    if doc:
        try:
            service = FileProcessorService(db)
            decrypted_bytes, orig_filename = service.get_decrypted_file(doc.id)
            return StreamingResponse(
                io.BytesIO(decrypted_bytes),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename=\"{orig_filename or barcode + '.pdf'}\"",
                    "X-File-Size": str(len(decrypted_bytes)),
                    "Access-Control-Expose-Headers": "Content-Disposition, X-File-Size",
                }
            )
        except Exception as e:
            logger.warning(f"Error decrypting doc {doc.id}: {e}")

    # 2. Check Admin DB AnswerScript file_path
    try:
        with AdminSessionLocal() as admin_db:
            script = admin_db.scalar(select(AnswerScript).where(AnswerScript.barcode == barcode))
            if script and script.file_path:
                p = Path(script.file_path)
                if not p.is_absolute():
                    for candidate_root in [Path("."), Path("backend"), Path("app/storage")]:
                        test_p = candidate_root / script.file_path.lstrip("/files/")
                        if test_p.exists():
                            p = test_p
                            break
                if p.exists() and p.is_file():
                    if p.name.endswith(".enc"):
                        from app.utils.encryption import get_encryption_util
                        enc_util = get_encryption_util()
                        decrypted_bytes = enc_util.decrypt_file(str(p))
                        return StreamingResponse(
                            io.BytesIO(decrypted_bytes),
                            media_type="application/pdf",
                            headers={
                                "Content-Disposition": f"inline; filename=\"{barcode}.pdf\"",
                                "X-File-Size": str(len(decrypted_bytes)),
                            }
                        )
                    else:
                        with open(p, "rb") as f:
                            content = f.read()
                        return StreamingResponse(
                            io.BytesIO(content),
                            media_type="application/pdf",
                            headers={
                                "Content-Disposition": f"inline; filename=\"{p.name}\"",
                                "X-File-Size": str(len(content)),
                            }
                        )
    except Exception as e:
        logger.warning(f"Error checking admin DB script: {e}")

    # 3. Fallback to storage uploads folder
    for fallback_path in [
        Path("app/storage/uploads") / f"{barcode}.pdf",
        Path("backend/app/storage/uploads") / f"{barcode}.pdf",
    ]:
        if fallback_path.exists() and fallback_path.is_file():
            with open(fallback_path, "rb") as f:
                content = f.read()
            return StreamingResponse(
                io.BytesIO(content),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename=\"{barcode}.pdf\"",
                    "X-File-Size": str(len(content)),
                }
            )

    raise HTTPException(status_code=404, detail="Preview PDF could not be found for this rejected script")
