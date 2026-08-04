import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaHistory,
  FaQuestionCircle,
  FaFileAlt,
  FaExclamationCircle,
  FaArrowLeft,
  FaEye,
  FaTimes,
  FaFilePdf,
} from "react-icons/fa";

function PreviewPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Open the native file picker as soon as this page loads
  useEffect(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/uploader-login");
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChooseAgain = () => {
    fileInputRef.current?.click();
  };

  const handleView = () => {
    if (previewUrl) setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
            <a onClick={() => navigate("/rejected-queue")} style={navLinkStyle(false)}>
              <FaExclamationCircle /> <span>Rejected Queue</span>
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
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1f2937", margin: 0 }}>View Scanned Copy</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", margin: 0 }}>Uploader</p>
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
              UP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "32px", flex: 1, display: "flex", justifyContent: "center" }}>
          {/* Hidden input - never shown, opens native OS picker */}
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileSelected}
            style={{ display: "none" }}
          />

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              padding: "48px",
              width: "100%",
              maxWidth: "640px",
              marginTop: "24px",
              textAlign: "center",
              height: "fit-content",
            }}
          >
            {!selectedFile ? (
              <>
                <FaFilePdf style={{ fontSize: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
                <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "15px" }}>
                  No scanned copy selected yet. Choose a PDF from your device.
                </p>
                <button
                  onClick={handleChooseAgain}
                  style={{
                    background: "#1e40af",
                    color: "#ffffff",
                    fontWeight: 600,
                    padding: "12px 32px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Choose File
                </button>
              </>
            ) : (
              <>
                <FaFilePdf style={{ fontSize: "48px", color: "#ef4444", margin: "0 auto 16px" }} />
                <p style={{ color: "#1f2937", fontWeight: 500, marginBottom: "4px" }}>{selectedFile.name}</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "24px" }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <button
                    onClick={handleView}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#1e40af",
                      color: "#ffffff",
                      fontWeight: 600,
                      padding: "12px 32px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaEye /> View
                  </button>

                  <button
                    onClick={handleChooseAgain}
                    style={{
                      color: "#4b5563",
                      fontWeight: 500,
                      fontSize: "14px",
                      background: "none",
                      border: "none",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Choose a different file
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              width: "90%",
              maxWidth: "768px",
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: "17px", color: "#111827", margin: 0 }}>
                {selectedFile?.name || "Document Preview"}
              </h2>
              <button
                onClick={handleClosePreview}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
              <iframe
                src={previewUrl}
                title="Scanned Copy Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "65vh",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewPage;
