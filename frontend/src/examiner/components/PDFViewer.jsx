import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function PDFViewer({ script, fileUrl }) {
  const [page, setPage] = useState(1);
  const totalPages = script?.total_pages || 12;

  const rawPath = script?.file_path || script?.fileUrl || fileUrl;

  const getPdfUrl = () => {
    if (!rawPath) return null;
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }
    let path = rawPath.replace(/\\/g, "/");
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    if (!path.startsWith("/files")) {
      if (path.startsWith("/uploads")) {
        path = `/files${path}`;
      } else {
        path = `/files/uploads${path}`;
      }
    }
    return `${API_URL}${path}`;
  };

  const pdfUrl = getPdfUrl();

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-800">
          PDF Preview
        </h2>

        <div className="flex gap-3 items-center">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline mr-2 flex items-center gap-1"
            >
              Open PDF in new tab ↗
            </a>
          )}
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border rounded-lg px-4 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border rounded-lg px-4 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      <div className="h-[650px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#page=${page}&toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title="PDF Script Preview"
          />
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p className="text-lg font-medium">No script PDF file available</p>
            <p className="text-xs text-gray-400 mt-1">File path not specified for this record.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;