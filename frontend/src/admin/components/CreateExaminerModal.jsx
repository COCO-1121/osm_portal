import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { createExaminer } from "../services/examinerService.jsx";

function CreateExaminerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const e = {};

    if (!form.user_id.trim()) e.user_id = "Login ID is required.";
    if (!form.name.trim()) e.name = "Name is required.";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await createExaminer(form);

      alert("Examiner created successfully.");

      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 flex-shrink-0">
          <h2 className="text-xl font-bold">
            Create Examiner
          </h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {[
            {
              label: "Login User ID",
              field: "user_id",
              type: "text",
            },
            {
              label: "Full Name",
              field: "name",
              type: "text",
            },
            {
              label: "Email",
              field: "email",
              type: "email",
            },
            {
              label: "Phone",
              field: "phone",
              type: "text",
            },
            {
              label: "Password",
              field: "password",
              type: "password",
            },
          ].map((item) => (
            <div key={item.field}>
              <label className="block mb-1 font-medium">
                {item.label}
              </label>

              <input
                type={item.type}
                value={form[item.field]}
                onChange={(e) =>
                  updateField(item.field, e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none"
              />

              {errors[item.field] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[item.field]}
                </p>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create Examiner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExaminerModal;