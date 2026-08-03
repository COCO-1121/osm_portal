# Shared Files & Cross-Module Change Log

> **Current Working Branch:** `feature/examiner-portal`  
> **Repository Scope:** Unified `osm` repository (`backend/` and `frontend/`)  
> **Module Ownership:** `admin`, `examiner`, `uploader`, `shared`

---

## 📌 Context & Team Architecture

All three portals (**Admin**, **Examiner**, and **Uploader**) have been consolidated into a single unified workspace (`osm`). Both `backend` and `frontend` are structured into modular subdirectories:

- **`admin/`**: Admin portal logic, routes, components, and services.
- **`examiner/`**: Examiner portal logic, routes, evaluation pages, and reports.
- **`uploader/`**: Uploader portal logic, batch uploads, preview, and scanned document queues.
- **`shared/`**: Shared layouts, navigation components, auth logic, and common utilities.

To minimize git merge conflicts, **each developer should only make feature changes inside their assigned module directory** (`admin/`, `examiner/`, or `uploader/`).

---

## ❓ Are There Only 2 Common Files?

**Answer:**  
`App.jsx` (Frontend) and `main.py` (Backend) are indeed the **2 primary entry-point files** where routes and API endpoints for all three portals are mounted. 

However, there are a few additional shared core files that configure application-wide settings:

### 1. Primary Shared Entry-Point Files (2 Main Files)
- **`frontend/src/App.jsx`**: Main React Router file. Contains top-level routes for Admin, Examiner, Uploader, and Shared pages.
- **`backend/app/main.py`**: FastAPI application entry point. Imports and mounts API routers for all 3 portals.

### 2. Secondary Shared Core Files
- **Backend Shared Space:**
  - `backend/app/core/config.py` — Application configuration & environment settings.
  - `backend/app/db/session.py` — Database engines (`admin_engine`, `examiner_engine`, `uploader_engine`).
  - `backend/.env` / `backend/.env.example` — Shared environment variables.
- **Frontend Shared Space:**
  - `frontend/src/main.jsx` — React DOM render root.
  - `frontend/src/index.css` & `frontend/src/App.css` — Global CSS variables and utility classes.
  - `frontend/src/shared/` — Common components (`DashboardLayout`, `RoleSelectionPage`), hooks, and API services.

---

## 📝 Cross-Module Change Log & Conflict Prevention Notes

Whenever a developer on **`feature/examiner-portal`** or another branch needs to touch shared files (`App.jsx`, `main.py`, `config.py`, etc.), log the changes below with a clear description so teammates can seamlessly resolve merge conflicts.

### Logged Changes:

#### 1. `frontend/src/App.jsx`
- **Branch:** `feature/examiner-portal`
- **Purpose:** Registered missing examiner portal routes and fixed page imports:
  - Added import `ExaminerRejectedQueue` from `./examiner/pages/RejectedQueue`.
  - Resolved Admin `RejectedQueue` import path (`import AdminRejectedQueue from './admin/pages/RejectedQueue'`).
  - Registered route `/examiner/rejected-queue` under `DashboardLayout`.
  - Verified evaluation routes (`/examiner/evaluation`, `/examiner/evaluation/:scriptId`, and `/evaluation/:subjectId`).
- **Merge Conflict Guidance:** When merging `App.jsx`, preserve all `<Route>` blocks inside `<Route element={<DashboardLayout />}>` for examiner pages without modifying Admin or Uploader route definitions.

#### 2. `backend/app/main.py`
- **Branch:** `feature/examiner-portal`
- **Purpose:** Mounted examiner API routers (`examiner_auth_router`, `examiner_dashboard_router`).
- **Merge Conflict Guidance:** When merging `main.py`, ensure router imports and `app.include_router(...)` calls for examiner endpoints remain alongside Admin and Uploader routers.

#### 3. Module Restorations (Examiner Isolated Space):
- **`frontend/src/examiner/pages/EvaluationPage.jsx`**: Restored complete 15.2 KB stateful evaluation engine with question selection, mark calculations, stamp annotations, auto-save drafts, and back-button lock.
- **`frontend/src/examiner/pages/RejectedQueue.jsx`**: Created page component for reviewing rejected scripts queue.
- **`frontend/src/examiner/pages/BankDetails.jsx`**: Restored form validation and IFSC code lookup.
- **`frontend/src/examiner/pages/DayWiseReport.jsx`**: Restored dynamic evaluation statistics calculations.
- **`frontend/src/examiner/components/Footer.jsx`**: Added Footer component.
- **`backend/app/utils/extract_pdf.py`**: Ported PyMuPDF PDF page extraction script.

---

## 🤝 Merge Conflict Resolution Instructions

1. **When Pulling or Rebasing `main`:**
   - Keep your module-specific files (`src/examiner/...` and `app/api/v1/examiner/...`) untouched.
   - If git flags a conflict in **`App.jsx`**, combine the imported page components and route definitions side-by-side. Do not delete routes added by Admin or Uploader team members.
   - If git flags a conflict in **`main.py`**, accept router inclusions from all portals (`admin`, `examiner`, `uploader`).
2. **Before Committing:**
   - Test that all 3 login routes work: `/admin/login`, `/examiner/login`, and `/uploader/login`.
