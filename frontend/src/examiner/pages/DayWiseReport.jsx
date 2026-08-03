import React, { useState, useEffect } from "react";
import "./DayWiseReport.css";
import { useNavigate } from "react-router-dom";

function DayWiseReport() {
  const navigate = useNavigate();

  const [report, setReport] = useState([]);

  useEffect(() => {
    let dailyStats = JSON.parse(localStorage.getItem('daily_stats'));
    
    // Initialize if empty to keep default structure for demo
    if (!dailyStats || Object.keys(dailyStats).length === 0) {
      const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      dailyStats = {
        [`${today}_0899`]: {
          subject: "MODERN PHYSICS",
          completed: 1,
          rejected: 0,
          ufm: 0
        }
      };
      localStorage.setItem('daily_stats', JSON.stringify(dailyStats));
    }

    // Convert object to array for table rendering
    const reportData = Object.entries(dailyStats).map(([key, value], index) => {
      const [date, code] = key.split('_');
      return {
        id: index + 1,
        code,
        subject: value.subject,
        date,
        completed: value.completed,
        rejected: value.rejected,
        ufm: value.ufm
      };
    });

    reportData.reverse(); 
    setReport(reportData);
  }, []);

  const totalCompleted = report.reduce((sum, item) => sum + item.completed, 0);
  const totalRejected = report.reduce((sum, item) => sum + item.rejected, 0);
  const totalUFM = report.reduce((sum, item) => sum + item.ufm, 0);

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
          <span>{totalCompleted + totalRejected + totalUFM}</span>
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

          <tfoot>

            <tr>

              <td colSpan="4">
                <strong>Total</strong>
              </td>

              <td>
                <strong>{totalCompleted}</strong>
              </td>

              <td>
                <strong>{totalRejected}</strong>
              </td>

              <td>
                <strong>{totalUFM}</strong>
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </div>
  );
}

export default DayWiseReport;