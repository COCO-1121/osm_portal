import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaTimes, FaUpload, FaHome, FaHistory, FaQuestionCircle, FaSignOutAlt, FaTimesCircle } from "react-icons/fa";

const rejectedData = [
  { barcode: "OSM-9823-112", subject: "Advanced Mathematics", reason: "Blurred Image" },
  { barcode: "OSM-7742-009", subject: "Inorganic Chemistry", reason: "Missing Pages" },
  { barcode: "OSM-1029-445", subject: "Macro Economics", reason: "Barcode Not Detected" },
  { barcode: "OSM-5531-228", subject: "English Literature II", reason: "Poor Scan Quality" },
  { barcode: "OSM-3391-771", subject: "History of Art", reason: "Duplicate Upload" },
];

function RejectedQueue() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const reuploadInputRef = useRef(null);

  const handleReuploadClick = () => {
    reuploadInputRef.current?.click();
  };

  const handleReuploadFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      navigate("/uploader-login");
    }
  };

  const reasons = [...new Set(rejectedData.map((item) => item.reason))];

  const filteredData = rejectedData.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
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
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>Academic Examiner</p>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>ID: 992831</p>
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
              EP
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
                      <span
                        style={{
                          background: "#fef2f2",
                          color: "#dc2626",
                          fontSize: "13px",
                          fontWeight: 600,
                          padding: "6px 14px",
                          borderRadius: "9999px",
                        }}
                      >
                        {item.reason}
                      </span>
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <button
                        onClick={() => { setPreviewUrl(null); setSelectedItem(item); }}
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
                      No results found.
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

              <p style={{ marginTop: "16px", fontSize: "14px", color: "#4b5563" }}>
                Rejection reason:{" "}
                <span style={{ color: "#dc2626", fontWeight: 600 }}>{selectedItem.reason}</span>
              </p>
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
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReuploadClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaUpload /> Re-upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RejectedQueue;
