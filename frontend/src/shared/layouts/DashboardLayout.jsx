import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

const checkBankDetailsComplete = () => {
  const isFlagged = localStorage.getItem("examiner_bank_details_updated");
  const storedData = localStorage.getItem("examiner_bank_details");
  if (isFlagged !== "true" || !storedData) return false;
  try {
    const parsed = JSON.parse(storedData);
    const required = [
      'examinerId', 'evaluatorName', 'mobile', 'email', 'bankNameAsPerAccount',
      'accountNumber', 'confirmAccountNumber', 'ifsc', 'bankName', 'branch', 'bankAddress'
    ];
    return required.every(key => parsed[key] && parsed[key].toString().trim() !== "");
  } catch (e) {
    return false;
  }
};

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isInstructionsAccepted = localStorage.getItem("examiner_instructions_accepted") === "true";
    const isBankUpdated = checkBankDetailsComplete();
    const currentPath = location.pathname;
    
    if (!currentPath.startsWith("/examiner") || currentPath === "/examiner/login") return;

    // 1. Must accept instructions first
    if (!isInstructionsAccepted && currentPath !== "/examiner/instructions") {
      navigate("/examiner/instructions", { replace: true });
      return;
    }

    // 2. Must complete bank details after instructions
    if (isInstructionsAccepted && !isBankUpdated && currentPath !== "/examiner/bank-details" && currentPath !== "/examiner/instructions") {
      navigate("/examiner/bank-details", { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <div className="dashboard">

      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="dashboard-body">

        <Sidebar isOpen={isSidebarOpen} />

        <div className="dashboard-content">

          <Outlet />

        </div>

      </div>

    </div>
  );
}