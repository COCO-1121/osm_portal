import { useState, useEffect } from "react";
import AdminLayout from "../../shared/layouts/AdminLayout";
import { getLoginHistory, updateAdminProfile, changeAdminPassword } from "../services/adminService";
import { useAdmin } from "../context/AdminContext";

function AdminProfile() {
  const { updateAdmin } = useAdmin();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    institute_id: "",
    user_id: "",
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("access_token");
  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/api/v1/admin/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Unable to load profile.");
      }
  
      setProfile(data);
      setOriginalProfile(data);
  
      // Keeps the top-right header synchronized
      updateAdmin(data);
  
    } catch (err) {
      console.error(err);
    }
  };
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [loginHistory, setLoginHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setHistoryLoading(true);
        const data = await getLoginHistory(historyPage, 5); // 5 items per page
        setLoginHistory(data.items);
        setHistoryTotalPages(data.pages);
      } catch (err) {
        console.error("Failed to fetch login history", err);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, [historyPage]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    try {
      const updated = await updateAdminProfile(profile);
      setOriginalProfile(updated);
      setProfile(updated);
      setIsEditing(false);
      updateAdmin(updated);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update profile");
    }
  };

  const handleSubmitPassword = async () => {
    if (!password.oldPassword || !password.newPassword || !password.confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to change your password?");
    if (!confirmed) return;

    try {
      await changeAdminPassword(password.oldPassword, password.newPassword);
      alert("Password changed successfully.");
      setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to change password.");
    }
  };

  const handleCancelPassword = () => {
    setPassword({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);
  };


  return (
    <AdminLayout title="Admin Profile" subtitle="Manage your profile and settings">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institute ID</label>
              <input
                type="text"
                name="institute_id"
                value={profile.institute_id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Change Password</h2>
          
          {!showPasswordForm ? (
            <div>
              <p className="text-gray-500 mt-2 mb-6">
                Change your administrator account password securely.
              </p>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Change Password
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={password.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={password.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSubmitPassword}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Save Password
                </button>
                <button
                  onClick={handleCancelPassword}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* Login History Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Login History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Last Login</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Browser</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">IP Address</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600">Device</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                      Loading history...
                    </td>
                  </tr>
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                      No login history found.
                    </td>
                  </tr>
                ) : (
                  loginHistory.map((history) => (
                    <tr key={history.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(history.login_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{history.browser}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{history.ip_address}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{history.device}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {historyTotalPages > 1 && (
            <div className="mt-4 flex justify-between items-center px-2">
              <button
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {historyPage} of {historyTotalPages}
              </span>
              <button
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                disabled={historyPage === historyTotalPages}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
