import ExaminerRow from "./ExaminerRow";
import EmptyState from "./EmptyState";

function ExaminerTable({
  examiners,
  loading,
  onEdit,
  onCreate,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border p-10 text-center text-gray-500">
        Loading examiners...
      </div>
    );
  }

  if (!examiners.length) {
    return <EmptyState onClick={onCreate} />;
  }

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold">
            {examiners.length}
          </span>{" "}
          examiner{examiners.length !== 1 ? "s" : ""}
        </p>

        <p className="text-sm text-gray-600">
          Total Records:{" "}
          <span className="font-semibold">
            {examiners.length}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[950px] w-full border-collapse">
          <thead className="bg-gray-100 border-b sticky top-0">
            <tr className="text-left text-gray-700">
              <th className="px-6 py-4 text-left font-semibold" style={{ width: '120px' }}>Login ID</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ width: '250px' }}>Examiner</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ width: '200px' }}>Email</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ width: '140px' }}>Phone</th>
              <th className="px-6 py-4 text-left font-semibold" style={{ width: '100px' }}>Status</th>
              <th className="px-6 py-4 text-center font-semibold" style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {examiners.map((examiner) => (
              <ExaminerRow
                key={examiner.id}
                examiner={examiner}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
        <span>
          Showing 1–{examiners.length} of {examiners.length}
        </span>

        <div className="flex gap-2">
          <button
            disabled
            className="px-3 py-1 rounded border bg-white text-gray-400 cursor-not-allowed"
          >
            Previous
          </button>

          <button className="px-3 py-1 rounded bg-blue-700 text-white">
            1
          </button>

          <button
            disabled
            className="px-3 py-1 rounded border bg-white text-gray-400 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExaminerTable;