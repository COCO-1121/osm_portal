import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaFileCsv, FaFilePdf, FaFilter, FaTimes } from "react-icons/fa";
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

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        setHistoryLoading(true);
        const data = await getLoginHistory(historyPage, 5, startDate, endDate); // 5 items per page
        setLoginHistory(data.items);
        setHistoryTotalPages(data.pages);
      } catch (err) {
        console.error("Failed to fetch login history", err);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, [historyPage, startDate, endDate]);

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setHistoryPage(1);
  };

  const handleExportCSV = async () => {
    try {
      const data = await getLoginHistory(1, 1000, startDate, endDate);
      const items = data.items || [];
      if (items.length === 0) {
        alert("No login history records found to export.");
        return;
      }
      const headers = ["Last Login", "Browser", "IP Address", "Device"];
      const rows = items.map((h) => [
        `"${new Date(h.login_at).toLocaleString()}"`,
        `"${(h.browser || "").replace(/"/g, '""')}"`,
        `"${(h.ip_address || "").replace(/"/g, '""')}"`,
        `"${(h.device || "").replace(/"/g, '""')}"`,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `login_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV: " + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      const data = await getLoginHistory(1, 1000, startDate, endDate);
      const items = data.items || [];
      if (items.length === 0) {
        alert("No login history records found to export.");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to export PDF.");
        return;
      }

      const filterRange = (startDate || endDate)
        ? `Date Range: ${startDate || 'Start'} to ${endDate || 'Present'}`
        : "Filter: All Time";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
            h1 { color: #1e3a8a; margin-bottom: 4px; font-size: 24px; }
            p { margin: 4px 0; color: #555; font-size: 14px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f3f4f6; text-align: left; padding: 10px; border: 1px solid #d1d5db; font-size: 13px; font-weight: bold; }
            td { padding: 10px; border: 1px solid #e5e7eb; font-size: 13px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 30px; font-size: 12px; text-align: right; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Login History Report</h1>
            <p><strong>Admin:</strong> ${profile.name || profile.user_id || 'Administrator'} (${profile.email || ''})</p>
            <p><strong>${filterRange}</strong> | Total Records: ${items.length}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Last Login</th>
                <th>Browser</th>
                <th>IP Address</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${new Date(item.login_at).toLocaleString()}</td>
                  <td>${item.browser || 'N/A'}</td>
                  <td>${item.ip_address || 'N/A'}</td>
                  <td>${item.device || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            OSM Portal - Login History Audit Report
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    }
  };

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
                onClick={() => {
                  setPassword({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  setShowPasswordForm(true);
                }}
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
                  <div className="relative flex items-center">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      autoComplete="new-password"
                      value={password.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      autoComplete="new-password"
                      value={password.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={password.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Login History</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track administrator account login sessions and devices.</p>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-sm transition shadow-sm cursor-pointer"
              >
                <FaFileCsv className="text-emerald-600 text-lg" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold text-sm transition shadow-sm cursor-pointer"
              >
                <FaFilePdf className="text-rose-600 text-lg" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Date Filter Bar */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaFilter className="text-blue-600" />
              <span>Filter by Date Range:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <FaTimes />
                  Clear Filter
                </button>
              )}
            </div>
          </div>
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
