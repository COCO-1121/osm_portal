import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.db.session import admin_engine, examiner_engine, uploader_engine

# Import API Routers
from app.api.ADMIN_API.auth import router as auth_router
from app.api.ADMIN_API.v1.admin.dashboard import router as admin_dashboard_router
from app.api.ADMIN_API.v1.admin.audit_logs import router as admin_audit_logs_router
from app.api.ADMIN_API.v1.admin.examiners import router as admin_examiners_router
from app.api.ADMIN_API.v1.admin.rejections import router as admin_rejections_router
from app.api.ADMIN_API.v1.admin.ufm_cases import router as admin_ufm_cases_router

# Examiner Routers
try:
    from app.api.ADMIN_API.v1.examiner.auth import router as examiner_auth_router
except ImportError as e:
    print("FAILED TO IMPORT EXAMINER AUTH ROUTER:", e)
    examiner_auth_router = None

print("Loaded examiner_auth_router:", examiner_auth_router is not None)

# Import dashboard router
try:
    from app.api.ADMIN_API.v1.examiner.dashboard import router as examiner_dashboard_router
    from app.api.ADMIN_API.v1.examiner.examiner_reports import router as examiner_reports_router
except ImportError as e:
    print("FAILED TO IMPORT EXAMINER DASHBOARD ROUTER:", e)
    examiner_dashboard_router = None
    examiner_reports_router = None

# Uploader Routers
try:
    from app.api.ADMIN_API.v1.uploader.auth import router as uploader_auth_router
    from app.api.ADMIN_API.v1.uploader.scanned_documents import router as uploader_scanned_router
    from app.api.ADMIN_API.v1.uploader.uploader import router as uploader_mgmt_router
    from app.api.ADMIN_API.v1.uploader.exams import router as uploader_exams_router
    from app.api.ADMIN_API.v1.uploader.rejected_queue import router as uploader_rejected_router
except ImportError as e:
    print("FAILED TO IMPORT UPLOADER ROUTERS:", e)
    uploader_auth_router = None
    uploader_scanned_router = None
    uploader_mgmt_router = None
    uploader_exams_router = None
    uploader_rejected_router = None

# Physical Scan Router
try:
    from app.api.ADMIN_API.routes.scan import router as scan_router
except ImportError as e:
    print("FAILED TO IMPORT SCAN ROUTER:", e)
    scan_router = None

from pathlib import Path
import logging
import uuid

from app.db.session import UploaderSessionLocal, AdminSessionLocal, get_uploader_db, Base
from app.models.uploader.scanned_document import ScannedDocument
from app.models.uploader.exam import Exam
from app.models.role import Role
from app.models.user import User
from app.services.file_monitor import start_file_monitor

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("app/storage", exist_ok=True)

# Mount Static Files
app.mount(
    "/files",
    StaticFiles(directory="app/storage"),
    name="files",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Unified Auth Router
app.include_router(auth_router)

# Register Admin Routers
app.include_router(admin_dashboard_router)
app.include_router(admin_rejections_router)
app.include_router(admin_ufm_cases_router)
app.include_router(admin_examiners_router)
app.include_router(admin_audit_logs_router)

# Register Examiner Routers (if available)
if examiner_auth_router:
    app.include_router(examiner_auth_router)
if examiner_dashboard_router:
    app.include_router(examiner_dashboard_router)
if examiner_reports_router:
    app.include_router(examiner_reports_router)

# Register Uploader Routers (if available)
if uploader_auth_router:
    app.include_router(uploader_auth_router)
if uploader_scanned_router:
    app.include_router(uploader_scanned_router)
if uploader_mgmt_router:
    app.include_router(uploader_mgmt_router)
if uploader_exams_router:
    app.include_router(uploader_exams_router)
    # Alias /api/exams for legacy frontend compatibility
    app.include_router(uploader_exams_router, prefix="/api")
if uploader_rejected_router:
    app.include_router(uploader_rejected_router)

# Register Scan Router
if scan_router:
    app.include_router(scan_router, prefix="/api")


def seed_exams():
    """
    Seeds dummy exams so the uploader dashboard date-filtered dropdown works properly.
    """
    from app.models.uploader.exam import Exam
    from datetime import date

    dummy_exams = [
        ("Mathematics Paper 1", date(2026, 7, 24)),
        ("Science Paper 1", date(2026, 7, 24)),
        ("English Paper 1", date(2026, 7, 25)),
        ("Mathematics Paper 2", date(2026, 7, 26)),
        ("Social Studies Paper 1", date(2026, 8, 1)),
    ]

    db = UploaderSessionLocal()
    try:
        added = 0
        for name, exam_date in dummy_exams:
            exists = db.query(Exam).filter(
                Exam.name == name, Exam.exam_date == exam_date
            ).first()
            if not exists:
                db.add(Exam(name=name, exam_date=exam_date))
                added += 1

        db.commit()
        logger.info(f"[seed_exams] Added {added} new dummy exam(s).")
    except Exception as e:
        logger.error(f"[seed_exams] Failed to seed exams: {str(e)}")
    finally:
        db.close()


def fix_old_pending_records():
    """
    Ensures all documents have barcodes and stuck 'Pending' files move to 'Uploaded'.
    """
    db = UploaderSessionLocal()
    try:
        documents = db.query(ScannedDocument).all()
        updated = 0

        for document in documents:
            changed = False

            if not document.barcode:
                document.barcode = f"OSM-{document.id}-{uuid.uuid4().hex[:6].upper()}"
                changed = True

            if document.status == "Pending":
                document.status = "Uploaded"
                changed = True

            if changed:
                updated += 1

        db.commit()
        logger.info(f"[startup fix] Updated {updated} document(s) out of {len(documents)} total.")
    except Exception as e:
        logger.error(f"[startup fix] Failed to fix old records: {str(e)}")
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    # Ensure database tables exist across engines
    try:
        Base.metadata.create_all(bind=admin_engine)
        Base.metadata.create_all(bind=examiner_engine)
        Base.metadata.create_all(bind=uploader_engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")

    # Create osm_scan folder if it doesn't exist
    scan_folder = Path(getattr(settings, "OSM_SCAN_FOLDER", "osm_scan"))
    if not scan_folder.exists():
        scan_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created osm_scan folder: {scan_folder}")

    # Seed database users if needed
    try:
        from app.db.seed import seed_database
        seed_database()
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        logger.error(f"Failed to seed database: {str(e)}")

    # Seed sample rejected scripts
    try:
        from app.db.seed_rejection_test import seed_test_rejection
        seed_test_rejection()
        logger.info("Sample rejections seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to seed sample rejections: {str(e)}")

    # Seed sample UFM cases (BC102341, BC102342, BC102343)
    try:
        from app.db.seed_ufm_cases import seed_ufm_cases
        seed_ufm_cases()
        logger.info("Sample UFM cases seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to seed sample UFM cases: {str(e)}")

    # Run barcode fix & exam seeding
    fix_old_pending_records()
    seed_exams()

    # Start file monitor watchdog task
    try:
        db = UploaderSessionLocal()
        file_monitor = start_file_monitor(db, uploaded_by=None)
        logger.info("File monitor service started with watchdog.")
    except Exception as e:
        logger.error(f"Failed to start file monitor: {str(e)}")


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "OSM Backend Running 🚀",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "environment": "development"
    }

@app.get("/db-test")
def db_test():
    """Tests connection to Admin, Examiner, and Uploader databases."""
    status_report = {}
    
    # 1. Admin DB Test
    try:
        with admin_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        status_report["admin_database"] = "Connected Successfully ✅"
    except Exception as e:
        status_report["admin_database"] = f"Connection Failed ❌ ({str(e)})"

    # 2. Examiner DB Test
    try:
        with examiner_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        status_report["examiner_database"] = "Connected Successfully ✅"
    except Exception as e:
        status_report["examiner_database"] = f"Connection Failed ❌ ({str(e)})"

    # 3. Uploader DB Test
    try:
        with uploader_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        status_report["uploader_database"] = "Connected Successfully ✅"
    except Exception as e:
        status_report["uploader_database"] = f"Connection Failed ❌ ({str(e)})"

    return status_report
