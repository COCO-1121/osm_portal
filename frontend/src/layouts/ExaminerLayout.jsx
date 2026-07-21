import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "./ExaminerLayout.css";

export default function ExaminerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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