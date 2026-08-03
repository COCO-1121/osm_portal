import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Shared Pages & Components
import RoleSelectionPage from './shared/pages/RoleSelectionPage';
import Home from './shared/pages/Home';
import DashboardLayout from './shared/layouts/DashboardLayout';

// Admin Module Pages
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProfile from './admin/pages/AdminProfile';
import AuditLogs from './admin/pages/AuditLogs';
import CreateExaminer from './admin/pages/CreateExaminer';
import ExaminerManagement from './admin/pages/ExaminerManagement';
import RejectedQueue from './admin/pages/RejectedQueue';
import RejectedScriptReview from './admin/pages/RejectedScriptReview';
import CredentialManagement from './admin/pages/CredentialManagement';

// Examiner Module Pages
import ExaminerLoginPage from './examiner/pages/ExaminerLoginPage';
import ExaminerSubjectPage from './examiner/pages/ExaminerSubjectPage';
import EvaluationPage from './examiner/pages/EvaluationPage';
import InstructionPage from './examiner/pages/InstructionPage';
import BankDetails from './examiner/pages/BankDetails';
import DayWiseReport from './examiner/pages/DayWiseReport';
import EvaluatorScriptReport from './examiner/pages/EvaluatorScriptReport';
import MainAssessment from './examiner/pages/MainAssessment';
import ExaminerRejectedScripts from './examiner/pages/ExaminerRejectedScripts';

// Uploader Module Pages
import UploaderLoginPage from './uploader/pages/UploaderLoginPage';
import UploaderDashboardPage from './uploader/pages/UploaderDashboardPage';
import UploadedCopies from './uploader/pages/UploadedCopies';
import PreviewPage from './uploader/pages/PreviewPage';
import UploaderRejectedQueue from './uploader/pages/RejectedQueue';

import AdminProtectedRoute from './admin/components/AdminProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public & Role Selector Routes */}
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/home" element={<Home />} />

        {/* Public Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* ================= PROTECTED ADMIN ROUTES ================= */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/create-examiner" element={<CreateExaminer />} />
          <Route path="/admin/examiners" element={<ExaminerManagement />} />
          <Route path="/admin/rejected-queue" element={<RejectedQueue />} />
          <Route path="/admin/rejected-review" element={<RejectedScriptReview />} />
          <Route path="/admin/rejected-review/:rejectionId" element={<RejectedScriptReview />} />
          <Route path="/admin/credentials" element={<CredentialManagement />} />
          <Route path="/admin/credential-management" element={<CredentialManagement />} />
          <Route path="/admin/rejected-scripts" element={<RejectedQueue />} />
        </Route>

        {/* ================= EXAMINER ROUTES WITH DASHBOARD LAYOUT ================= */}
        <Route element={<DashboardLayout />}>
          <Route path="/examiner/dashboard" element={<ExaminerSubjectPage />} />
          <Route path="/examiner/subjects" element={<ExaminerSubjectPage />} />
          <Route path="/examiner/instructions" element={<InstructionPage />} />
          <Route path="/examiner/bank-details" element={<BankDetails />} />
          <Route path="/examiner/day-wise-report" element={<DayWiseReport />} />
          <Route path="/examiner/evaluator-report" element={<EvaluatorScriptReport />} />
          <Route path="/examiner/assessment" element={<MainAssessment />} />
          <Route path="/examiner/rejected-scripts" element={<ExaminerRejectedScripts />} />

          {/* Legacy Examiner Route Aliases */}
          <Route path="/instruction" element={<InstructionPage />} />
          <Route path="/bank-details" element={<BankDetails />} />
          <Route path="/subject-assignment" element={<ExaminerSubjectPage />} />
          <Route path="/main-assessment" element={<MainAssessment />} />
          <Route path="/day-report" element={<DayWiseReport />} />
          <Route path="/script-report" element={<EvaluatorScriptReport />} />
        </Route>

        {/* Standalone Examiner Pages (No Layout Wrapper) */}
        <Route path="/examiner/login" element={<ExaminerLoginPage />} />
        <Route path="/login" element={<ExaminerLoginPage />} />
        <Route path="/examiner/evaluation" element={<EvaluationPage />} />
        <Route path="/examiner/evaluation/:scriptId" element={<EvaluationPage />} />
        <Route path="/evaluation/:subjectId" element={<EvaluationPage />} />

        {/* ================= UPLOADER ROUTES ================= */}
        <Route path="/uploader/login" element={<UploaderLoginPage />} />
        <Route path="/uploader-login" element={<UploaderLoginPage />} />
        <Route path="/uploader/dashboard" element={<UploaderDashboardPage />} />
        <Route path="/uploader/uploads" element={<UploadedCopies />} />
        <Route path="/uploader/uploaded-copies" element={<UploadedCopies />} />
        <Route path="/uploader/preview" element={<PreviewPage />} />
        <Route path="/uploader/preview/:docId" element={<PreviewPage />} />

        {/* Shared / Legacy Route Aliases */}
        <Route path="/rejected-queue" element={<UploaderRejectedQueue />} />

        {/* Fallback to Role Selector */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
