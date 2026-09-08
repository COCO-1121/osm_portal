import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaTimes, FaUpload, FaHome, FaHistory, FaQuestionCircle, FaSignOutAlt, FaTimesCircle } from "react-icons/fa";
import apiClient from "../../shared/services/apiClient";

function RejectedQueue() {
  const navigate = useNavigate();
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const reuploadInputRef = useRef(null);

  const fetchRejectedQueue = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/rejected-queue");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRejectedData(res.data);
        return;
      }
      
      // Secondary attempt with explicit path
      const res2 = await apiClient.get("/api/v1/rejected-queue");
      if (Array.isArray(res2.data)) {
        setRejectedData(res2.data);
        return;
      }
      setRejectedData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch uploader rejected queue:", err);
      try {
        const token =
          localStorage.getItem("uploader_token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("uploaderToken");
        const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const fallbackRes = await fetch(`${baseUrl}/api/v1/rejected-queue`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setRejectedData(Array.isArray(data) ? data : []);
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
      setRejectedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedQueue();
  }, []);

  const handleOpenItem = async (item) => {
    setSelectedItem(item);
    setPreviewUrl(null);
    try {
      // 1. Try dedicated rejected-queue preview endpoint
      const res = await apiClient.get(`/rejected-queue/${encodeURIComponent(item.barcode)}/preview`, {
        responseType: "blob",
      });
      if (res && res.data) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }
    } catch (err) {
      console.warn("Rejected queue preview failed, trying fallback preview:", err);
    }

    try {
      // 2. Try scanned documents preview endpoint
      const res = await apiClient.get(`/scanned-documents/by-barcode/${encodeURIComponent(item.barcode)}/preview`, {
        responseType: "blob",
      });
      if (res && res.data) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        return;
      }
    } catch (err2) {
      console.warn("Scanned documents preview failed, trying admin preview:", err2);
    }

    try {
      // 3. Try admin preview endpoint
      const res = await apiClient.get(`/admin/rejected-scripts/${encodeURIComponent(item.barcode)}/preview`, {
        responseType: "blob",
      });
      if (res && res.data) {
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
      }
    } catch (err3) {
      console.warn("Could not load PDF preview from any source:", err3);
    }
  };

  const handleReuploadClick = () => {
    reuploadInputRef.current?.click();
  };

  const handleReuploadFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedItem) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (selectedItem.barcode) {
        formData.append("barcode", selectedItem.barcode);
      }

      await apiClient.post("/scanned-documents/reupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Script re-uploaded successfully! It has been returned to evaluation processing.");
      closeModal();
      fetchRejectedQueue();
    } catch (err) {
      console.error("Failed to re-upload document:", err);
      alert("Failed to re-upload script: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/");
    }
  };

  const reasons = [...new Set(rejectedData.map((item) => item.reason).filter(Boolean))];

  const filteredData = rejectedData.filter((item) => {
    const barcodeStr = (item.barcode || "").toLowerCase();
    const subjectStr = (item.subject || item.filename || "").toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = barcodeStr.includes(query) || subjectStr.includes(query);
    const matchesReason = filterReason ? item.reason === filterReason : true;
    return matchesSearch && matchesReason;
  });

  const navLinkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: active ? "#111827" : "#4b5563",
    background: active ? "#f3f4f6" : "transparent",
    fontSize: "15px",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ padding: "20px 24px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#1f2937" }}>OSM Portal</span>
          </div>

          <nav style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", padding: "0 12px" }}>
            <a onClick={() => navigate("/uploader/dashboard")} style={navLinkStyle(false)}>
              <FaHome /> <span>Home</span>
            </a>
            <a style={navLinkStyle(true)}>
              <FaTimesCircle /> <span>Rejected Queue</span>
            </a>
            <a onClick={() => navigate("/uploader/uploaded-copies")} style={navLinkStyle(false)}>
              <FaHistory /> <span>History</span>
            </a>
            <a style={navLinkStyle(false)}>
              <FaQuestionCircle /> <span>Support</span>
            </a>
          </nav>
        </div>

        <div style={{ padding: "0 12px 20px" }}>
          <a onClick={handleLogout} style={{ ...navLinkStyle(false), color: "#ef4444" }}>
            <FaSignOutAlt /> <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 32px",
          }}
        >
          <div style={{ position: "relative", width: "380px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Barcode or Subject"
              style={{
                width: "100%",
                paddingLeft: "38px",
                paddingRight: "16px",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                {localStorage.getItem("uploader_id") ? "Document Uploader" : "Document Uploader"}
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                ID: {localStorage.getItem("uploader_id") || "UPL001"}
              </p>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
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
              {(localStorage.getItem("uploader_id") || "UP").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "20px 32px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>Rejected Queue</h1>
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Manage and rectify scripts with automated or manual rejection flags.
              </p>
            </div>

            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "10px 16px",
                fontSize: "14px",
                color: "#374151",
                outline: "none",
                background: "#ffffff",
              }}
            >
              <option value="">Filter by Reason</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
              <thead style={{ background: "#1e3a8a" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 24px", fontWeight: 700, color: "#ffffff", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Barcode</th>
                  <th style={{ textAlign: "left", padding: "10px 24px", fontWeight: 700, color: "#ffffff", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "10px 24px", fontWeight: 700, color: "#ffffff", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Reason for Rejection</th>
                  <th style={{ textAlign: "left", padding: "10px 24px", fontWeight: 700, color: "#ffffff", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Preview Copy</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.barcode} style={{ borderTop: idx === 0 ? "none" : "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 24px", color: "#374151", fontWeight: 500 }}>{item.barcode}</td>
                    <td style={{ padding: "12px 24px", color: "#374151" }}>{item.subject}</td>
                    <td style={{ padding: "12px 24px" }}>
                      <div>
                        <span
                          style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: 600,
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            display: "inline-block",
                          }}
                        >
                          {item.reason}
                        </span>
                        {item.admin_remarks && (
                          <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>
                            <strong>Admin Note:</strong> {item.admin_remarks}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <button
                        onClick={() => handleOpenItem(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#2563eb",
                          fontWeight: 600,
                          border: "1px solid #bfdbfe",
                          background: "#eff6ff",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        <FaEye /> Open
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: "32px 24px", textAlign: "center", color: "#9ca3af" }}>
                      {loading ? "Loading rejected scripts..." : "No rejected scripts in queue."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ padding: "12px 24px", fontSize: "13px", color: "#6b7280" }}>
              Showing {filteredData.length} of {rejectedData.length} rejected scripts
            </div>
          </div>
        </main>
      </div>

      {/* Dialog / Modal */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#111827", margin: 0 }}>{selectedItem.barcode}</h2>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>{selectedItem.subject}</p>
              </div>
              <button
                onClick={closeModal}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Re-uploaded PDF preview"
                  style={{
                    width: "100%",
                    height: "384px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    height: "384px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  PDF preview will appear here
                </div>
              )}

              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#4b5563" }}>
                  <strong>Rejection Reason:</strong>{" "}
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>{selectedItem.reason}</span>
                </p>
                {selectedItem.admin_remarks && (
                  <p style={{ margin: 0, fontSize: "14px", color: "#4b5563" }}>
                    <strong>Admin Remarks:</strong>{" "}
                    <span style={{ color: "#1f2937", fontWeight: 500 }}>{selectedItem.admin_remarks}</span>
                  </p>
                )}
                {selectedItem.examiner_remarks && selectedItem.examiner_remarks !== selectedItem.reason && (
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    <strong>Examiner Note:</strong> {selectedItem.examiner_remarks}
                  </p>
                )}
              </div>
            </div>

            {/* Hidden file input for re-upload */}
            <input
              type="file"
              ref={reuploadInputRef}
              accept="application/pdf"
              onChange={handleReuploadFileSelected}
              style={{ display: "none" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
              <button
                onClick={closeModal}
                disabled={isUploading}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: "#ffffff",
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReuploadClick}
                disabled={isUploading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: isUploading ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                <FaUpload /> {isUploading ? "Uploading..." : "Re-upload Script"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RejectedQueue;
