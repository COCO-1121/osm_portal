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
      subject: "Economics",
      date: "18-02-2026",
      status: "Completed",
      maxMarks: 100,
      marks: 82,
      percentage: "82%",
      time: "24 min",
    },
    {
      id: "670596651731",
      subject: "Economics",
      date: "18-02-2026",
      status: "Completed",
      maxMarks: 100,
      marks: 76,
      percentage: "76%",
      time: "21 min",
    },
    {
      id: "670596651732",
      subject: "Economics",
      date: "17-02-2026",
      status: "Pending",
      maxMarks: 100,
      marks: "--",
      percentage: "--",
      time: "--",
    },
    {
      id: "670596651733",
      subject: "Accountancy",
      date: "16-02-2026",
      status: "Completed",
      maxMarks: 80,
      marks: 65,
      percentage: "81%",
      time: "18 min",
    },
  ];

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

          <h2>150</h2>

        </div>

        <div className="summary-card">

          <CheckCircle2 size={30} />

          <h3>Completed</h3>

          <h2>126</h2>

        </div>

        <div className="summary-card">

          <Clock size={30} />

          <h3>Pending</h3>

          <h2>24</h2>

        </div>

        <div className="summary-card">

          <Eye size={30} />

          <h3>Average Marks</h3>

          <h2>74%</h2>

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