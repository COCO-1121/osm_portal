# Shared Files & Architecture Changes Log

This document tracks all changes made to primary entry-point files and secondary shared configuration files across all project portals (Admin, Examiner, Uploader).

---

## Core Shared Files Overview

### 1. Primary Entry-Point Files
- **Frontend**: `frontend/src/App.jsx`
  - Mounts all React routes and portal navigation.
- **Backend**: `backend/app/main.py`
  - Mounts all FastAPI routers, CORS middleware, static directories, and API endpoints.

### 2. Secondary Shared Files
- **Backend Shared Configuration**:
  - `backend/app/core/config.py` — Central application configuration & environment settings.
  - `backend/app/db/session.py` — Database engines and session factories.
  - `.env` — Global environment variables.
- **Frontend Shared Assets & Styles**:
  - `frontend/src/App.css` — App-wide layout styles.
  - `frontend/src/index.css` — Global CSS resets and theme tokens.
  - `frontend/src/shared/` — Shared components, layouts, pages, services, and documentation.

---

## Change Log

### [2026-07-30] Backend API Architecture & Route Imports Update
- **Target File**: `backend/app/main.py`
- **Reason**: Fix `ModuleNotFoundError: No module named 'app.api.auth'` resulting from the backend `app/` architecture migration to `app.api.ADMIN_API`.
- **Changes Applied**:
  - Updated API router import paths in `main.py` to match the new `app/api/ADMIN_API/` directory structure:
    - `app.api.auth` -> `app.api.ADMIN_API.auth`
    - `app.api.v1.admin.dashboard` -> `app.api.ADMIN_API.v1.admin.dashboard`
    - `app.api.v1.admin.audit_logs` -> `app.api.ADMIN_API.v1.admin.audit_logs`
    - `app.api.v1.admin.examiners` -> `app.api.ADMIN_API.v1.admin.examiners`
    - `app.api.v1.admin.rejections` -> `app.api.ADMIN_API.v1.admin.rejections`
    - `app.api.v1.examiner.auth` -> `app.api.ADMIN_API.v1.examiner.auth`
    - `app.api.v1.examiner.dashboard` -> `app.api.ADMIN_API.v1.examiner.dashboard`
    - `app.api.v1.uploader.auth` -> `app.api.ADMIN_API.v1.uploader.auth`
    - `app.api.v1.uploader.scanned_documents` -> `app.api.ADMIN_API.v1.uploader.scanned_documents`
    - `app.api.v1.uploader.uploader` -> `app.api.ADMIN_API.v1.uploader.uploader`
    - `app.api.v1.uploader.exams` -> `app.api.ADMIN_API.v1.uploader.exams`
    - `app.api.v1.uploader.rejected_queue` -> `app.api.ADMIN_API.v1.uploader.rejected_queue`
    - `app.api.routes.scan` -> `app.api.ADMIN_API.routes.scan`

### [2026-07-30] Primary Entry-Point Routing & Uploader Module Integration
- **Target File**: `frontend/src/App.jsx`
- **Reason**: Fix `Uncaught ReferenceError: RejectedQueue is not defined` causing white page runtime crash and separate Uploader module's `RejectedQueue` from Admin module's `RejectedScripts`.
- **Changes Applied**:
  - Line 16: Updated import to `import RejectedScripts from './admin/pages/RejectedScripts'`.
  - Line 36: Imported `RejectedQueue` from `./uploader/pages/RejectedQueue`.
  - Configured Uploader route `/uploader/rejected-queue` and alias `/rejected-queue` to render `<RejectedQueue />`.
  - Removed `<Route path="/admin/rejected-queue" element={<RejectedQueue />} />` and maintained Admin route `/admin/rejected-scripts` for `<RejectedScripts />`.

### [2026-07-30] Uploader Module Rejected Queue Page Implementation
- **Target File**: `frontend/src/uploader/pages/RejectedQueue.jsx`
- **Reason**: Provide dedicated Uploader module page for reviewing rejected scanned documents.
- **Changes Applied**:
  - Created Uploader `RejectedQueue` component connecting to `/api/rejected-queue/` backend endpoint.
  - Implemented responsive sidebar navigation, document summary table, refresh action, and preview links.

### [2026-07-30] Primary Entry-Point Startup Rejection Seeding
- **Target File**: `backend/app/main.py`
- **Reason**: Automatically populate sample rejected scripts on server startup so Admin module Dashboard and Rejected Scripts views display rejected answer scripts.
- **Changes Applied**:
  - Added `seed_test_rejection()` call to `startup_event` in `main.py`.

### [2026-07-30] Examiner Module PDF Viewer & Review Actions Update
- **Target Files**: `frontend/src/examiner/components/PDFViewer.jsx`, `frontend/src/examiner/components/ReviewActions.jsx`
- **Reason**: Enable real script PDF previewing in the PDF preview box and remove Assignment Policy logic from Review Decision UI.
- **Changes Applied**:
  - `PDFViewer.jsx`: Embedded native PDF rendering iframe with robust path resolution for storage uploads (`/files/uploads/${barcode}.pdf`), page navigation, and open-in-new-tab link.
  - `ReviewActions.jsx`: Removed Assignment Policy block completely, streamlined review decision choices (Return to Examiner Queue vs Return to Uploader), and connected decision submission to `/api/v1/admin/rejected-scripts/{rejection_id}/decision` endpoint.

### [2026-08-04] Examiner Module Dynamic Script Details & Review Actions Update
- **Target Files**: `frontend/src/examiner/components/ScriptDetailsCard.jsx`, `frontend/src/examiner/components/ReviewActions.jsx`
- **Reason**: Fix hardcoded dummy values in `ScriptDetailsCard` causing status mismatch between list view and detail view, and handle already-reviewed scripts in `ReviewActions`.
- **Changes Applied**:
  - `ScriptDetailsCard.jsx`: Updated component to accept `script` prop and dynamically render Barcode, Subject, Examiner ID, Centre ID, Rejected Date, Status (Pending / Returned to Examiner / Returned to Uploader), and Reject Reason.
  - `ReviewActions.jsx`: Updated component to accept `script` prop and render an informative decision summary card when the script has already been reviewed by an admin instead of prompting for duplicate submission.

### [2026-08-04] Primary Entry-Point Routers & App Routes for UFM Workflow
- **Target Files**: `backend/app/main.py`, `frontend/src/App.jsx`
- **Reason**: Register UFM (Unfair Means) backend API endpoints, database startup seeding, and frontend routes.
- **Changes Applied**:
  - `backend/app/main.py`: Imported `admin_ufm_cases_router` from `app.api.ADMIN_API.v1.admin.ufm_cases`, registered router on FastAPI `app`, and added `seed_ufm_cases()` (BC102341, BC102342, BC102343) to startup event.
  - `frontend/src/App.jsx`: Imported `UFMCases` and `UFMReview` pages and registered routes `/admin/ufm-cases`, `/admin/ufm-review`, and `/admin/ufm-review/:ufmId` under `AdminProtectedRoute`.

### [2026-08-07] Primary Entry-Point Startup Schema Auto-Migration for DOB
- **Target File**: `backend/app/main.py`
- **Reason**: Automatically ensure `dob` (Date of Birth) column exists and is committed in `users` table across all database engines on startup.
- **Changes Applied**:
  - `backend/app/main.py`: Added automatic schema verification and execution of `ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(20);` in `startup_event()`.

### [2026-08-17] Super Admin & Institution Hierarchy 4-Tier System Integration
- **Target Files**: `backend/app/main.py`, `frontend/src/App.jsx`
- **Reason**: Implement 4-tier hierarchy system (OSM Super Admin -> Institutions -> Institution Admin -> Admin / Uploader) and auto-migrate institution schema columns.
- **Changes Applied**:
  - `backend/app/main.py`: Mounted `super_admin_router` and `institution_router`, and added automatic column migration (`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS ...`) in `startup_event()` for all 12+ institution metadata fields across database engines (`admin_engine`, `examiner_engine`, `uploader_engine`).
  - `frontend/src/App.jsx`: Registered routes `/super-admin/login`, `/super-admin/dashboard`, `/institution/login`, `/institution/dashboard`.
  - `backend/app/main.py`: Imported `institution_router` from `app.api.ADMIN_API.v1.institution.institution` and registered it on FastAPI `app`. Imported `Institution` model to auto-create `institutions` table on startup.
  - `frontend/src/App.jsx`: Imported `InstitutionLoginPage` and `InstitutionDashboardPage`, registered routes `/institution/login` and `/institution/dashboard`.

### [2026-08-18] Uploader & Examiner Login Pages Single-Page No-Scroll Layout Optimization
- **Target Files**: `frontend/src/uploader/pages/UploaderLoginPage.jsx`, `frontend/src/examiner/pages/ExaminerLoginPage.jsx`
- **Reason**: Ensure login pages fit inside standard viewport height (`100vh`) without vertical scrollbars, while preserving full visibility of all text, fields, buttons, and footers.
- **Changes Applied**:
  - `UploaderLoginPage.jsx`: Configured wrapper to `h-screen flex flex-col overflow-hidden`, compact card size (`w-[520px] p-5`), and optimized spacing.
  - `ExaminerLoginPage.jsx`: Configured wrapper to `h-screen flex flex-col overflow-hidden` with `min-h-0` main content area.




