from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.responses import Response

from app.db.session import get_uploader_db
from app.models.uploader.scanned_document import ScannedDocument
from app.core.dependencies import get_current_user, require_uploader_role
from app.services.file_processor import FileProcessorService
from app.schemas.uploader.scanned_document import ScannedDocumentResponse

router = APIRouter(tags=["Uploader Workflow"])


@router.get("/uploader/scans", response_model=List[ScannedDocumentResponse])
def get_pending_scans(
    db: Session = Depends(get_uploader_db),
    current_user = Depends(require_uploader_role)
):
    """
    Get all pending scanned files from the database.
    Returns files with status 'Pending'.
    """
    scans = db.query(ScannedDocument).filter(
        ScannedDocument.status == "Pending"
    ).order_by(ScannedDocument.upload_time.desc()).all()
    
    return scans


@router.post("/uploader/upload/{scan_id}")
def mark_scan_uploaded(
    scan_id: int,
    db: Session = Depends(get_uploader_db),
    current_user = Depends(require_uploader_role)
):
    """
    Mark the selected scan as uploaded after successful processing.
    Updates status from 'Pending' to 'Uploaded'.
    """
    scan = db.query(ScannedDocument).filter(ScannedDocument.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if scan.status != "Pending":
        raise HTTPException(
            status_code=400, 
            detail=f"Scan cannot be uploaded. Current status: {scan.status}"
        )
    
    # Update status and uploader_id
    scan.status = "Uploaded"
    scan.uploader_id = current_user.id
    db.commit()
    db.refresh(scan)
    
    return {
        "message": "Scan marked as uploaded successfully",
        "scan_id": scan_id,
        "status": scan.status
    }


@router.get("/uploader/preview/{scan_id}")
def preview_scan(
    scan_id: int,
    db: Session = Depends(get_uploader_db),
    current_user = Depends(require_uploader_role)
):
    """
    Decrypt the file temporarily in memory and return it for preview.
    Files are decrypted in memory and never saved to disk.
    """
    scan = db.query(ScannedDocument).filter(ScannedDocument.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    try:
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(scan_id)
        
        # Determine content type
        content_type = scan.mime_type
        
        return Response(
            content=decrypted_content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename=\"{scan.original_filename}\"",
                "X-Encryption-Status": "Decrypted in memory only"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decrypt file: {str(e)}")


@router.get("/uploader/scans/all", response_model=List[ScannedDocumentResponse])
def get_all_scans(
    status: str = None,
    db: Session = Depends(get_uploader_db),
    current_user = Depends(require_uploader_role)
):
    """
    Get all scanned files, optionally filtered by status.
    """
    query = db.query(ScannedDocument)
    
    if status:
        query = query.filter(ScannedDocument.status == status)
    
    scans = query.order_by(ScannedDocument.upload_time.desc()).all()
    
    return scans


@router.post("/uploader/reject/{scan_id}")
def reject_scan(
    scan_id: int,
    db: Session = Depends(get_uploader_db),
    current_user = Depends(require_uploader_role)
):
    """
    Mark a scan as rejected.
    Updates status to 'Rejected'.
    """
    scan = db.query(ScannedDocument).filter(ScannedDocument.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan.status = "Rejected"
    db.commit()
    db.refresh(scan)
    
    return {
        "message": "Scan rejected successfully",
        "scan_id": scan_id,
        "status": scan.status
    }
