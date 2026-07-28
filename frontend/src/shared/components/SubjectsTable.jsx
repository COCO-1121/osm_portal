import { useNavigate } from "react-router-dom";

const subjects = [
  {
    id: 1,
    code: "0302",
    name: "ECONOMICS-Set-2",
    available: 33221,
    completed: 3,
    rejected: 2,
    ufm: 0,
  },
  {
    id: 2,
    code: "0551",
    name: "ACCOUNTANCY-Set-1",
    available: 47885,
    completed: 0,
    rejected: 0,
    ufm: 0,
  },
];
export default function SubjectsTable() {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow rounded">

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

          {subjects.map((sub) => (

            <tr key={sub.id} className="text-center border-b">

              <td className="py-3 px-4">{sub.id}</td>
              <td className="py-3 px-4">{sub.code}</td>
              <td className="py-3 px-4">{sub.name}</td>
              <td className="py-3 px-4">{sub.available}</td>
              <td className="py-3 px-4">
                <button 
                  onClick={() => navigate(`/evaluation/${sub.code}`)}
                  className="bg-blue-600 px-5 py-2 rounded text-white font-medium hover:bg-blue-700"
                >
                  Start
                </button>
              </td>
              <td className="py-3 px-4">{sub.completed}</td>
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

          ))}

        </tbody>

      </table>

    </div>
  );
}