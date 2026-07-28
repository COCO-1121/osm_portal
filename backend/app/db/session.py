from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Independent Database Engines
admin_engine = create_engine(
    settings.ADMIN_DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

examiner_engine = create_engine(
    settings.EXAMINER_DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

uploader_engine = create_engine(
    settings.UPLOADER_DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# 2. Domain Session Local Factories
AdminSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=admin_engine)
ExaminerSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=examiner_engine)
UploaderSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=uploader_engine)

# 3. Declarative Bases per Domain (Prevents Schema Conflicts during migration)
AdminBase = declarative_base()
ExaminerBase = declarative_base()
UploaderBase = declarative_base()

# Base alias for backward compatibility
Base = declarative_base()

# 4. FastAPI Dependency Injectors for Database Sessions
def get_admin_db():
    """Provides a database session bound to the Admin Database."""
    db = AdminSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_examiner_db():
    """Provides a database session bound to the Examiner Database."""
    db = ExaminerSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_uploader_db():
    """Provides a database session bound to the Uploader Database."""
    db = UploaderSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Default fallback db getter
def get_db():
    """Default fallback getter (bound to Admin DB in phase 1)."""
    db = AdminSessionLocal()
    try:
        yield db
    finally:
        db.close()