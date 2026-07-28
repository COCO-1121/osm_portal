import { useState } from "react";
import AdminLayout from "../../shared/layouts/AdminLayout";

function CreateExaminer() {
  const [examinerId, setExaminerId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();

    if (
      examinerId === "" ||
      userId === "" ||
      password === "" ||
      subject === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    // Show Success Popup
    setShowDialog(true);

    // Clear Form
    setExaminerId("");
    setUserId("");
    setPassword("");
    setSubject("");

    // Auto Close Popup after 2 sec
    setTimeout(() => {
      setShowDialog(false);
    }, 2000);
  };

  return (
    <AdminLayout title="Create Examiner">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="border-b px-8 py-6">
            <h1 className="text-3xl font-bold text-blue-700">
              Create Examiner
            </h1>

            <p className="text-gray-500 mt-2">
              Create a new examiner account.
            </p>
          </div>

          <form onSubmit={handleCreate} className="p-8 space-y-6">

            {/* Examiner ID */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Examiner ID
              </label>

              <input
                type="text"
                value={examinerId}
                onChange={(e) => setExaminerId(e.target.value)}
                placeholder="Enter Examiner ID"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                User ID
              </label>

              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Subject</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>English</option>
                <option>Computer Science</option>
              </select>
            </div>

            {/* Create Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
              >
                Create
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-2xl shadow-xl w-[450px] p-8 text-center">

            <div className="text-green-600 text-5xl mb-4">
              ✅
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Success
            </h2>

            <p className="mt-5 text-lg font-semibold text-gray-700">
              Examiner Account Successfully Created
            </p>

            <p className="mt-2 text-gray-500">
              Redirected to Create New Examiner Account
            </p>

          </div>

        </div>
      )}
    </AdminLayout>
  );
}

export default CreateExaminer;