import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AdminLayout from "../../shared/layouts/AdminLayout";
import { createExaminer } from "../services/examinerService.jsx";

const initialForm = {
  user_id: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  institute_id: "",
};

function CreateExaminer() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleReset = (e) => {
    if (e) e.preventDefault();
    setForm(initialForm);
    setErrors({});
    setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.user_id.trim()) e.user_id = "Login User ID is required.";
    if (!form.name.trim()) e.name = "Full Name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = "Invalid email address.";
    }
    if (!form.phone.trim()) {
      e.phone = "Phone number is required.";
    }
    if (!form.password.trim()) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        user_id: form.user_id.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        institute_id: form.institute_id.trim() || undefined,
      };

      await createExaminer(payload);

      setShowSuccessDialog(true);
      handleReset();

      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setServerError(err.message || "Failed to create examiner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Examiner" subtitle="Create a new examiner account.">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b px-8 py-6 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-800">
              Create Examiner Account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter examiner details to generate login credentials.
            </p>
          </div>

          <form onSubmit={handleCreate} className="p-8 space-y-6">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.user_id}
                  onChange={(e) => updateField("user_id", e.target.value)}
                  placeholder="e.g. EXAM001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                {errors.user_id && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_id}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="examiner@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Institute ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute ID (Optional)
                </label>
                <input
                  type="text"
                  value={form.institute_id}
                  onChange={(e) => updateField("institute_id", e.target.value)}
                  placeholder="INST-001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating..." : "Create Examiner"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
            <p className="mt-3 text-base font-medium text-gray-700">
              Examiner Account Created Successfully
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Form has been reset for creating next account.
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CreateExaminer;