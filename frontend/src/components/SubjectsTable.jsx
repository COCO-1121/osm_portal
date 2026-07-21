import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

export default function SubjectsTable() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      code: "0302",
      name: "ECONOMICS-Set-2",
      available: 33221,
      completed: 0,
      rejected: 0,
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
  ]);

  useEffect(() => {
    const dailyStats = JSON.parse(localStorage.getItem('daily_stats')) || {};
    
    // Aggregate by subject code
    const aggregated = {};
    Object.entries(dailyStats).forEach(([key, stats]) => {
      const code = key.split('_')[1];
      if (!aggregated[code]) {
        aggregated[code] = { completed: 0, rejected: 0, ufm: 0 };
      }
      aggregated[code].completed += stats.completed;
      aggregated[code].rejected += stats.rejected;
      aggregated[code].ufm += stats.ufm;
    });

    setSubjects(prev => prev.map(sub => {
      const updatedStats = aggregated[sub.code];
      if (updatedStats) {
        return {
          ...sub,
          completed: updatedStats.completed,
          rejected: updatedStats.rejected,
          ufm: updatedStats.ufm,
        };
      }
      return sub;
    }));
  }, []);
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
                {localStorage.getItem(`saved_evaluation_${sub.code}`) === 'true' ? (
                  <button 
                    onClick={() => navigate(`/evaluation/${sub.code}`)}
                    className="bg-orange-500 px-5 py-2 rounded text-white font-medium hover:bg-orange-600"
                  >
                    Resume
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/evaluation/${sub.code}`)}
                    className="bg-blue-600 px-5 py-2 rounded text-white font-medium hover:bg-blue-700"
                  >
                    Start
                  </button>
                )}
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