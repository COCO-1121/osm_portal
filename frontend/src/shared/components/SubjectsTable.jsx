import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function SubjectsTable() {
  const navigate = useNavigate();
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiClient.get("/examiner/dashboard");
        if (response.data && response.data.assigned_subjects && response.data.assigned_subjects.length > 0) {
          setSubjectsList(response.data.assigned_subjects);
        } else {
          // Load original assigned subject for this examiner
          const assignedSubject = localStorage.getItem("examiner_assigned_subject") || "PHYSICS (048)";
          const subjectCode = localStorage.getItem("examiner_subject_code") || "048";
          
          setSubjectsList([
            {
              id: 1,
              code: subjectCode,
              name: assignedSubject,
              available: 120,
              completed: parseInt(localStorage.getItem("total_eval_completed") || "0", 10),
              rejected: parseInt(localStorage.getItem("total_rejected_scripts") || "0", 10),
              ufm: 0,
            }
          ]);
        }
      } catch (err) {
        // Fallback to original assigned subject data
        const assignedSubject = localStorage.getItem("examiner_assigned_subject") || "PHYSICS (048)";
        const subjectCode = localStorage.getItem("examiner_subject_code") || "048";

        setSubjectsList([
          {
            id: 1,
            code: subjectCode,
            name: assignedSubject,
            available: 120,
            completed: parseInt(localStorage.getItem("total_eval_completed") || "0", 10),
            rejected: parseInt(localStorage.getItem("total_rejected_scripts") || "0", 10),
            ufm: 0,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="bg-white shadow rounded overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-100 text-black">

          <tr>
            <th className="py-3 px-4">Sl. No.</th>
            <th className="py-3 px-4">Subject Code</th>
            <th className="py-3 px-4">Subject Name</th>
            <th className="py-3 px-4">Available</th>
            <th className="py-3 px-4">Evaluation</th>
            <th className="py-3 px-4">Completed</th>
            <th className="py-3 px-4">Rejected</th>
            <th className="py-3 px-4">UFM</th>
          </tr>

        </thead>

        <tbody>

          {loading ? (
            <tr>
              <td colSpan="8" className="py-6 text-center text-gray-500">
                Loading assessment data...
              </td>
            </tr>
          ) : subjectsList.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-6 text-center text-gray-500">
                No assigned subjects found for evaluation.
              </td>
            </tr>
          ) : (
            subjectsList.map((sub, index) => (

              <tr key={sub.id || index} className="text-center border-b hover:bg-gray-50">

                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4 font-mono font-medium">{sub.code}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{sub.name}</td>
                <td className="py-3 px-4">{sub.available}</td>
                <td className="py-3 px-4">
                  <button 
                    onClick={() => {
                      const targetId = sub.first_barcode || sub.code || "048";
                      navigate(`/examiner/evaluation/${targetId}`);
                    }}
                    className="bg-blue-600 px-5 py-2 rounded text-white font-medium hover:bg-blue-700 transition shadow-sm"
                  >
                    Start
                  </button>
                </td>
                <td className="py-3 px-4 font-semibold">{sub.completed}</td>
                <td className="py-3 px-4">
                  {sub.rejected > 0 ? (
                    <button
                      onClick={() => navigate("/examiner/rejected-scripts")}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full hover:bg-red-200 transition"
                    >
                      {sub.rejected}
                    </button>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="py-3 px-4">{sub.ufm}</td>

              </tr>

            ))
          )}

        </tbody>

      </table>

    </div>
  );
}