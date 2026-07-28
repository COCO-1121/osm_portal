import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OSM Enterprise System"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key & JWT Config
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-osm-enterprise-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str | None = None
    
    # Decoupled Independent Database URLs (Development Phase)
    ADMIN_DATABASE_URL: str = os.getenv(
        "ADMIN_DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/osm_admin"
    )
    EXAMINER_DATABASE_URL: str = os.getenv(
        "EXAMINER_DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/osm_examiner"
    )
    UPLOADER_DATABASE_URL: str = os.getenv(
        "UPLOADER_DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/osm_uploader"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    OSM_SCAN_FOLDER: str = os.getenv("OSM_SCAN_FOLDER", "osm_scan")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()