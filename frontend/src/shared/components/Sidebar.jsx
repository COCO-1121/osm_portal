import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/examiner/login" },
  { name: "Instructions", path: "/examiner/instructions" },
  { name: "Banking", path: "/examiner/bank-details" },
  { name: "Subject Assigned", path: "/examiner/subjects" },
  { name: "Main Assessment", path: "/examiner/assessment" },
  { name: "Rejected Scripts", path: "/examiner/rejected-scripts" },
  { name: "Day Wise Report", path: "/examiner/day-wise-report" },
  { name: "Evaluator Script Report", path: "/examiner/evaluator-report" },
];

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

export default function Sidebar({ isOpen = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    const isInstructionsAccepted = localStorage.getItem("examiner_instructions_accepted") === "true";
    const isBankUpdated = checkBankDetailsComplete();
    
    // Allow going to login or home
    if (path === "/" || path === "/examiner/login") {
      navigate(path);
      return;
    }

    if (!isInstructionsAccepted) {
      if (path !== "/examiner/instructions") {
        alert("Please read and accept the instructions first.");
        navigate("/examiner/instructions");
        return;
      }
    } else if (!isBankUpdated) {
      if (path !== "/examiner/bank-details" && path !== "/examiner/instructions") {
        alert("Filling Evaluator Profile & Bank Details is mandatory. Please complete and update your bank details first.");
        navigate("/examiner/bank-details");
        return;
      }
    }

    navigate(path);
  };

  return (
    <div className={`bg-[#2d2f5f] text-white min-h-screen overflow-y-auto transition-all duration-300 whitespace-nowrap ${isOpen ? 'w-64' : 'w-0'}`}>

      {menuItems.map((item) => (
        <div
          key={item.name}
          onClick={() => handleNavigation(item.path)}
          className={`px-6 py-4 cursor-pointer hover:bg-blue-700 ${location.pathname === item.path ? 'bg-blue-700' : ''}`}
        >
          {item.name}
        </div>
      ))}
      
      {/* Logout Option */}
      <div
        onClick={() => {
          localStorage.removeItem('examinerUserId');
          localStorage.removeItem('examinerInstituteId');
          localStorage.removeItem('examinerName');
          localStorage.removeItem('examinerToken');
          localStorage.removeItem('access_token');
          navigate('/');
        }}
        className="px-6 py-4 cursor-pointer hover:bg-red-700 text-red-200 hover:text-white font-semibold transition mt-4"
      >
        Logout
      </div>
    </div>
  );
}