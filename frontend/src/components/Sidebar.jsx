import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/login" },
  { name: "Instructions", path: "/instruction" },
  { name: "Banking", path: "/bank-details" },
  { name: "Subject Assigned", path: "/subject-assignment" },
  { name: "Main Assessment", path: "/main-assessment" },
  { name: "Rejected Scripts", path: "/examiner/rejected-scripts" },
  { name: "Evaluation Screen", path: "/evaluation/0302" },
  { name: "Day Wise Report", path: "/day-report" },
  { name: "Evaluator Script Report", path: "/script-report" },
];

export default function Sidebar({ isOpen = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`bg-[#2d2f5f] text-white min-h-screen overflow-y-auto transition-all duration-300 whitespace-nowrap ${isOpen ? 'w-64' : 'w-0'}`}>

      {menuItems.map((item) => (
        <div
          key={item.name}
          onClick={() => navigate(item.path)}
          className={`px-6 py-4 cursor-pointer hover:bg-blue-700 ${location.pathname === item.path ? 'bg-blue-700' : ''}`}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}