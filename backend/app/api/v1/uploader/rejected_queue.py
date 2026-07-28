from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_uploader_db
from app.models.uploader.scanned_document import ScannedDocument
from app.core.dependencies import require_uploader_role
from app.models.user import User

router = APIRouter(
    prefix="/api/rejected-queue",
    tags=["Rejected Queue"]
)

@router.get("/")
def get_rejected_documents(
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    documents = (
        db.query(ScannedDocument)
        .filter(ScannedDocument.status == "Rejected")
        .order_by(ScannedDocument.created_at.desc())
        .all()
    )

    result = []

    for doc in documents:
        result.append({
            "id": doc.id,
            "barcode": doc.barcode,
            "filename": doc.original_filename,
            "status": doc.status,
            "upload_time": doc.upload_time,
            "created_at": doc.created_at
        })

    return result