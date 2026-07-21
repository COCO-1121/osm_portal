from fastapi import FastAPI
from sqlalchemy import text
from app.api.auth import router as auth_router
from app.db.database import engine
from app.api.admin.dashboard import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.admin_rejections import router as admin_rejections_router
from fastapi.staticfiles import StaticFiles
from app.api.v1.admin_examiners import (
    router as admin_examiner_router,
)
from app.api.v1.admin_audit_logs import router as admin_audit_logs_router

app = FastAPI(
    title="OSM Portal API",
    version="1.0.0",
)

app.mount(
    "/files",
    StaticFiles(directory="app/storage"),
    name="files",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:50607",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(admin_rejections_router)
app.include_router(admin_examiner_router)
app.include_router(admin_audit_logs_router)

@app.get("/")
def root():
    return {
        "message": "OSM Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def db_test():

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "database": "Connected Successfully ✅"
        }

    except Exception as e:
        return {
            "database": "Connection Failed ❌",
            "error": str(e)
        }

    
