import os
import uuid
import mimetypes
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
import logging

from app.models.uploader.scanned_document import ScannedDocument
from app.schemas.uploader.scanned_document import ScannedDocumentCreate
from app.utils.encryption import get_encryption_util
from app.core.config import settings

logger = logging.getLogger(__name__)


class FileProcessorService:
    """Service for processing and encrypting scanned files"""
    
    def __init__(self, db: Session):
        self.db = db
        self.encryption_util = get_encryption_util()
        self.scan_folder = Path(settings.OSM_SCAN_FOLDER).resolve()
        
    def ensure_scan_folder_exists(self):
        """Create osm_scan folder if it doesn't exist"""
        if not self.scan_folder.exists():
            self.scan_folder.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created scan folder: {self.scan_folder}")
    
    def is_allowed_file_type(self, filename: str) -> bool:
        """Check if file type is allowed"""
        ext = Path(filename).suffix.lower()
        return ext in settings.ALLOWED_FILE_TYPES
    
    def get_mime_type(self, filename: str) -> str:
        """Get MIME type for a file"""
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type or "application/octet-stream"
    
    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        return os.path.getsize(file_path)
    
    def generate_encrypted_filename(self, original_filename: str) -> str:
        """Generate unique encrypted filename"""
        ext = Path(original_filename).suffix
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{ext}.enc"
    
    def process_file(
        self, 
        file_path: str,
        original_filename: str = None,
        uploaded_by: Optional[int] = None,
        exam_id: Optional[str] = None
    ) -> ScannedDocument:
        """
        Process a scanned file: encrypt and store metadata
        
        Args:
            file_path: Path to the file to process
            original_filename: Original name of the uploaded file
            uploaded_by: Optional user ID who uploaded the file
            exam_id: Optional exam identifier
            
        Returns:
            ScannedDocument model instance
        """
        try:
            self.ensure_scan_folder_exists()
            filename = original_filename or os.path.basename(file_path)
            
            # Validate file type
            if not self.is_allowed_file_type(filename):
                raise ValueError(f"File type not allowed: {filename}")
            
            # Get file metadata
            mime_type = self.get_mime_type(filename)
            file_size = self.get_file_size(file_path)
            
            # Generate encrypted filename
            encrypted_filename = self.generate_encrypted_filename(filename)
            encrypted_path = self.scan_folder / encrypted_filename
            
            # Encrypt the file
            self.encryption_util.encrypt_file(file_path, str(encrypted_path))
            
            # Delete original file after encryption
            os.remove(file_path)
            logger.info(f"Deleted original file after encryption: {file_path}")
            
            # Create database record
            document = ScannedDocument(
                original_filename=filename,
                encrypted_filename=encrypted_filename,
                file_path=str(encrypted_path),
                mime_type=mime_type,
                file_size=file_size,
                status="Pending",
                uploader_id=uploaded_by,
                exam_id=exam_id,
                upload_time=datetime.utcnow()
            )
            
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)
            
            logger.info(f"Successfully processed file: {filename} -> {encrypted_filename}")
            return document
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error processing file {file_path}: {str(e)}")
            raise
    
    def get_decrypted_file(self, document_id: int) -> Tuple[bytes, str]:
        """
        Decrypt a file temporarily in memory

        Args:
            document_id: ID of the document to decrypt

        Returns:
            Tuple of (decrypted_content, original_filename)
        """
        logger.info(f"DEBUG: get_decrypted_file called with document_id: {document_id}, type: {type(document_id)}")
        try:
            document = self.db.query(ScannedDocument).filter(
                ScannedDocument.id == document_id
            ).first()

            logger.info(f"DEBUG: Document lookup in get_decrypted_file: {document}")
            if document:
                logger.info(f"DEBUG: Document found - id: {document.id}, encrypted_filename: {document.encrypted_filename}")
                logger.info(f"DEBUG: scan_folder: {self.scan_folder}")

            if not document:
                raise ValueError(f"Document not found: {document_id}")

            encrypted_path = self.scan_folder / document.encrypted_filename
            logger.info(f"DEBUG: encrypted_path: {encrypted_path}, exists: {encrypted_path.exists()}")

            if not encrypted_path.exists():
                raise FileNotFoundError(f"Encrypted file not found: {encrypted_path}")

            # Decrypt file in memory
            decrypted_content = self.encryption_util.decrypt_file(str(encrypted_path))
            logger.info(f"DEBUG: Decryption successful, content length: {len(decrypted_content)}")

            return decrypted_content, document.original_filename
            
        except Exception as e:
            logger.error(f"Error decrypting document {document_id}: {str(e)}")
            raise
    
    def delete_document(self, document_id: int) -> bool:
        """
        Delete a document and its encrypted file
        
        Args:
            document_id: ID of the document to delete
            
        Returns:
            True if deleted successfully
        """
        try:
            document = self.db.query(ScannedDocument).filter(
                ScannedDocument.id == document_id
            ).first()
            
            if not document:
                raise ValueError(f"Document not found: {document_id}")
            
            # Delete encrypted file
            encrypted_path = self.scan_folder / document.encrypted_filename
            if encrypted_path.exists():
                encrypted_path.unlink()
                logger.info(f"Deleted encrypted file: {encrypted_path}")
            
            # Delete database record
            self.db.delete(document)
            self.db.commit()
            
            logger.info(f"Successfully deleted document: {document_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting document {document_id}: {str(e)}")
            raise
    
    def list_documents(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> Tuple[list[ScannedDocument], int]:
        """
        List scanned documents with optional filtering
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Optional status filter
            
        Returns:
            Tuple of (documents_list, total_count)
        """
        try:
            query = self.db.query(ScannedDocument)
            
            if status:
                query = query.filter(ScannedDocument.status == status)
            
            total = query.count()
            documents = query.order_by(ScannedDocument.created_at.desc()).offset(skip).limit(limit).all()
            
            return documents, total
            
        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            raise
