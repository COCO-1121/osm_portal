import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { FaPlay } from "react-icons/fa";

const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("completed") || s.includes("evaluated")) {
    return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", ring: "ring-green-600/20" };
  }
  if (s.includes("pending") || s.includes("uploaded") || s.includes("assigned")) {
    return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", ring: "ring-yellow-600/20" };
  }
  if (s.includes("reject") || s.includes("ufm")) {
    return { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", ring: "ring-red-600/20" };
  }
  return { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500", ring: "ring-gray-600/20" };
};

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

      {/* Assigned Scripts Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Assigned Scripts</h3>
        {loading ? (
          <p className="text-gray-500 text-center text-sm py-4">Loading assigned scripts...</p>
        ) : assignment.assigned_copies && assignment.assigned_copies.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignment.assigned_copies.map((copy) => {
                  const statusStyle = getStatusStyle(copy.status);
                  return (
                    <tr key={copy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{copy.barcode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{copy.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 inset-ring ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {copy.status || "Assigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => navigate(`/examiner/evaluation/${copy.barcode}`, { state: { script: copy } })}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-900 font-medium transition-colors"
                        >
                          <FaPlay className="text-xs" /> Evaluate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No scripts have been assigned to you yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default SubjectAssignmentCard;