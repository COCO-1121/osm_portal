import { useState, useEffect } from "react";

export default function StatsCards() {
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(0);

  useEffect(() => {
    // Retrieve evaluation metrics from stored stats or backend API
    const total = parseInt(localStorage.getItem("total_eval_completed") || "0", 10);
    const today = parseInt(localStorage.getItem("today_eval_completed") || "0", 10);

    setTotalCompleted(isNaN(total) ? 0 : total);
    setTodayCompleted(isNaN(today) ? 0 : today);
  }, []);

  return (
    <div className="flex gap-6 my-6">

      <div className="bg-white shadow w-64 rounded-lg overflow-hidden">

        <div className="bg-gray-200 p-3 font-semibold text-center">
          Total Eval. Completed
        </div>

        <div className="text-center text-3xl py-5 font-bold text-blue-900">
          {totalCompleted}
        </div>

      </div>

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