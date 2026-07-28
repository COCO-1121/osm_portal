# Backward compatibility wrapper for db session imports
from app.db.session import (
    admin_engine,
    examiner_engine,
    uploader_engine,
    AdminSessionLocal,
    ExaminerSessionLocal,
    UploaderSessionLocal,
    AdminBase,
    ExaminerBase,
    UploaderBase,
    Base,
    get_admin_db,
    get_examiner_db,
    get_uploader_db,
    get_db,
)

# Engine alias
engine = admin_engine
SessionLocal = AdminSessionLocal