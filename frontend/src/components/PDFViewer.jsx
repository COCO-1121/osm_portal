function PDFViewer({ script }) {
  const API_URL = "http://127.0.0.1:8000";

  if (!script?.file_path) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-5">
          PDF Preview
        </h2>

        <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            No answer script file available.
          </p>
        </div>
      </div>
    );
  }

  const pdfUrl = `${API_URL}${script.file_path}`;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">
          Answer Script Preview
        </h2>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
        >
          Open PDF
        </a>
      </div>

      <div className="w-full h-[700px] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        <iframe
          src={pdfUrl}
          title={`Answer Script ${script.barcode}`}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default PDFViewer;