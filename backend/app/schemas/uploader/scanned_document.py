import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ScannedDocumentBase(BaseModel):
    """Base schema for scanned documents"""
    original_filename: str = Field(..., description="Original filename")
    mime_type: str = Field(..., description="MIME type of the file")


class ScannedDocumentCreate(ScannedDocumentBase):
    """Schema for creating a scanned document"""
    pass


class ScannedDocumentUpdate(BaseModel):
    """Schema for updating a scanned document"""
    status: Optional[str] = Field(None, description="Document status")
    uploaded_by: Optional[int] = Field(None, description="User ID who uploaded the file")


class ScannedDocumentResponse(ScannedDocumentBase):
    """Schema for scanned document response"""
    id: int
    encrypted_filename: str
    file_path: str
    upload_time: datetime
    status: str
    uploader_id: Optional[uuid.UUID | int | str] = None
    file_size: Optional[int] = None
    exam_id: Optional[str] = None
    barcode: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScannedDocumentListResponse(BaseModel):
    """Schema for list of scanned documents"""
    documents: list[ScannedDocumentResponse]
    total: int
    page: int
    page_size: int


class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    message: str
    document_id: int
    filename: str
    status: str


class FilePreviewResponse(BaseModel):
    """Schema for file preview response"""
    content_type: str
    filename: str
    file_size: int
