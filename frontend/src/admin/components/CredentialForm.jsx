import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function CredentialForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">

      <h2 className="text-2xl font-bold mb-6">
        Credential Details
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="text-sm text-gray-500">
            Examiner ID
          </label>

          <input
            value="EXM102"
            readOnly
            className="w-full mt-2 border rounded-lg p-3 bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Role
          </label>

          <input
            value="Examiner"
            readOnly
            className="w-full mt-2 border rounded-lg p-3 bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Login User ID
          </label>

          <input
            placeholder="Enter new Login User ID"
            className="w-full mt-2 border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Phone Number
          </label>

          <input
            placeholder="Enter new phone number"
            className="w-full mt-2 border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            New Password
          </label>

          <div className="relative flex items-center mt-2">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full border rounded-lg p-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Confirm Password
          </label>

          <div className="relative flex items-center mt-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full border rounded-lg p-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

      </div>

      <div className="flex justify-end mt-8">

        <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg">
          Save Changes
        </button>

      </div>

    </div>
  );
}

export default CredentialForm;