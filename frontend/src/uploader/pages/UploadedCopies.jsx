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
    // Backend sends naive UTC timestamps (no timezone marker in the string).
    // Force UTC interpretation here, then toLocaleString() converts it
    // correctly to the browser's local time (e.g. IST).
    const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateString);
    const isoString = hasTimezone ? dateString : dateString + "Z";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Improved status style helper — returns background, text, dot and ring colors
  const getStatusStyle = (status) => {
    switch (status) {
      case "Uploaded":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          dot: "bg-green-500",
          ring: "ring-green-200",
        };
      case "Pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          dot: "bg-yellow-500",
          ring: "ring-yellow-200",
        };
      case "Rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          ring: "ring-red-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          dot: "bg-gray-400",
          ring: "ring-gray-200",
        };
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
            <a
              onClick={() => navigate("/uploader/dashboard")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer"
            >
              <FaHome /> Home
            </a>
            <a
              onClick={() => navigate("/rejected-queue")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer"
            >
              <FaFileAlt /> Rejected Queue
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold">
              <FaHistory /> Uploaded Copies
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium">
              <FaQuestionCircle /> Support
            </a>
          </nav>
        </div>

        <div className="px-3 pb-5">
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium cursor-pointer"
          >
            <FaSignOutAlt /> Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/uploader/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h2 className="text-xl font-bold text-gray-800">Uploaded Copies</h2>
          </div>

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Uploaded Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all uploaded PDF documents.
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-red-500 max-w-xl">{error}</p>
                <button
                  onClick={fetchDocuments}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg text-sm"
                >
                  <FaRedo /> Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold">Barcode</th>
                    <th className="text-left px-6 py-3 font-semibold">Subject</th>
                    <th className="text-left px-6 py-3 font-semibold">File Name</th>
                    <th className="text-left px-6 py-3 font-semibold">Upload Date & Time</th>
                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                    <th className="text-left px-6 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const statusStyle = getStatusStyle(doc.status);
                    return (
                      <tr key={doc.id} className="border-t border-gray-100">
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {doc.barcode || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{doc.exam_id || "N/A"}</td>
                        <td className="px-6 py-4 text-gray-700">{doc.original_filename}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(doc.created_at)}</td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewPdf(doc.id)}
                            className="flex items-center gap-1 text-blue-600 font-medium hover:underline"
                          >
                            <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {documents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                        No uploaded documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="px-6 py-4 text-xs text-gray-500">
                Showing {documents.length} document(s)
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PDF Preview Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-[90%] max-w-3xl h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-bold text-lg text-gray-900">Document Preview</h2>
              <button
                onClick={handleClosePdf}
                className="w-8 h-8 border rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 p-5 overflow-auto">
              <iframe
                src={selectedPdf}
                title="Uploaded Document Preview"
                className="w-full h-full min-h-[65vh] rounded-lg border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadedCopies;
