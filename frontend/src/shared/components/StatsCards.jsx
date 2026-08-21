import { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

export default function StatsCards() {
  const [todayCompleted, setTodayCompleted] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/examiner/dashboard");
        if (response.data) {
          setTodayCompleted(response.data.today_eval_completed || 0);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch dashboard stats, using local fallback:", err);
      }

      const today = parseInt(localStorage.getItem("today_eval_completed") || "0", 10);
      setTodayCompleted(isNaN(today) ? 0 : today);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex gap-6 my-6">
      <div className="bg-white shadow w-64 rounded-lg overflow-hidden">
        <div className="bg-gray-200 p-3 font-semibold text-center">
          Today Eval. Completed
        </div>
        <div className="text-center text-3xl py-5 font-bold text-blue-900">
          {todayCompleted}
        </div>
      </div>
    </div>
  );
}