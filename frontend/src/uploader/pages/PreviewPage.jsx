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
              <FaExclamationCircle /> Rejected Queue
            </a>
            <a
              onClick={() => navigate("/uploader/uploaded-copies")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer"
            >
              <FaHistory /> History
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
            <h2 className="text-xl font-bold text-gray-800">View Scanned Copy</h2>
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
        <main className="p-8 flex-1 flex justify-center">
          {/* Hidden input - never shown, opens native OS picker */}
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileSelected}
            className="hidden"
          />

          <div className="bg-white rounded-2xl border border-gray-200 p-10 w-full max-w-2xl mt-6 text-center h-fit">
            {!selectedFile ? (
              <>
                <FaFilePdf className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">
                  No scanned copy selected yet. Choose a PDF from your device.
                </p>
                <button
                  onClick={handleChooseAgain}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-lg text-sm"
                >
                  Choose File
                </button>
              </>
            ) : (
              <>
                <FaFilePdf className="text-5xl text-red-500 mx-auto mb-4" />
                <p className="text-gray-800 font-medium mb-1">{selectedFile.name}</p>
                <p className="text-xs text-gray-400 mb-6">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleView}
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-lg text-sm"
                  >
                    <FaEye /> View
                  </button>

                  <button
                    onClick={handleChooseAgain}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm underline"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-[90%] max-w-3xl h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-bold text-lg text-gray-900">
                {selectedFile?.name || "Document Preview"}
              </h2>
              <button
                onClick={handleClosePreview}
                className="w-8 h-8 border rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 p-5 overflow-auto">
              <iframe
                src={previewUrl}
                title="Scanned Copy Preview"
                className="w-full h-full min-h-[65vh] rounded-lg border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewPage;