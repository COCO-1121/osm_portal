import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function SubjectsTable() {
  const navigate = useNavigate();
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        const response = await apiClient.get("/examiner/dashboard/assigned-copies");
        if (response.data && response.data.copies) {
          setSubjectsList(response.data.copies);
        } else {
          setSubjectsList([]);
        }
      } catch (err) {
        setSubjectsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCopies();
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
          </tr>

        </thead>

        <tbody>

          {loading ? (
            <tr>
              <td colSpan="5" className="py-6 text-center text-gray-500">
                Loading assessment data...
              </td>
            </tr>
          ) : subjectsList.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-6 text-center text-gray-500">
                No assigned subjects found for evaluation.
              </td>
            </tr>
          ) : (
            subjectsList.map((copy, index) => {
              const statusStr = (copy.status || "").toLowerCase();
              const isCompleted = statusStr.includes("completed") || statusStr.includes("evaluated");
              const isRejected = statusStr.includes("reject");
              const isUfm = statusStr.includes("ufm");
              
              return (
                <tr key={copy.id || index} className="text-center border-b hover:bg-gray-50">

                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-mono font-medium">{copy.barcode}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{copy.subject || "PHYSICS (048)"}</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => navigate(`/examiner/evaluation/${copy.barcode}`, { state: { script: copy } })}
                      className="bg-blue-600 px-4 py-2 rounded text-white font-medium hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                    >
                      Evaluate
                    </button>
                  </td>

                </tr>
              );
            })
          )}

        </tbody>

      </table>

    </div>
  );
}