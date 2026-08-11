import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaHistory,
  FaQuestionCircle,
  FaFileAlt,
  FaExclamationCircle,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaCloudUploadAlt,
  FaChevronDown,
} from "react-icons/fa";

function UploaderDashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedDate) {
        setExams([]);
        setSelectedExam("");
        return;
      }

      const token = localStorage.getItem("uploader_token");
      if (!token) return;

      setExamsLoading(true);
      setSelectedExam("");

      try {
        const response = await fetch(
          "/api/exams/?date=" + encodeURIComponent(selectedDate),
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (!response.ok) {
          setExams([]);
          setExamsLoading(false);
          return;
        }

        const data = await response.json();
        setExams(data || []);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, [selectedDate]);

  const uploadButtonLabel = uploading ? "Uploading..." : "Upload";

  const performUpload = async (pickedFile) => {
    const token = localStorage.getItem("uploader_token");
    if (!token) {
      alert("Please login again.");
      navigate("/uploader-login");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("exam_id", selectedExam);
      formData.append("date", selectedDate);
      formData.append("file", pickedFile);

      const response = await fetch("/api/scanned-documents/upload", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("uploader_token");
        localStorage.removeItem("uploader_id");
        navigate("/uploader-login");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("Upload failed:", response.status, text);
        setMessageType("error");
        setMessage(
          "Upload failed (Status " + response.status + "). " + (text ? text.slice(0, 200) : "")
        );
        return;
      }

      setMessageType("success");
      setMessage("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Unable to connect to backend. " + (err?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!selectedDate || !selectedExam) {
      setMessageType("error");
      setMessage("Please select date and exam before uploading.");
      return;
    }
    setMessage("");
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    performUpload(picked);
  };

  const messageColor =
    messageType === "success"
      ? "#16a34a"
      : messageType === "error"
      ? "#ef4444"
      : "#6b7280";

  const examDropdownPlaceholder = !selectedDate
    ? "Select date first"
    : examsLoading
    ? "Loading exams..."
    : exams.length === 0
    ? "No exams on this date"
    : "Select Exam";

  const examSelectDisabled = !selectedDate || examsLoading || exams.length === 0;

  const navLinkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    color: active ? "#111827" : "#4b5563",
    background: active ? "#f3f4f6" : "transparent",
    fontSize: "16px",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "288px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ padding: "24px" }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>OSM Portal</span>
          </div>

          <nav style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", padding: "0 16px" }}>
            <a onClick={() => navigate("/uploader/dashboard")} style={navLinkStyle(true)}>
              <FaHome style={{ fontSize: "18px" }} />
              <span>Home</span>
            </a>
            <a onClick={() => navigate("/uploader/rejected-queue")} style={navLinkStyle(false)}>
              <FaExclamationCircle style={{ fontSize: "18px" }} />
              <span>Rejected Queue</span>
            </a>
            <a onClick={() => navigate("/uploader/uploaded-copies")} style={navLinkStyle(false)}>
              <FaHistory style={{ fontSize: "18px" }} />
              <span>History</span>
            </a>
            <a style={navLinkStyle(false)}>
              <FaQuestionCircle style={{ fontSize: "18px" }} />
              <span>Support</span>
            </a>
          </nav>
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <a onClick={handleLogout} style={{ ...navLinkStyle(false), color: "#ef4444" }}>
            <FaSignOutAlt style={{ fontSize: "18px" }} />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "20px 32px",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
            On-Screen Marking System
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>Uploader</p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>ID: 992831</p>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "9999px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              UP
            </div>
          </div>
        </header>

        <main
          style={{
            padding: "24px 40px",
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              padding: "36px 48px",
              maxWidth: "1024px",
              width: "100%",
              marginTop: "0px",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "40px", fontWeight: 800, color: "#1d4ed8", margin: 0 }}>
              Uploader
            </h1>
            <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "8px", marginBottom: "24px" }}>
              Manage scanned answer sheets and upload them securely.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <button
                onClick={() => navigate("/uploader/rejected-queue")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#1e40af",
                  color: "#ffffff",
                  fontWeight: 600,
                  padding: "16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaExclamationCircle />
                <span>Rejected Queue</span>
              </button>

              <button
                onClick={() => navigate("/uploader/preview")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#1e40af",
                  color: "#ffffff",
                  fontWeight: 600,
                  padding: "16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaEye />
                <span>View Scanned Copy</span>
              </button>

              <button
                onClick={() => navigate("/uploader/uploaded-copies")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#1e40af",
                  color: "#ffffff",
                  fontWeight: 600,
                  padding: "16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaFileAlt />
                <span>View Uploaded Copies</span>
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                textAlign: "left",
                marginBottom: "24px",
              }}
            >
              <div>
                <label style={{ fontSize: "15px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "8px" }}>
                  Select Date
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "10px 14px",
                  }}
                >
                  <FaCalendarAlt style={{ color: "#1d4ed8", flexShrink: 0 }} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: "15px",
                      color: "#6b7280",
                      outline: "none",
                      background: "transparent",
                      border: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "15px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "8px" }}>
                  Select Exam
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    opacity: examSelectDisabled ? 0.7 : 1,
                  }}
                >
                  <FaGraduationCap style={{ color: "#1d4ed8", flexShrink: 0 }} />
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    disabled={examSelectDisabled}
                    style={{
                      width: "100%",
                      appearance: "none",
                      fontSize: "15px",
                      color: "#6b7280",
                      outline: "none",
                      background: "transparent",
                      border: "none",
                      paddingRight: "24px",
                      cursor: examSelectDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <option value="">{examDropdownPlaceholder}</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.name}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown
                    style={{
                      position: "absolute",
                      right: "14px",
                      color: "#9ca3af",
                      fontSize: "12px",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileSelected}
              style={{ display: "none" }}
            />

            <button
              onClick={handleUploadClick}
              disabled={uploading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: uploading ? "#93c5fd" : "#1e40af",
                color: "#ffffff",
                fontWeight: 600,
                padding: "16px 48px",
                borderRadius: "8px",
                fontSize: "16px",
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                margin: "0 auto",
              }}
            >
              <FaCloudUploadAlt />
              <span>{uploadButtonLabel}</span>
            </button>

            {message ? (
              <p style={{ fontSize: "14px", marginTop: "16px", color: messageColor }}>
                {message}
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploaderDashboardPage;
