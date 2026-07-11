import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ReviewActions() {

  const navigate = useNavigate();

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {

    if (!decision) {
      alert("Please select a review decision.");
      return;
    }

    if (remarks.trim() === "") {
      alert("Please enter remarks.");
      return;
    }

    const message =
      decision === "uploader"
        ? "Are you sure you want to return this script to the uploader?"
        : "Are you sure you want to return this script to the examiner queue?";

    const confirmDecision = window.confirm(message);

    if (!confirmDecision) return;

    alert("Decision submitted successfully.");

    navigate("/admin/rejected-scripts");
  };

  return (

    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Review Decision
      </h2>

      <div className="space-y-4">

        <label className="flex items-center gap-3">

          <input
            type="radio"
            value="uploader"
            checked={decision === "uploader"}
            onChange={(e) => setDecision(e.target.value)}
          />

          Return to Uploader

        </label>

        <label className="flex items-center gap-3">

          <input
            type="radio"
            value="examiner"
            checked={decision === "examiner"}
            onChange={(e) => setDecision(e.target.value)}
          />

          Return to Examiner Queue

        </label>

      </div>

      <div className="mt-6">

        <label className="text-sm text-gray-500">
          Remarks
        </label>

        <textarea
          rows="5"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter remarks..."
          className="w-full mt-2 border border-gray-300 rounded-lg p-4 outline-none focus:border-blue-700"
        />

      </div>

      <div className="flex justify-end mt-8">

        <button
          onClick={handleSubmit}
          className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg transition"
        >
          Submit Decision
        </button>

      </div>

    </div>

  );
}

export default ReviewActions;