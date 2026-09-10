import React, { useState, useEffect } from "react";
import "./DayWiseReport.css";
import { useNavigate } from "react-router-dom";
import apiClient from "../../shared/services/apiClient";

function DayWiseReport() {
  const navigate = useNavigate();

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDayWiseReport() {
      try {
        const response = await apiClient.get("/examiner/day-wise-report");
        if (response.data && Array.isArray(response.data)) {
          setReport(response.data);
        } else {
          loadFallbackLocalStats();
        }
      } catch (err) {
        console.warn("API day-wise report unavailable, using dynamic fallback:", err);
        loadFallbackLocalStats();
      } finally {
        setLoading(false);
      }
    }

    function loadFallbackLocalStats() {
      const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      let dailyStats = JSON.parse(localStorage.getItem('daily_stats'));
      
      // Clean up old stale demo keys if present
      if (dailyStats && (dailyStats['17-07-2026_0302'] || dailyStats['20-07-2026_0302'] || dailyStats['19-08-2026_0302'])) {
        delete dailyStats['17-07-2026_0302'];
        delete dailyStats['20-07-2026_0302'];
        delete dailyStats['19-08-2026_0302'];
        localStorage.setItem('daily_stats', JSON.stringify(dailyStats));
      }

      if (!dailyStats || Object.keys(dailyStats).length === 0) {
        dailyStats = {
          [`${today}_048`]: {
            subject: "PHYSICS (048)",
            completed: 0,
            rejected: 0,
            ufm: 0
          }
        };
      }

      const reportData = Object.entries(dailyStats).map(([key, value], index) => {
        const [date, code] = key.split('_');
        const comp = value.completed || 0;
        const rej = value.rejected || 0;
        const ufm = value.ufm || 0;
        return {
          id: index + 1,
          code: code || "048",
          subject: value.subject || "PHYSICS (048)",
          date: date || today,
          completed: comp,
          rejected: rej,
          ufm: ufm,
          total: value.total ?? Math.max(1, comp + rej + ufm)
        };
      });
      reportData.reverse();
      setReport(reportData);
    }

    fetchDayWiseReport();
  }, []);

  const totalCompleted = report.reduce((sum, item) => sum + (item.completed || 0), 0);
  const totalRejected = report.reduce((sum, item) => sum + (item.rejected || 0), 0);
  const totalUFM = report.reduce((sum, item) => sum + (item.ufm || 0), 0);
  const totalScripts = report.reduce(
    (sum, item) => sum + (item.total !== undefined && item.total !== null ? item.total : Math.max(1, (item.completed || 0) + (item.rejected || 0) + (item.ufm || 0))),
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
            onClick={() => navigate('/examiner/evaluator-report')}
            style={{ backgroundColor: '#0d6efd', color: 'white' }}
          >
            View Script Report
          </button>
          
          <button className="download-btn" onClick={() => alert("Downloading Excel Report...")}>
            Download Excel
          </button>
        </div>

      </div>

      <div className="summary">

        <div className="card">
          <h3>Total Scripts</h3>
          <span>{totalScripts}</span>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <span>{totalCompleted}</span>
        </div>

        <div className="card">
          <h3>Rejected</h3>
          <span>{totalRejected}</span>
        </div>

        <div className="card">
          <h3>UFM</h3>
          <span>{totalUFM}</span>
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



        </table>

      </div>

    </div>
  );
}

export default DayWiseReport;