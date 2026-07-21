import "./EvaluatorScriptReport.css";
import {
  Search,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

function EvaluatorScriptReport() {
  const reports = [
    {
      id: "670596651730",
      subject: "Modern Physics",
      date: "20-07-2026",
      status: "Completed",
      maxMarks: 100,
      marks: 85,
      percentage: "85%",
      time: "24 min",
    }
  ];

  const totalScripts = reports.length;
  const completed = reports.filter(r => r.status === "Completed").length;
  const pending = reports.filter(r => r.status === "Pending").length;
  const completedScripts = reports.filter(r => r.status === "Completed");
  const avgMarks = completedScripts.length > 0 
    ? Math.round(completedScripts.reduce((sum, r) => sum + parseInt(r.percentage), 0) / completedScripts.length) + "%"
    : "0%";

  return (
    <div className="script-report-page">

      {/* Header */}

      <div className="report-header">

        <div>

          <h1>Evaluator Script Report</h1>

          <p>
            Monitor evaluated scripts and performance.
          </p>

        </div>

        <button className="export-btn">

          <Download size={18} />

          Export Excel

        </button>

      </div>

      {/* Summary */}

      <div className="summary-grid">

        <div className="summary-card">

          <FileText size={30} />

          <h3>Total Scripts</h3>

          <h2>{totalScripts}</h2>

        </div>

        <div className="summary-card">

          <CheckCircle2 size={30} />

          <h3>Completed</h3>

          <h2>{completed}</h2>

        </div>

        <div className="summary-card">

          <Clock size={30} />

          <h3>Pending</h3>

          <h2>{pending}</h2>

        </div>

        <div className="summary-card">

          <Eye size={30} />

          <h3>Average Marks</h3>

          <h2>{avgMarks}</h2>

        </div>

      </div>

      {/* Search */}

      <div className="toolbar">

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Script ID..."
          />

        </div>

        <select>

          <option>All Subjects</option>

          <option>Economics</option>

          <option>Accountancy</option>

        </select>

        <select>

          <option>All Status</option>

          <option>Completed</option>

          <option>Pending</option>

        </select>

      </div>

      {/* Table */}

      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>Script ID</th>

              <th>Subject</th>

              <th>Date</th>

              <th>Status</th>

              <th>Maximum</th>

              <th>Marks</th>

              <th>Percentage</th>

              <th>Time</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {reports.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>

                <td>{item.subject}</td>

                <td>{item.date}</td>

                <td>

                  <span
                    className={
                      item.status === "Completed"
                        ? "badge completed"
                        : "badge pending"
                    }
                  >
                    {item.status}
                  </span>

                </td>

                <td>{item.maxMarks}</td>

                <td>{item.marks}</td>

                <td>{item.percentage}</td>

                <td>{item.time}</td>

                <td>

                  <button className="action-btn">

                    <Eye size={18} />

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

export default EvaluatorScriptReport;