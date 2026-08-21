import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function SubjectAssignmentCard() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState({
    examiner_id: localStorage.getItem("examiner_id") || localStorage.getItem("examinerUserId") || "EXM001",
    institute_id: localStorage.getItem("institute_id") || "INST-001",
    session: "February 2026",
    assigned_subject: "PHYSICS (048)",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignment() {
      const storedEx = localStorage.getItem("examiner_id") || localStorage.getItem("examinerUserId");
      const storedInst = localStorage.getItem("institute_id");
      try {
        // Fetch examiner assignment profile
        const response = await apiClient.get("/examiner/me/assignment");

        // Fetch copies automatically assigned to this examiner
        const copiesRes = await apiClient.get("/examiner/dashboard/assigned-copies");
        console.log("Copies assigned to logged-in examiner:", copiesRes.data.copies);

        if (response.data) {
          setAssignment((prev) => ({
            ...prev,
            ...response.data,
            examiner_id: storedEx || response.data.examiner_id || prev.examiner_id,
            institute_id: storedInst || response.data.institute_id || prev.institute_id,
            assigned_copies: copiesRes.data.copies || [],
            total_copies: copiesRes.data.count || 0
          }));
        }
      } catch (err) {
        console.warn("Could not load backend assignment, checking local user storage...", err);
        if (storedEx || storedInst) {
          setAssignment((prev) => ({
            ...prev,
            examiner_id: storedEx || prev.examiner_id,
            institute_id: storedInst || prev.institute_id,
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAssignment();
  }, []);


  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 p-6">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-5">
        Examiner Subject Assignment
      </h1>

      {/* Examiner Details */}
      <div className="space-y-3 text-base">

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Examiner ID
          </span>

          <span className="font-semibold text-gray-800">
            {loading ? "..." : assignment.examiner_id}
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Institute ID
          </span>

          <span className="font-semibold text-gray-800">
            {loading ? "..." : assignment.institute_id}
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Session
          </span>

          <span className="font-semibold text-gray-800">
            {loading ? "..." : assignment.session}
          </span>
        </div>

      </div>

      {/* Assigned Subject */}
      <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">

        <p className="uppercase tracking-[3px] text-gray-600 text-xs font-semibold">
          Assigned Subject
        </p>

        <h2 className="text-4xl font-bold text-blue-700 mt-2">
          {loading ? "Loading..." : assignment.assigned_subject}
        </h2>

        <p className="text-gray-600 text-sm leading-6 mt-3">
          This subject has been assigned by the administrator.
          Subject assignment cannot be modified by the examiner.
        </p>

      </div>

      {/* Button */}
      <div className="mt-5 flex justify-center">

        <button
          onClick={() => navigate("/examiner/evaluation")}
          className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-2.5 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
        >
          Access Session
        </button>

      </div>

    </div>
  );
}

export default SubjectAssignmentCard;