import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import InstructionPage from "./pages/InstructionPage";
import BankDetails from "./pages/BankDetails";
import ExaminerSubjectPage from "./pages/ExaminerSubjectPage";
import MainAssessment from "./pages/MainAssessment";
import DayWiseReport from "./pages/DayWiseReport";
import EvaluatorScriptReport from "./pages/EvaluatorScriptReport";
import ExaminerLoginPage from "./pages/ExaminerLoginPage";
import EvaluationPage from "./pages/EvaluationPage";
import ExaminerLayout from "./layouts/ExaminerLayout";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import UploaderLoginPage from "./pages/UploaderLoginPage";
import UploaderDashboardPage from "./pages/UploaderDashboardPage";
import RejectedQueue from "./pages/RejectedQueue";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import RejectedScripts from "./pages/RejectedScripts";
import RejectedScriptReview from "./pages/RejectedScriptReview";
import CredentialManagement from "./pages/CredentialManagement";
import ExaminerRejectedScripts from "./pages/ExaminerRejectedScripts";
import CreateExaminer from "./pages/CreateExaminer";
import ExaminerManagement from "./pages/ExaminerManagement";
import AdminLayout from "./layouts/AdminLayout";
import AuditLogs from "./pages/AuditLogs";
import AdminProfile from "./pages/AdminProfile";

// Admin route protection
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Role Selection */}
        <Route path="/" element={<RoleSelectionPage />} />

        {/* Examiner Dashboard Routes */}
        <Route element={<ExaminerLayout />}>
          <Route path="/home" element={<Home />} />
          <Route
            path="/instruction"
            element={<InstructionPage />}
          />
          <Route
            path="/bank-details"
            element={<BankDetails />}
          />
          <Route
            path="/subject-assignment"
            element={<ExaminerSubjectPage />}
          />
          <Route
            path="/main-assessment"
            element={<MainAssessment />}
          />
          <Route
            path="/day-report"
            element={<DayWiseReport />}
          />
          <Route
            path="/script-report"
            element={<EvaluatorScriptReport />}
          />
          <Route
            path="/examiner/rejected-scripts"
            element={<ExaminerRejectedScripts />}
          />
        </Route>

        {/* Examiner Login */}
        <Route
          path="/login"
          element={<ExaminerLoginPage />}
        />

        {/* Evaluation */}
        <Route
          path="/evaluation/:subjectId"
          element={<EvaluationPage />}
        />

        {/* Uploader Routes */}
        <Route
          path="/uploader-login"
          element={<UploaderLoginPage />}
        />

        <Route
          path="/uploader/dashboard"
          element={<UploaderDashboardPage />}
        />

        <Route
          path="/rejected-queue"
          element={<RejectedQueue />}
        />

        {/* Admin Login - Public */}
        <Route
          path="/admin-login"
          element={<AdminLoginPage />}
        />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/rejected-scripts"
            element={<RejectedScripts />}
          />

          <Route
            path="/admin/rejected-review/:rejectionId"
            element={<RejectedScriptReview />}
          />

          <Route
            path="/admin/create-examiner"
            element={<CreateExaminer />}
          />

          <Route
            path="/admin/examiners"
            element={<ExaminerManagement />}
          />

          <Route
            path="/admin/credential-management"
            element={<CredentialManagement />}
          />

          <Route
            path="/admin/audit-logs"
            element={<AuditLogs />}
          />

          <Route
            path="/admin/profile"
            element={<AdminProfile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;