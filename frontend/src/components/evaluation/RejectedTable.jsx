import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function RejectedTable() {

  const navigate = useNavigate();

  const data = [
    {
      barcode: "100245",
      subject: "Physics",
      examiner: "EXM102",
      centreId: "CTR-LKO-001",
      reason: "Blur Scan",
      status: "Pending",
    },
    {
      barcode: "100246",
      subject: "Mathematics",
      examiner: "EXM108",
      centreId: "CTR-JAI-001",
      reason: "Missing Page",
      status: "Returned to Uploader",
    },
    {
      barcode: "100247",
      subject: "Chemistry",
      examiner: "EXM111",
      centreId: "CTR-DEL-001",
      reason: "Wrong Subject",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Rejected Scripts
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Verify rejected scripts before returning them to the uploader.
        </p>

      </div>

      {/* Search */}

      <div className="flex flex-wrap gap-4 mb-6">

        <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-4">

          <FaSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search by Barcode, Examiner ID or Centre ID..."
            className="w-full px-3 py-3 outline-none text-sm"
          />

        </div>

        {/* Status */}

        <select className="border border-gray-300 rounded-lg px-4 py-3 text-sm">

          <option>All</option>
          <option>Pending</option>
          <option>Returned to Uploader</option>

        </select>

        {/* Reject Reason */}

        <select className="border border-gray-300 rounded-lg px-4 py-3 text-sm">

          <option>All Reasons</option>
          <option>Blur Scan</option>
          <option>Missing Page</option>
          <option>Wrong Subject</option>
          <option>Wrong Barcode</option>
          <option>Corrupted PDF</option>
          <option>Blank Pages</option>
          <option>Incomplete Upload</option>

        </select>

      </div>

      {/* Table */}

      <div className="overflow-x-auto rounded-lg border border-gray-200">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4 font-semibold">Barcode</th>

              <th className="text-left font-semibold">Subject</th>

              <th className="text-left font-semibold">Examiner ID</th>

              <th className="text-left font-semibold">Centre ID</th>

              <th className="text-left font-semibold">Reject Reason</th>

              <th className="text-left font-semibold">Status</th>

              <th className="text-center font-semibold">Action</th>

            </tr>

          </thead>

          <tbody>

            {data.map((item, index) => (

              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >

                <td className="p-4">{item.barcode}</td>

                <td>{item.subject}</td>

                <td>{item.examiner}</td>

                <td>{item.centreId}</td>

                <td>{item.reason}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

                <td className="text-center">

                  <button
                    onClick={() => navigate("/admin/rejected-review")}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                  >
                    Review
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default RejectedTable;