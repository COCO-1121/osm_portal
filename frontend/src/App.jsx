import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
//import Login from "./pages/ExaminerLoginPage";
import InstructionPage from "./pages/InstructionPage";
import BankDetails from "./pages/BankDetails";
//import SubjectSelection from "./pages/SubjectSelection";
import ExaminerSubjectPage from "./pages/ExaminerSubjectPage";
import MainAssessment from "./pages/MainAssessment";
import DayWiseReport from "./pages/DayWiseReport";
import EvaluatorScriptReport from "./pages/EvaluatorScriptReport";
//import ExaminerLoginCard from "./components/ExaminerLoginCard";
import ExaminerLoginPage from "./pages/ExaminerLoginPage";
import EvaluationPage from "./pages/EvaluationPage";
import DashboardLayout from "./layout/DashboardLayout";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelectionPage />} />

        <Route element={<DashboardLayout />}>
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

        <Route path="/login" element={<ExaminerLoginPage />} />
        <Route
          path="/evaluation/:subjectId"
          element={<EvaluationPage />}
        />
        <Route path="/uploader-login" element={<UploaderLoginPage />} />
        <Route path="/uploader/dashboard" element={<UploaderDashboardPage />} />
        <Route path="/rejected-queue" element={<RejectedQueue />} />
        
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/rejected-scripts" element={<RejectedScripts />} />
        <Route path="/admin/rejected-review" element={<RejectedScriptReview />} />
        <Route path="/admin/credential-management" element={<CredentialManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;