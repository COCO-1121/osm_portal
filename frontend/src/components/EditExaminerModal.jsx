import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

import {
  updateExaminer,
  resetPassword,
  changeStatus,
} from "../services/examinerService.jsx";

function EditExaminerModal({
  examiner,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (examiner) {
      setForm({
        user_id: examiner.user_id || "",
        name: examiner.name || "",
        email: examiner.email || "",
        phone: examiner.phone || "",
      });
    }
  }, [examiner]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      await updateExaminer(examiner.id, form);

      alert("Examiner updated successfully.");

      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!password.trim()) {
      alert("Enter a new password.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(examiner.id, password);

      alert("Password updated.");

      setPassword("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      setLoading(true);

      await changeStatus(
        examiner.id,
        !examiner.is_active
      );

      alert("Status updated.");

      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">

        {/* Header */}

        <div className="flex justify-between items-center border-b p-6">

          <h2 className="text-xl font-bold">
            Edit Examiner
          </h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>

        {/* Body */}

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 gap-5">

            <div>

              <label>Login User ID</label>

              <input
                value={form.user_id}
                onChange={(e) =>
                  updateField("user_id", e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label>Full Name</label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label>Email</label>

              <input
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label>Phone</label>

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="font-medium">
              Reset Password
            </label>

            <div className="flex gap-3 mt-2">

              <input
                type="password"
                value={password}
                placeholder="New Password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="flex-1 border rounded-lg p-3"
              />

              <button
                onClick={handlePasswordReset}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 rounded-lg"
              >
                Reset
              </button>

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-between border-t pt-5">

            <button
              onClick={toggleStatus}
              className={`px-5 py-2 rounded-lg text-white ${
                examiner.is_active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {examiner.is_active
                ? "Deactivate"
                : "Activate"}
            </button>

            <div className="flex gap-3">

              <button
                onClick={onClose}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={saveChanges}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EditExaminerModal;