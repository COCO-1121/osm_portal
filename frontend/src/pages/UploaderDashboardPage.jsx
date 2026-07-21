import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploaderDashboard.css";

import {
  FaExclamationCircle,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaHome,
  FaHistory,
  FaQuestionCircle,
} from "react-icons/fa";

function UploaderDashboard() {
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleStartUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadSuccess(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      navigate("/uploader-login");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-5">
            <span className="text-xl font-bold text-gray-800">OSM Portal</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold cursor-pointer">
              <FaHome /> Home
            </a>
            <a onClick={() => navigate("/rejected-queue")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaExclamationCircle /> Rejected Queue
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaHistory /> History
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaQuestionCircle /> Support
            </a>
          </nav>
        </div>

        <div className="px-3 pb-5">
          <a onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium cursor-pointer">
            <FaSignOutAlt /> Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
          <h2 className="text-xl font-bold text-gray-800">On-Screen Marking System</h2>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Uploader</p>
              <p className="text-xs text-gray-500">ID: 992831</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              UP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 flex-1">

        <div className="dashboardCard">

          <h1>Uploader</h1>

          <p className="subTitle">
            Manage scanned answer sheets and upload them securely.
          </p>

          {/* Action Buttons */}

          <div className="actionButtons">

            <button
              className="actionBtn"
              onClick={() => navigate("/rejected-queue")}
            >
              <FaExclamationCircle />
              <span>Rejected Queue</span>
            </button>

            <button className="actionBtn">
              <FaEye />
              <span>View Scanned Copy</span>
            </button>

          </div>

          {/* Form */}

          <div className="formSection">

            <div className="field">

              <label>Select Date</label>

              <div className="inputBox">
                <FaCalendarAlt className="icon" />
                <input type="date" />
              </div>

            </div>

            <div className="field">

              <label>Select Exam</label>

              <div className="inputBox">
                <FaGraduationCap className="icon" />

                <select>

                  <option>Select Exam</option>

                  <option>B.Tech Semester 1</option>

                  <option>B.Tech Semester 2</option>

                  <option>BCA Semester 1</option>

                  <option>BCA Semester 2</option>

                  <option>MCA Semester 1</option>

                </select>

              </div>

            </div>

          </div>

          {/* Upload */}

          <div className="uploadSection" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center", width: "100%", maxWidth: "500px", margin: "20px auto 0 auto" }}>

            <input
              type="file"
              accept=".pdf"
              id="file-upload"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setUploadSuccess(false);
                  setUploadProgress(0);
                }
              }}
            />

            {!selectedFile && !uploadSuccess && (
              <label
                htmlFor="file-upload"
                className="uploadBtn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  backgroundColor: "#0d5d2f",
                  color: "#fff",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center"
                }}
              >
                <FaCloudUploadAlt size={20} />
                Choose PDF file to Upload
              </label>
            )}

            {selectedFile && !uploadSuccess && (
              <div style={{ width: "100%", textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "8px", border: "1px dashed #d1d5db" }}>
                <p style={{ fontWeight: "semibold", marginBottom: "10px", color: "#374151" }}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                
                {isUploading ? (
                  <div style={{ width: "100%", marginTop: "10px" }}>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "#0d5d2f", transition: "width 0.1s ease" }}></div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>Uploading: {uploadProgress}%</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button
                      onClick={handleStartUpload}
                      className="uploadBtn"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#0d5d2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Start Upload
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {uploadSuccess && (
              <div style={{ width: "100%", textAlign: "center", padding: "15px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #10b981" }}>
                <p style={{ color: "#065f46", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  ✓ Upload Successful!
                </p>
                <p style={{ fontSize: "13px", color: "#047857", marginTop: "4px" }}>
                  All 10 pages of "{selectedFile?.name}" have been processed and loaded.
                </p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadSuccess(false);
                  }}
                  style={{
                    marginTop: "10px",
                    padding: "6px 12px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Upload Another File
                </button>
              </div>
            )}

          </div>

          {/* Uploaded PDF Preview section */}
          {uploadSuccess && (
            <div style={{ marginTop: "40px", borderTop: "2px solid #e5e7eb", paddingTop: "30px", width: "100%" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px", textAlign: "left" }}>
                Uploaded Document Preview (All 10 Pages)
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", maxHeight: "600px", overflowY: "auto", padding: "20px", backgroundColor: "#f3f4f6", borderRadius: "10px" }}>
                
                {/* Page 1 */}
                <div style={{ backgroundColor: "#fff", padding: "40px", width: "100%", maxWidth: "600px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>Sample OSM Answer Sheet (Development Only)</h4>
                  <div style={{ fontSize: "14px", borderBottom: "1px solid #ccc", paddingBottom: "15px", marginBottom: "20px" }}>
                    <p><strong>Subject:</strong> Economics (0302)</p>
                    <p><strong>Script ID:</strong> 684429</p>
                    <p><strong>Roll No.:</strong> 2410368</p>
                    <p><strong>Candidate:</strong> Sample Student</p>
                  </div>
                  <h5 style={{ fontWeight: "bold", marginBottom: "10px" }}>Question Paper Marks Distribution</h5>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f3f4f6" }}>
                        <th style={{ border: "1px solid #ddd", padding: "6px" }}>Question</th>
                        <th style={{ border: "1px solid #ddd", padding: "6px" }}>Max Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{q:"Q1",m:2},{q:"Q2",m:3},{q:"Q3",m:5},{q:"Q4",m:5},{q:"Q5",m:5},{q:"Q6",m:5},{q:"Q7",m:5},{q:"Q8",m:5},{q:"Q9",m:5}].map((r,i)=>(
                        <tr key={i}><td style={{ border: "1px solid #ddd", padding: "4px", textAlign:"center" }}>{r.q}</td><td style={{ border: "1px solid #ddd", padding: "4px", textAlign:"center" }}>{r.m}</td></tr>
                      ))}
                      <tr style={{ fontWeight: "bold" }}><td style={{ border: "1px solid #ddd", padding: "6px", textAlign:"center" }}>Total</td><td style={{ border: "1px solid #ddd", padding: "6px", textAlign:"center" }}>40</td></tr>
                    </tbody>
                  </table>
                  <div style={{ textAlign: "right", fontSize: "11px", color: "#9ca3af", marginTop: "15px" }}>Page 1 of 10</div>
                </div>

                {/* Page 2-10 */}
                {[
                  { p: 2, q: "Q1 (2 Marks)", text: "Question: Define Economics.", ans: "Economics is the study of allocating scarce resources to satisfy unlimited wants." },
                  { p: 3, q: "Q2 (3 Marks)", text: "Question: State the Law of Demand.", ans: "The law of demand states that quantity demanded falls as price rises, assuming other factors remain constant." },
                  { p: 4, q: "Q3 (5 Marks)", text: "Question: Explain Inflation.", ans: "Inflation is a persistent rise in the general price level. It reduces purchasing power and influences interest rates." },
                  { p: 5, q: "Q4 (5 Marks)", text: "Question: What is GDP?", ans: "GDP measures the market value of final goods and services produced within a country." },
                  { p: 6, q: "Q5 (5 Marks)", text: "Question: Explain Fiscal Policy.", ans: "Fiscal policy uses taxation and government spending to influence economic activity." },
                  { p: 7, q: "Q6 (5 Marks)", text: "Question: Comparative Advantage", ans: "Countries specialize where they have lower opportunity costs, increasing efficiency." },
                  { p: 8, q: "Q7 (5 Marks)", text: "Question: Importance of Budget", ans: "A budget helps allocate resources and control expenditure." },
                  { p: 9, q: "Q8 (5 Marks)", text: "Question: Role of Banks", ans: "Banks mobilize savings and provide loans to households and businesses." },
                  { p: 10, q: "Q9 (5 Marks)", text: "Question: Sustainable Development", ans: "Development should meet present needs without compromising future generations." }
                ].map((pg) => (
                  <div key={pg.p} style={{ backgroundColor: "#fff", padding: "40px", width: "100%", maxWidth: "600px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "12px", borderBottom: "1px dashed #eee", paddingBottom: "5px", marginBottom: "15px" }}>
                      <span>OSM Evaluation</span>
                      <span>Page {pg.p}</span>
                    </div>
                    <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#111", marginBottom: "10px" }}>{pg.q}</h4>
                    <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px", backgroundColor: "#f9fafb", padding: "8px", borderLeft: "3px solid #0d5d2f" }}>{pg.text}</p>
                    <div>
                      {[...Array(5)].map((_, idx) => (
                        <p key={idx} style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.5", marginBottom: "10px" }}>{pg.ans}</p>
                      ))}
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#9ca3af", marginTop: "15px" }}>Page {pg.p} of 10</div>
                  </div>
                ))}

              </div>
            </div>
          )}

        </div>

        </main>

      </div>

    </div>
  );
}

export default UploaderDashboard;