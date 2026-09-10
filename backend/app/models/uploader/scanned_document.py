from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.database import Base


class ScannedDocument(Base):
    __tablename__ = "scanned_documents"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String(255), nullable=False)          # Original filename
    encrypted_filename = Column(String(255), unique=True, nullable=False)  # Encrypted filename stored on disk
    file_path = Column(String(500), nullable=False)                   # Full path to encrypted file
    file_size = Column(BigInteger, nullable=True)                    # File size in bytes
    upload_time = Column(DateTime, default=datetime.utcnow)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    exam_id = Column(String(50), nullable=True)   
    assigned_examiner_id = Column(UUID(as_uuid=True),ForeignKey("users.id"), nullable=True) # Exam identifier
    barcode = Column(String(100), nullable=True, unique=True)         # Barcode identifier
    status = Column(String(50), default="Pending")                    # Pending, Uploaded, Rejected
    marks = Column(Integer, nullable=True)                           # Actual marks assigned
    max_marks = Column(Integer, nullable=True)                       # Maximum possible marks
    encryption_status = Column(String(50), default="Encrypted")      # Encrypted, Decrypted
    mime_type = Column(String(100), nullable=False)                  # Content MIME type
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)