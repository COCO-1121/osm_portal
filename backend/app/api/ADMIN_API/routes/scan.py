import os
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_uploader_db
from app.models.uploader.scanned_document import ScannedDocument
from app.services.scan_service import scan_service

router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("/trigger")
async def trigger_scan():
    """Triggers the scanner. In simulated mode, it places a dummy PDF in the folder."""
    doc = await scan_service.trigger_scan()
    if not doc:
        raise HTTPException(status_code=500, detail="Scan simulation failed to register file")
    return {
        "id": doc.id,
        "filename": doc.original_filename,
        "mime_type": doc.mime_type,
        "created_at": doc.created_at
    }


@router.get("/documents")
def get_scanned_documents(db: Session = Depends(get_uploader_db)):
    """Fetches all scanned documents that are ready for upload (status='scanned' or 'Pending')."""
    docs = (
        db.query(ScannedDocument)
        .filter(ScannedDocument.status.in_(["scanned", "Pending"]))
        .order_by(ScannedDocument.created_at.desc())
        .all()
    )
    return [
        {
            "id": doc.id,
            "filename": doc.original_filename,
            "mime_type": doc.mime_type,
            "created_at": doc.created_at
        }
        for doc in docs
    ]


@router.get("/documents/{doc_id}/view")
def view_scanned_document(doc_id: int, db: Session = Depends(get_uploader_db)):
    """Decrypts a document temporarily in memory and streams it as normal PDF/image."""
    doc = db.query(ScannedDocument).filter(ScannedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document record not found in database")
        
    file_path = os.path.join(scan_service.scan_dir, doc.encrypted_filename or doc.original_filename)
    if not os.path.exists(file_path):
        file_path = doc.file_path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Encrypted file not found on disk")
        
    try:
        with open(file_path, "rb") as f:
            encrypted_data = f.read()
        
        decrypted_data = scan_service.decrypt_data(encrypted_data)
        
        # Stream from memory directly
        return StreamingResponse(
            BytesIO(decrypted_data),
            media_type=doc.mime_type,
            headers={
                "Content-Disposition": f"inline; filename={doc.original_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")


@router.post("/documents/{doc_id}/upload")
def upload_scanned_document(doc_id: int, db: Session = Depends(get_uploader_db)):
    """Decrypts the document and saves it in the backend's standard uploads storage folder."""
    doc = db.query(ScannedDocument).filter(ScannedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    file_path = os.path.join(scan_service.scan_dir, doc.encrypted_filename or doc.original_filename)
    if not os.path.exists(file_path):
        file_path = doc.file_path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Encrypted file not found on disk")
        
    try:
        with open(file_path, "rb") as f:
            encrypted_data = f.read()
            
        decrypted_data = scan_service.decrypt_data(encrypted_data)
        
        # Determine standard uploads directory: backend/app/storage/uploads
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        uploads_dir = os.path.join(backend_root, "app", "storage", "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        dest_path = os.path.join(uploads_dir, doc.original_filename)
        with open(dest_path, "wb") as f:
            f.write(decrypted_data)
            
        # Update status and commit
        doc.status = "Uploaded"
        db.commit()
        
        return {"status": "success", "message": f"Document {doc.original_filename} uploaded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload-all")
def upload_all_documents(db: Session = Depends(get_uploader_db)):
    """Decrypts and uploads all scanned documents at once."""
    docs = db.query(ScannedDocument).filter(ScannedDocument.status.in_(["scanned", "Pending"])).all()
    if not docs:
        return {"status": "success", "message": "No pending documents to upload", "uploaded_count": 0}
        
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
    uploads_dir = os.path.join(backend_root, "app", "storage", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    uploaded_count = 0
    errors = []
    
    for doc in docs:
        file_path = os.path.join(scan_service.scan_dir, doc.encrypted_filename or doc.original_filename)
        if not os.path.exists(file_path):
            file_path = doc.file_path
            if not os.path.exists(file_path):
                errors.append(f"{doc.original_filename}: Encrypted file not found on disk")
                continue
            
        try:
            with open(file_path, "rb") as f:
                encrypted_data = f.read()
                
            decrypted_data = scan_service.decrypt_data(encrypted_data)
            
            dest_path = os.path.join(uploads_dir, doc.original_filename)
            with open(dest_path, "wb") as f:
                f.write(decrypted_data)
                
            doc.status = "Uploaded"
            db.commit()
            
            uploaded_count += 1
        except Exception as e:
            db.rollback()
            errors.append(f"{doc.original_filename}: {str(e)}")
            
    return {
        "status": "success" if not errors else "partial_success",
        "uploaded_count": uploaded_count,
        "errors": errors
    }
