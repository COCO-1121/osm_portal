import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaHome,
  FaSignOutAlt,
  FaHistory,
  FaQuestionCircle,
  FaFileAlt,
  FaArrowLeft,
  FaTimes,
  FaRedo,
} from "react-icons/fa";

function UploadedCopies() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);

  const fetchDocuments = useCallback(async () => {
    const token = localStorage.getItem("uploader_token");

    if (!token) {
      setError("Please login again.");
      navigate("/uploader-login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scanned-documents/", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("uploader_token");
        localStorage.removeItem("uploader_id");
        navigate("/uploader-login");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Response:", response.status, text);
        setError(
          "Failed to fetch documents (Status " +
            response.status +
            "). " +
            (text ? text.slice(0, 200) : "No details returned by server.")
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      setDocuments(data.documents || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to backend. Check that the server is running and reachable (" +
          (err?.message || "network error") +
          ")."
      );
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/uploader-login");
    }
  };

  const handleViewPdf = async (documentId) => {
    const token = localStorage.getItem("uploader_token");
    if (!token) {
      alert("Please login again.");
      navigate("/uploader-login");
      return;
    }

    try {
      const url = "/api/scanned-documents/" + documentId + "/preview";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
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
        console.error("Preview failed - Status:", response.status);
        console.error("Preview failed - Response:", text);
        alert("Failed to preview document. Status: " + response.status + ". Error: " + text);
        return;
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        alert("PDF is empty.");
        return;
      }

      const fileURL = URL.createObjectURL(blob);
      setSelectedPdf(fileURL);
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }
  };

  const handleClosePdf = () => {
    if (selectedPdf) {
      URL.revokeObjectURL(selectedPdf);
      setSelectedPdf(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateString);
    const isoString = hasTimezone ? dateString : dateString + "Z";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Uploaded":
        return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", ring: "ring-green-200" };
      case "Pending":
        return { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", ring: "ring-yellow-200" };
      case "Rejected":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", ring: "ring-red-200" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", ring: "ring-gray-200" };
    }
  };

  // Same nav items and inline-style approach used on PreviewPage.jsx so
  // the sidebar is visually identical (and consistent) across pages,
  // with "Uploaded Copies" marked as the active item here.
  const navItems = [
    { label: "Home", icon: FaHome, onClick: () => navigate("/uploader/dashboard") },
    { label: "Rejected Queue", icon: FaFileAlt, onClick: () => navigate("/rejected-queue") },
    { label: "Uploaded Copies", icon: FaHistory, onClick: () => {} },
    { label: "Support", icon: FaQuestionCircle, onClick: () => {} },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          backgroundColor: "#fff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ padding: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>OSM Portal</h1>
          </div>

          <nav style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", padding: "0 12px" }}>
            {navItems.map((item, index) => (
              <div
                key={item.label}
                onClick={item.onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 500,
                  backgroundColor: index === 2 ? "#f3f4f6" : "transparent",
                  color: index === 2 ? "#111827" : "#4b5563",
                }}
              >
                <item.icon style={{ fontSize: "18px" }} />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        <div style={{ padding: "0 12px 20px" }}>
          <a
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              color: "#ef4444",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <FaSignOutAlt style={{ fontSize: "18px" }} /> Logout
          </a>
        </div>
      </aside>

      {/* Main content — inline flex so it never overlaps the sidebar,
          even if Tailwind's utility classes fail to load for any reason. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/uploader/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#4b5563",
                fontSize: "14px",
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
              Uploaded Copies
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>Uploader</p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>ID: 992831</p>
            </div>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                color: "#fff",
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

        {/* Page content */}
        <main style={{ padding: "32px", flex: 1 }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>
              All Uploaded Documents
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              View and manage all uploaded PDF documents.
            </p>
          </div>

          {loading ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#4b5563" }}>Loading documents...</p>
              </div>
            </div>
          ) : error ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center" }}>
                <p style={{ color: "#ef4444", maxWidth: "36rem" }}>{error}</p>
                <button
                  onClick={fetchDocuments}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#1d4ed8",
                    color: "#fff",
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <FaRedo /> Retry
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#1e3a8a" }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>Barcode</th>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>Subject</th>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>File Name</th>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>Upload Date & Time</th>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "16px 24px", fontWeight: 600, color: "#fff", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.03em" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const statusStyle = getStatusStyle(doc.status);
                    return (
                      <tr key={doc.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "16px 24px", color: "#374151", fontWeight: 500 }}>
                          {doc.barcode || "N/A"}
                        </td>
                        <td style={{ padding: "16px 24px", color: "#374151" }}>{doc.exam_id || "N/A"}</td>
                        <td style={{ padding: "16px 24px", color: "#374151" }}>{doc.original_filename}</td>
                        <td style={{ padding: "16px 24px", color: "#374151" }}>{formatDate(doc.created_at)}</td>
                        <td style={{ padding: "16px 24px" }}>
                          <span
                            className={
                              "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ring-1 " +
                              statusStyle.bg +
                              " " +
                              statusStyle.text +
                              " " +
                              statusStyle.ring
                            }
                          >
                            <span className={"w-1.5 h-1.5 rounded-full " + statusStyle.dot}></span>
                            {doc.status || "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <button
                            onClick={() => handleViewPdf(doc.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#2563eb",
                              fontWeight: 500,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {documents.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: "32px 24px", textAlign: "center", color: "#9ca3af" }}>
                        No uploaded documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: "16px 24px", fontSize: "12px", color: "#6b7280" }}>
                Showing {documents.length} document(s)
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PDF Preview Modal */}
      {selectedPdf && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", width: "90%", maxWidth: "48rem", height: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontWeight: "bold", fontSize: "18px", color: "#111827", margin: 0 }}>Document Preview</h2>
              <button
                onClick={handleClosePdf}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
              <iframe
                src={selectedPdf}
                title="Uploaded Document Preview"
                style={{ width: "100%", height: "100%", minHeight: "65vh", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadedCopies;
