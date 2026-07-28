import { useState } from "react";

function PDFViewer() {

  const totalPages = 12;

  const [page, setPage] = useState(1);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-semibold">
          PDF Preview
        </h2>

        <div className="flex gap-3 items-center">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="border rounded-lg px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="border rounded-lg px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">

        <p className="text-gray-500">
          PDF Page {page}
        </p>

      </div>

    </div>
  );
}

export default PDFViewer;