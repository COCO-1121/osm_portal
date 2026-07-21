function CredentialForm() {
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

          <input
            type="password"
            placeholder="Enter new password"
            className="w-full mt-2 border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full mt-2 border rounded-lg p-3"
          />
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