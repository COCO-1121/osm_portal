import { useNavigate } from "react-router-dom";

const rejectedScripts = [
  {
    barcode: "100245",
    subject: "Economics",
    version: "V1",
    adminRemarks: "Continue evaluation.",
    status: "Pending",
    subjectCode: "0302",
  },
  {
    barcode: "100312",
    subject: "Accountancy",
    version: "V2",
    adminRemarks: "Verified and reassigned.",
    status: "Pending",
    subjectCode: "0551",
  },
];

export default function ExaminerRejectedTable() {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Rejected Scripts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Scripts returned to you by the admin for re-evaluation.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-6 py-3">Barcode</th>
              <th className="text-left px-6 py-3">Subject</th>
              <th className="text-left px-6 py-3">Version</th>
              <th className="text-left px-6 py-3">Admin Remarks</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-center px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rejectedScripts.map((script, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">

                <td className="px-6 py-4 font-mono font-semibold text-gray-800">
                  {script.barcode}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {script.subject}
                </td>

                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {script.version}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-600 max-w-xs">
                  {script.adminRemarks}
                </td>

                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                    {script.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => navigate(`/evaluation/${script.subjectCode}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm hover:shadow-md"
                  >
                    Resume Evaluation
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {rejectedScripts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No rejected scripts</p>
            <p className="text-sm mt-1">All scripts have been cleared.</p>
          </div>
        )}
      </div>

    </div>
  );
}
