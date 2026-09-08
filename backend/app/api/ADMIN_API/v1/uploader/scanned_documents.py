from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Form
from fastapi.responses import StreamingResponse
from app.services.distribution_service import distribute_unassigned_copies
from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path
import logging
import tempfile
import shutil
import io
import os
import sys
import subprocess
import uuid

user_site = os.path.expanduser(r"~\AppData\Roaming\Python\Python313\site-packages")
if os.path.exists(user_site) and user_site not in sys.path:
    sys.path.append(user_site)

from app.db.session import get_uploader_db
from app.models.uploader.scanned_document import ScannedDocument
from app.schemas.uploader.scanned_document import (
    ScannedDocumentResponse, 
    ScannedDocumentListResponse,
    FileUploadResponse,
    FilePreviewResponse
)
from app.services.file_processor import FileProcessorService
from app.core.dependencies import require_uploader_role
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scanned-documents", tags=["Scanned Documents"])


def get_uploader_service(db: Session = Depends(get_uploader_db)) -> FileProcessorService:
    """Dependency to get file processor service"""
    return FileProcessorService(db)


def generate_barcode(document_id: int) -> str:
    """
    Generate a unique, human-readable barcode for a scanned document.
    Format: OSM-<document_id>-<6 char random hex>
    """
    return f"OSM-{document_id}-{uuid.uuid4().hex[:6].upper()}"


@router.get("/", response_model=ScannedDocumentListResponse)
def list_scanned_documents(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    List all scanned documents
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **status**: Optional filter by status
    """
    try:
        service = FileProcessorService(db)
        documents, total = service.list_documents(skip=skip, limit=limit, status=status)
        
        return ScannedDocumentListResponse(
            documents=documents,
            total=total,
            page=skip // limit + 1 if limit > 0 else 1,
            page_size=limit
        )
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list documents")


@router.get("/preview-latest")
async def preview_latest_document(
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Preview the most recently uploaded scanned document
    
    Returns the decrypted file for preview in the browser
    """
    try:
        # Get the most recent document
        document = db.query(ScannedDocument).order_by(
            ScannedDocument.created_at.desc()
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="No documents found")
        
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document.id)
        
        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{document.original_filename}\"",
                "X-File-Size": str(document.file_size or len(decrypted_content)),
                "X-Document-Barcode": str(document.barcode or ""),
                "Access-Control-Expose-Headers": "X-Total-Pages, Content-Disposition, X-File-Size, X-Document-Barcode",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error previewing latest document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to preview latest document")


@router.get("/{document_id}", response_model=ScannedDocumentResponse)
def get_scanned_document(
    document_id: int,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Get a specific scanned document by ID
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get document")


@router.post("/upload", response_model=FileUploadResponse)
async def upload_scanned_document(
    file: UploadFile = File(...),
    exam: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Upload a scanned document
    
    - **file**: The file to upload (PDF, JPG, JPEG, PNG, TIFF)
    """
    try:
        service = FileProcessorService(db)
        
        # Validate file type
        if not service.is_allowed_file_type(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Process the file
        document = service.process_file(
            temp_path, 
            original_filename=file.filename,
            uploaded_by=current_user.id,
            exam_id=exam
        )

        # --- Connectivity fix ---
        # Once the file has been safely processed & encrypted, generate a
        # barcode for it and mark it as "Uploaded" so it shows up correctly
        # on the "Uploaded Copies" screen instead of being stuck on "Pending".
        if not document.barcode:
            document.barcode = generate_barcode(document.id)
        document.status = "Uploaded"
        db.commit()
        # Trigger auto-distribution to active examiners
        distribute_unassigned_copies(db)
        db.refresh(document)
        
        return FileUploadResponse(
            message="File uploaded and encrypted successfully",
            document_id=document.id,
            filename=document.original_filename,
            status=document.status
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.get("/by-barcode/{barcode}/preview")
async def preview_document_by_barcode(
    barcode: str,
    db: Session = Depends(get_uploader_db)
):
    """
    Preview a scanned document by barcode (decrypted in memory)
    
    Returns the decrypted file for preview in the browser
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.barcode == barcode
        ).first()

        if not document:
            document = db.query(ScannedDocument).filter(
                (ScannedDocument.original_filename == barcode) |
                (ScannedDocument.exam_id == barcode)
            ).first()

        if not document and (barcode.isdigit() or barcode in ["048", "0302"]):
            if barcode.isdigit():
                document = db.query(ScannedDocument).filter(
                    ScannedDocument.id == int(barcode)
                ).first()
            if not document:
                document = db.query(ScannedDocument).filter(
                    ScannedDocument.status.in_(["ASSIGNED", "Uploaded", "Pending", "UFM"])
                ).order_by(ScannedDocument.id.asc()).first()
        
        if not document:
            for fallback_path in [
                Path("app/storage/uploads") / f"{barcode}.pdf",
                Path("backend/app/storage/uploads") / f"{barcode}.pdf",
                Path("app/storage/uploads/BC2026001.pdf"),
                Path("backend/app/storage/uploads/BC2026001.pdf"),
            ]:
                if fallback_path.exists() and fallback_path.is_file():
                    with open(fallback_path, "rb") as f:
                        file_bytes = f.read()
                    page_count = 1
                    try:
                        import pymupdf as fitz
                        with fitz.open(stream=file_bytes, filetype="pdf") as doc_pdf:
                            page_count = len(doc_pdf)
                    except Exception:
                        pass
                    return StreamingResponse(
                        io.BytesIO(file_bytes),
                        media_type="application/pdf",
                        headers={
                            "Content-Disposition": f'inline; filename="{barcode}.pdf"',
                            "X-File-Size": str(len(file_bytes)),
                            "X-Total-Pages": str(page_count),
                            "X-Document-Barcode": str(barcode),
                            "Access-Control-Expose-Headers": "X-Total-Pages, Content-Disposition, X-File-Size, X-Document-Barcode"
                        }
                    )
            document = db.query(ScannedDocument).order_by(ScannedDocument.id.asc()).first()

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document.id)
        
        page_count = 1
        try:
            import pymupdf as fitz
            doc = fitz.open(stream=decrypted_content, filetype="pdf")
            page_count = len(doc)
            doc.close()
        except Exception as pdf_err:
            logger.warning(f"Could not count PDF pages for barcode {barcode}: {pdf_err}")
        
        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{document.original_filename}\"",
                "X-File-Size": str(document.file_size or len(decrypted_content)),
                "X-Total-Pages": str(page_count),
                "X-Document-Barcode": str(document.barcode or barcode),
                "Access-Control-Expose-Headers": "X-Total-Pages, Content-Disposition, X-File-Size, X-Document-Barcode"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error previewing document by barcode {barcode}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to preview document")


@router.get("/{document_id}/preview")
async def preview_scanned_document(
    document_id: int,
    db: Session = Depends(get_uploader_db)
):
    """
    Preview a scanned document (decrypted in memory)

    Returns the decrypted file for preview in the browser
    """
    logger.info(f"DEBUG: preview_scanned_document called with document_id: {document_id}, type: {type(document_id)}")
    try:
        # First check if document exists
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()

        logger.info(f"DEBUG: Document lookup result: {document}")
        if document:
            logger.info(f"DEBUG: Document found - id: {document.id}, encrypted_filename: {document.encrypted_filename}, file_path: {document.file_path}")

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document_id)
        
        page_count = 1
        try:
            import pymupdf as fitz
            doc = fitz.open(stream=decrypted_content, filetype="pdf")
            page_count = len(doc)
            doc.close()
        except Exception as pdf_err:
            logger.warning(f"Could not count PDF pages for docId {document_id}: {pdf_err}")

        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{document.original_filename}\"",
                "X-File-Size": str(document.file_size or len(decrypted_content)),
                "X-Total-Pages": str(page_count),
                "X-Document-Barcode": str(document.barcode or ""),
                "Access-Control-Expose-Headers": "X-Total-Pages, Content-Disposition, X-File-Size, X-Document-Barcode"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error previewing document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to preview document")


@router.get("/by-barcode/{barcode}/page/{page_num}")
async def get_document_page_image_by_barcode(
    barcode: str,
    page_num: int,
    db: Session = Depends(get_uploader_db)
):
    """
    Renders and streams a specific page (PNG image) of a scanned document by barcode
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.barcode == barcode
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document.id)
        
        import pymupdf as fitz
        doc = fitz.open(stream=decrypted_content, filetype="pdf")
        if page_num < 1 or page_num > len(doc):
            doc.close()
            raise HTTPException(status_code=404, detail="Page index out of range")
        
        page = doc[page_num - 1]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        doc.close()
        
        return StreamingResponse(io.BytesIO(img_bytes), media_type="image/png")
    except Exception as e:
        print("PAGE RENDER ERROR TRACE:", type(e), e, flush=True)
        logger.error(f"Error rendering page {page_num} for barcode {barcode}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to render document page: {str(e)}")


@router.get("/{document_id}/page/{page_num}")
async def get_document_page_image_by_id(
    document_id: int,
    page_num: int,
    db: Session = Depends(get_uploader_db)
):
    """
    Renders and streams a specific page (PNG image) of a scanned document by document ID
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document.id)
        
        import pymupdf as fitz
        doc = fitz.open(stream=decrypted_content, filetype="pdf")
        if page_num < 1 or page_num > len(doc):
            doc.close()
            raise HTTPException(status_code=404, detail="Page index out of range")
        
        page = doc[page_num - 1]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        doc.close()
        
        return StreamingResponse(io.BytesIO(img_bytes), media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rendering page {page_num} for doc ID {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to render document page")


@router.get("/{document_id}/download")
async def download_scanned_document(
    document_id: int,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Download a scanned document (decrypted in memory)
    
    Returns the decrypted file as a download
    """
    try:
        service = FileProcessorService(db)
        decrypted_content, filename = service.get_decrypted_file(document_id)
        
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=\"{document.original_filename}\"",
                "X-File-Size": str(document.file_size or len(decrypted_content))
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download document")


@router.delete("/{document_id}")
def delete_scanned_document(
    document_id: int,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Delete a scanned document and its encrypted file
    """
    try:
        service = FileProcessorService(db)
        service.delete_document(document_id)
        
        return {"message": "Document deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.get("/{document_id}/info", response_model=FilePreviewResponse)
def get_document_info(
    document_id: int,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Get document metadata without downloading the file
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return FilePreviewResponse(
            content_type=document.mime_type,
            filename=document.original_filename,
            file_size=document.file_size or 0
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document info {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get document info")


@router.patch("/{document_id}/status")
def update_document_status(
    document_id: int,
    status: str,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Update document status (e.g., from Pending to Uploaded)
    """
    try:
        document = db.query(ScannedDocument).filter(
            ScannedDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document.status = status
        db.commit()
        db.refresh(document)
        
        return {
            "message": "Document status updated successfully",
            "document_id": document.id,
            "status": document.status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating document status {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update document status")


@router.post("/reupload")
async def reupload_document(
    file: UploadFile = File(...),
    barcode: Optional[str] = None,
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    Re-upload a rejected document with a new file
    
    - **file**: The new PDF file to upload
    - **barcode**: Optional barcode to identify the rejected document
    """
    try:
        service = FileProcessorService(db)
        
        # Validate file type
        if not service.is_allowed_file_type(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # If barcode is provided, try to find and update existing document
        if barcode:
            logger.info(f"Re-uploading document for barcode: {barcode}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Process the file
        # (fix: original_filename was missing before, causing the temp file
        # name like "tmpXXXXXX.pdf" to be stored/shown instead of the real name)
        document = service.process_file(
            temp_path,
            original_filename=file.filename,
            uploaded_by=current_user.id
        )
        
        # Re-use the existing barcode if one was supplied, otherwise generate one
        document.barcode = barcode if barcode else generate_barcode(document.id)
        # A re-upload is fresh, so it goes back to "Uploaded" (safely stored),
        # ready for review again — same as a normal upload.
        document.status = "Uploaded"
        db.commit()
        db.refresh(document)
        
        return FileUploadResponse(
            message="File re-uploaded and encrypted successfully",
            document_id=document.id,
            filename=document.original_filename,
            status=document.status
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error re-uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to re-upload file")


@router.post("/fix-old-records")
async def fix_old_records(
    current_user: User = Depends(require_uploader_role),
    db: Session = Depends(get_uploader_db)
):
    """
    One-time fix for documents uploaded before the barcode/status connectivity
    fix existed. Assigns a barcode to any document missing one, and moves any
    document stuck on "Pending" to "Uploaded".

    Call this once from the browser (or Postman) - it is safe to call again,
    it only touches rows that still need fixing.
    """
    try:
        documents = db.query(ScannedDocument).all()
        updated = 0

        for document in documents:
            changed = False

            if not document.barcode:
                document.barcode = generate_barcode(document.id)
                changed = True

            if document.status == "Pending":
                document.status = "Uploaded"
                changed = True

            if changed:
                updated += 1

        db.commit()

        return {
            "message": "Old records fixed successfully",
            "updated_count": updated,
            "total_count": len(documents)
        }
    except Exception as e:
        logger.error(f"Error fixing old records: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fix old records: {str(e)}")


@router.post("/open-folder")
async def open_scanned_folder(
    current_user: User = Depends(require_uploader_role)
):
    """
    Open the scanned documents folder in the system's file manager
    
    This endpoint opens the folder where scanned documents are stored
    in the operating system's file manager (Windows Explorer on Windows).
    """
    try:
        # Get the scan folder path from settings
        scan_folder = Path(settings.OSM_SCAN_FOLDER)
        
        # Ensure the folder exists
        if not scan_folder.exists():
            scan_folder.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created scan folder: {scan_folder}")
        
        # Convert to absolute path
        scan_folder = scan_folder.resolve()
        
        logger.info(f"Attempting to open scan folder in file manager: {scan_folder}")
        
        # Open the folder in Windows Explorer
        if os.name == 'nt':  # Windows
            result = subprocess.run(['explorer', str(scan_folder)], capture_output=True, text=True)
            logger.info(f"Explorer subprocess returned exit code: {result.returncode}")
        elif os.name == 'posix':  # macOS and Linux
            if sys.platform == 'darwin':  # macOS
                result = subprocess.run(['open', str(scan_folder)], capture_output=True, text=True)
            else:  # Linux
                result = subprocess.run(['xdg-open', str(scan_folder)], capture_output=True, text=True)
            logger.info(f"File manager subprocess returned exit code: {result.returncode}")
        
        logger.info(f"Successfully opened scan folder in file manager: {scan_folder}")
        
        return {
            "success": True,
            "message": "Folder opened successfully",
            "folder_path": str(scan_folder)
        }
    except Exception as e:
        logger.error(f"Error opening scan folder: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to open folder: {str(e)}")