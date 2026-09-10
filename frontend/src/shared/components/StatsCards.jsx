import { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

export default function StatsCards() {
  const [totalAssigned, setTotalAssigned] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/examiner/dashboard");
        if (response.data) {
          setTotalAssigned(response.data.total_assigned || 0);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch dashboard stats, using local fallback:", err);
      }

      const assigned = parseInt(localStorage.getItem("total_assigned") || "0", 10);
      setTotalAssigned(isNaN(assigned) ? 0 : assigned);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex gap-6 my-6">
      <div className="bg-white shadow w-64 rounded-lg overflow-hidden">
        <div className="bg-gray-200 p-3 font-semibold text-center">
          Total Assigned
        </div>
        <div className="text-center text-3xl py-5 font-bold text-blue-900">
          {totalAssigned}
        </div>
      </div>
    </div>
  );
}