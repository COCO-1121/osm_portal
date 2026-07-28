import "./DayWiseReport.css";
import { useNavigate } from "react-router-dom";
function DayWiseReport() {
  const navigate = useNavigate();

  const report = [
    {
      id: 1,
      code: "0302",
      subject: "ECONOMICS - Set 2",
      date: "18-02-2026",
      completed: 2,
      rejected: 0,
      ufm: 0,
    },
    {
      id: 2,
      code: "0302",
      subject: "ECONOMICS - Set 2",
      date: "17-02-2026",
      completed: 1,
      rejected: 0,
      ufm: 0,
    },
    {
      id: 3,
      code: "0551",
      subject: "ACCOUNTANCY - Set 1",
      date: "16-02-2026",
      completed: 0,
      rejected: 0,
      ufm: 0,
    },
  ];

  const totalCompleted = report.reduce(
    (sum, item) => sum + item.completed,
    0
  );

  return (
    <div className="report-page">

      <div className="page-header">

        <div>
          <h1>Day Wise Report</h1>
          <p>View your daily evaluation summary.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="download-btn"
            onClick={() => navigate('/script-report')}
            style={{ backgroundColor: '#0d6efd', color: 'white' }}
          >
            View Report
          </button>
          
          <button className="download-btn">
            Download Excel
          </button>
        </div>

      </div>

      <div className="summary">

        <div className="card">
          <h3>Total Scripts</h3>
          <span>3</span>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <span>{totalCompleted}</span>
        </div>

        <div className="card">
          <h3>Rejected</h3>
          <span>0</span>
        </div>

        <div className="card">
          <h3>UFM</h3>
          <span>0</span>
        </div>

      </div>

      <div className="table-card">

        <table>

          <thead>

            <tr>
              <th>Sl.</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Valuation Date</th>
              <th>Completed</th>
              <th>Rejected</th>
              <th>UFM</th>
            </tr>

          </thead>

          <tbody>

            {report.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.code}</td>
                <td>{item.subject}</td>
                <td>{item.date}</td>
                <td>{item.completed}</td>
                <td>{item.rejected}</td>
                <td>{item.ufm}</td>

              </tr>

            ))}

          </tbody>

          <tfoot>

            <tr>

              <td colSpan="4">
                <strong>Total</strong>
              </td>

              <td>
                <strong>{totalCompleted}</strong>
              </td>

              <td>0</td>

              <td>0</td>

            </tr>

          </tfoot>

        </table>

      </div>

    </div>
  );
}

export default DayWiseReport;