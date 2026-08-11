import { useEffect, useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

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
    dob: "",
    is_active: true,
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (examiner) {
      setForm({
        user_id: examiner.user_id || "",
        name: examiner.name || "",
        email: examiner.email || "",
        phone: examiner.phone || "",
        dob: examiner.dob || "",
        is_active: examiner.is_active !== undefined ? examiner.is_active : true,
      });
    }
  }, [examiner]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const handleResetForm = () => {
    if (examiner) {
      setForm({
        user_id: examiner.user_id || "",
        name: examiner.name || "",
        email: examiner.email || "",
        phone: examiner.phone || "",
        dob: examiner.dob || "",
        is_active: examiner.is_active !== undefined ? examiner.is_active : true,
      });
      setPassword("");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      const payload = {
        user_id: form.user_id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        is_active: form.is_active !== undefined ? form.is_active : examiner?.is_active ?? true,
      };

      await updateExaminer(examiner.id, payload);

      alert("Examiner updated successfully.");

      onSuccess();
    } catch (err) {
      alert(err.message || "Failed to update examiner.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!password.trim()) {
      alert("Enter a new password.");
      return;
    }

    if (password.trim().length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(examiner.id, password);

      alert("Password updated successfully.");

      setPassword("");
    } catch (err) {
      alert(err.message || "Failed to update password.");
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

          <button type="button" onClick={handleClose}>
            <FaTimes />
          </button>

        </div>

        {/* Body */}

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 gap-5">

            <div>

              <label className="block mb-1 font-medium">Login User ID</label>

              <input
                autoComplete="off"
                value={form.user_id}
                onChange={(e) =>
                  updateField("user_id", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <div>

              <label className="block mb-1 font-medium">Full Name</label>

              <input
                autoComplete="off"
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <div>

              <label className="block mb-1 font-medium">Email</label>

              <input
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <div>

              <label className="block mb-1 font-medium">Phone</label>

              <input
                autoComplete="off"
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <div>

              <label className="block mb-1 font-medium">Date of Birth</label>

              <input
                type="date"
                autoComplete="off"
                value={form.dob}
                onChange={(e) =>
                  updateField("dob", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="font-medium">
              Update Password
            </label>

            <div className="flex gap-3 mt-2">

              <div className="flex-1 relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  placeholder="New Password (min 8 characters)"
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handlePasswordReset}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 rounded-lg font-medium cursor-pointer flex-shrink-0"
              >
                Update Password
              </button>

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-between border-t pt-5">

            <button
              type="button"
              disabled={loading}
              onClick={toggleStatus}
              className={`px-5 py-2 rounded-lg text-white font-medium cursor-pointer ${
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
                type="button"
                onClick={handleResetForm}
                disabled={loading}
                className="border border-gray-300 px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
              >
                Reset Form
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="border border-gray-300 px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={saveChanges}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
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