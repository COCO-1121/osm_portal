function ScriptDetailsCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Script Details
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-sm text-gray-500">Barcode</p>
          <p className="font-semibold">100245</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Subject</p>
          <p className="font-semibold">Physics</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Examiner ID</p>
          <p className="font-semibold">EXM102</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Centre ID</p>
          <p className="font-semibold">CTR-LKO-001</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Rejected Date</p>
          <p className="font-semibold">07 Jul 2026</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Status</p>
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
            Pending
          </span>
        </div>

      </div>

      <div className="mt-6">

        <p className="text-sm text-gray-500">
          Reject Reason
        </p>

        <div className="mt-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">

          Missing Page

        </div>

      </div>

    </div>
  );
}

export default ScriptDetailsCard;