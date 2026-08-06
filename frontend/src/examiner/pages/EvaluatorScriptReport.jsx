import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./EvaluatorScriptReport.css";
import {
  Search,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import apiClient from "../../shared/services/apiClient";

function EvaluatorScriptReport() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await apiClient.get("/examiner/evaluator-report");
        if (response.data && Array.isArray(response.data)) {
          setReports(response.data);
        } else if (response.data && Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else {
          // Check local evaluation history
          const stored = localStorage.getItem("evaluated_scripts_history");
          setReports(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        // Fallback to local evaluation history
        const stored = localStorage.getItem("evaluated_scripts_history");
        setReports(stored ? JSON.parse(stored) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Compute unique subjects dynamically
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    return Array.from(set);
  }, [reports]);

  // Compute filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchSearch =
        (item.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subject || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubject =
        selectedSubject === "All Subjects" || item.subject === selectedSubject;

      const matchStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;

      return matchSearch && matchSubject && matchStatus;
    });
  }, [reports, searchTerm, selectedSubject, selectedStatus]);

  // Calculate real metrics
  const totalScriptsCount = reports.length;
  const completedCount = reports.filter((r) => r.status === "Completed").length;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;

  const avgPercentage = useMemo(() => {
    const completedList = reports.filter((r) => r.status === "Completed" && r.marks !== undefined && r.maxMarks);
    if (completedList.length === 0) return 0;
    const totalPerc = completedList.reduce((acc, curr) => {
      const numMarks = parseFloat(curr.marks) || 0;
      const numMax = parseFloat(curr.maxMarks) || 100;
      return acc + (numMarks / numMax) * 100;
    }, 0);
    return Math.round(totalPerc / completedList.length);
  }, [reports]);

  // Handle Export Excel / CSV
  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Script ID", "Subject", "Date", "Status", "Maximum", "Marks", "Percentage", "Time"];
    const rows = filteredReports.map((r) => [
      r.id || "",
      r.subject || "",
      r.date || "",
      r.status || "",
      r.maxMarks || "",
      r.marks || "",
      r.percentage || "",
      r.time || ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Evaluator_Script_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        <button className="export-btn" onClick={handleExportCSV}>

          <Download size={18} />

          Export Excel

        </button>

      </div>

      {/* Summary */}

      <div className="summary-grid">

        <div className="summary-card">

          <FileText size={30} />

          <h3>Total Scripts</h3>

          <h2>{totalScriptsCount}</h2>

        </div>

        <div className="summary-card">

          <CheckCircle2 size={30} />

          <h3>Completed</h3>

          <h2>{completedCount}</h2>

        </div>

        <div className="summary-card">

          <Clock size={30} />

          <h3>Pending</h3>

          <h2>{pendingCount}</h2>

        </div>

        <div className="summary-card">

          <Eye size={30} />

          <h3>Average Marks</h3>

          <h2>{avgPercentage}%</h2>

        </div>

      </div>

      {/* Search */}

      <div className="toolbar">

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Script ID..."
          />

        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >

          <option value="All Subjects">All Subjects</option>
          {uniqueSubjects.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}

        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >

          <option value="All Status">All Status</option>

          <option value="Completed">Completed</option>

          <option value="Pending">Pending</option>

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

            {loading ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  Loading evaluation report...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-400">
                  No evaluated script records found.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (

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

                  <td>{item.maxMarks || 100}</td>

                  <td>{item.marks !== undefined ? item.marks : "--"}</td>

                  <td>{item.percentage || "--"}</td>

                  <td>{item.time || "--"}</td>

                  <td>

                    <button
                      className="action-btn"
                      onClick={() => navigate(`/examiner/evaluation/${item.id}`)}
                    >

                      <Eye size={18} />

                    </button>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default EvaluatorScriptReport;