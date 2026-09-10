import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUserShield,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaList,
  FaEye,
  FaEyeSlash,
  FaBook,
} from "react-icons/fa";
import "./InstitutionDashboard.css";

const COUNTRY_CODES = [
  { code: "+91", label: "+91" },
  { code: "+1", label: "+1" },
  { code: "+44", label: "+44" },
  { code: "+81", label: "+81" },
  { code: "+971", label: "+971" },
  { code: "+966", label: "+966" },
  { code: "+974", label: "+974" },
  { code: "+965", label: "+965" },
  { code: "+968", label: "+968" },
  { code: "+973", label: "+973" },
  { code: "+61", label: "+61" },
  { code: "+65", label: "+65" },
  { code: "+60", label: "+60" },
  { code: "+49", label: "+49" },
  { code: "+33", label: "+33" },
  { code: "+39", label: "+39" },
  { code: "+34", label: "+34" },
  { code: "+86", label: "+86" },
  { code: "+977", label: "+977" },
  { code: "+94", label: "+94" },
  { code: "+880", label: "+880" },
  { code: "+92", label: "+92" },
  { code: "+64", label: "+64" },
  { code: "+7", label: "+7" },
  { code: "+20", label: "+20" },
  { code: "+27", label: "+27" },
  { code: "+55", label: "+55" },
];

function InstitutionDashboardPage() {
  const navigate = useNavigate();
  const instituteId = localStorage.getItem("institute_id") || "INST-001";
  const institutionName = localStorage.getItem("institution_name") || "Central Assessment Institution";

  const [activeTab, setActiveTab] = useState("create-admin");
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Form states - Admin
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminCountryCode, setAdminCountryCode] = useState("+91");
  const [adminPhoneDigits, setAdminPhoneDigits] = useState("");
  const [adminInstId, setAdminInstId] = useState(instituteId);
  const [adminName, setAdminName] = useState("");

  // Form states - Uploader
  const [uploaderUserId, setUploaderUserId] = useState("");
  const [uploaderPassword, setUploaderPassword] = useState("");
  const [showUploaderPassword, setShowUploaderPassword] = useState(false);
  const [uploaderCountryCode, setUploaderCountryCode] = useState("+91");
  const [uploaderPhoneDigits, setUploaderPhoneDigits] = useState("");
  const [uploaderName, setUploaderName] = useState("");

  // Form states - Exam
  const [examCode, setExamCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const [numStudents, setNumStudents] = useState("");
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Notification banners
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/institution/accounts?institute_id=${instituteId}`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/institution/exams?institute_id=${instituteId}`);
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchExams();
  }, [instituteId]);

  const handleLogout = () => {
    localStorage.removeItem("institution_token");
    localStorage.removeItem("institute_id");
    localStorage.removeItem("institution_name");
    navigate("/");
  };

  const handlePhoneDigitChange = (setter) => (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
    setter(cleaned);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (adminPhoneDigits.length !== 10) {
      setMsg({
        text: "Admin Phone Number must be a valid 10-digit number.",
        type: "error",
      });
      return;
    }

    const fullPhone = `${adminCountryCode} ${adminPhoneDigits}`;
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/institution/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: adminUserId.trim(),
          password: adminPassword,
          phone: adminPhoneDigits.trim(),
          institute_id: adminInstId.trim(),
          name: adminName.trim() || `Admin (${adminUserId})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create Admin account");
      }

      setMsg({
        text: `Admin account '${data.user_id}' successfully created and stored in OSM Database!`,
        type: "success",
      });

      setAdminUserId("");
      setAdminPassword("");
      setAdminPhoneDigits("");
      setAdminName("");

      fetchAccounts();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUploader = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (uploaderPhoneDigits.length !== 10) {
      setMsg({
        text: "Uploader Phone Number must be a valid 10-digit number.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/institution/create-uploader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uploaderUserId.trim(),
          password: uploaderPassword,
          phone: uploaderPhoneDigits.trim(),
          institute_id: instituteId,
          name: uploaderName.trim() || `Uploader (${uploaderUserId})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create Uploader account");
      }

      setMsg({
        text: `Uploader account '${data.user_id}' successfully created and stored in OSM Database!`,
        type: "success",
      });

      setUploaderUserId("");
      setUploaderPassword("");
      setUploaderPhoneDigits("");
      setUploaderName("");

      fetchAccounts();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/institution/create-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_code: examCode.trim(),
          exam_date: examDate,
          num_students: parseInt(numStudents, 10),
          institute_id: instituteId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to register Exam");
      }

      setMsg({
        text: `Exam '${data.exam_code}' successfully registered!`,
        type: "success",
      });

      setExamCode("");
      setExamDate("");
      setNumStudents("");

      fetchExams();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inst-dashboard-layout">
      {/* Top Navbar */}
      <header className="inst-nav">
        <div className="inst-nav-brand">
          <div className="inst-nav-logo">
            <FaBuilding />
          </div>
          <div>
            <h1>{institutionName}</h1>
            <span className="inst-badge">Institute ID: {instituteId}</span>
          </div>
        </div>

        <div className="inst-nav-actions">
          <button className="inst-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="inst-main-container">
        {/* Action Banners */}
        {msg.text && (
          <div className={`inst-alert-banner ${msg.type}`}>
            {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="inst-grid">
          {/* Left Column: Account Creation Tabs */}
          <div className="creation-section">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === "create-admin" ? "active" : ""}`}
                onClick={() => setActiveTab("create-admin")}
              >
                <FaUserShield /> Create Admin
              </button>
              <button
                className={`tab-btn ${activeTab === "create-uploader" ? "active" : ""}`}
                onClick={() => setActiveTab("create-uploader")}
              >
                <FaCloudUploadAlt /> Create Uploader
              </button>
              <button
                className={`tab-btn ${activeTab === "register-exam" ? "active" : ""}`}
                onClick={() => setActiveTab("register-exam")}
              >
                <FaBook /> Register Exam
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "create-admin" && (
                <form onSubmit={handleCreateAdmin} className="account-form">
                  <div className="form-title">
                    <h4>Create Admin Account</h4>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>Admin User ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. ADM002"
                        value={adminUserId}
                        onChange={(e) => setAdminUserId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-block">
                      <label>Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          title={showAdminPassword ? "Hide Password" : "Show Password"}
                        >
                          {showAdminPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>Phone Number (10 Digits) *</label>
                      <div className="phone-country-group">
                        <select
                          value={adminCountryCode}
                          onChange={(e) => setAdminCountryCode(e.target.value)}
                          className="country-code-select"
                          title="Select Country Code"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="e.g. 9000000010"
                          value={adminPhoneDigits}
                          onChange={handlePhoneDigitChange(setAdminPhoneDigits)}
                          required
                        />
                      </div>
                      {adminPhoneDigits.length > 0 && adminPhoneDigits.length < 10 && (
                        <span className="field-hint warning">Must be 10 digits ({adminPhoneDigits.length}/10)</span>
                      )}
                    </div>
                    <div className="field-block">
                      <label>Institute ID *</label>
                      <input
                        type="text"
                        value={adminInstId}
                        onChange={(e) => setAdminInstId(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="field-block">
                    <label>Full Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="submit-btn admin-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Saving to Database..." : "Create Admin Account"}
                  </button>
                </form>
              )}

              {activeTab === "create-uploader" && (
                <form onSubmit={handleCreateUploader} className="account-form">
                  <div className="form-title">
                    <h4>Create Uploader Account</h4>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>Uploader User ID *</label>
                      <input
                        type="text"
                        placeholder="e.g. UPL002"
                        value={uploaderUserId}
                        onChange={(e) => setUploaderUserId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-block">
                      <label>Password *</label>
                      <div className="password-input-container">
                        <input
                          type={showUploaderPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={uploaderPassword}
                          onChange={(e) => setUploaderPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowUploaderPassword(!showUploaderPassword)}
                          title={showUploaderPassword ? "Hide Password" : "Show Password"}
                        >
                          {showUploaderPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>Phone Number (10 Digits) *</label>
                      <div className="phone-country-group">
                        <select
                          value={uploaderCountryCode}
                          onChange={(e) => setUploaderCountryCode(e.target.value)}
                          className="country-code-select"
                          title="Select Country Code"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="e.g. 9000000020"
                          value={uploaderPhoneDigits}
                          onChange={handlePhoneDigitChange(setUploaderPhoneDigits)}
                          required
                        />
                      </div>
                      {uploaderPhoneDigits.length > 0 && uploaderPhoneDigits.length < 10 && (
                        <span className="field-hint warning">Must be 10 digits ({uploaderPhoneDigits.length}/10)</span>
                      )}
                    </div>
                    <div className="field-block">
                      <label>Institute ID (Inherited)</label>
                      <input type="text" value={instituteId} disabled />
                    </div>
                  </div>

                  <div className="field-block">
                    <label>Full Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Sharma"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="submit-btn uploader-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Saving to Database..." : "Create Uploader Account"}
                  </button>
                </form>
              )}

              {activeTab === "register-exam" && (
                <form onSubmit={handleCreateExam} className="account-form">
                  <div className="form-title">
                    <h4>Register Exam</h4>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>Exam Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. EXM-101"
                        value={examCode}
                        onChange={(e) => setExamCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-block">
                      <label>Exam Date *</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-block">
                      <label>No. of Students *</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={numStudents}
                        onChange={(e) => setNumStudents(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    <div className="field-block">
                      <label>Institute ID (Inherited)</label>
                      <input type="text" value={instituteId} disabled />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn uploader-btn" disabled={submitting}>
                    <FaPlus /> {submitting ? "Registering..." : "Register Exam"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Database Accounts List / Exams List */}
          <div className="accounts-section">
            <div className="accounts-header">
              <h4>
                <FaList /> {activeTab === "register-exam" ? "Registered Exams" : "Accounts Saved in OSM Database"}
              </h4>
              <button className="refresh-btn" onClick={activeTab === "register-exam" ? fetchExams : fetchAccounts}>
                Refresh
              </button>
            </div>

            {activeTab === "register-exam" ? (
              // Exams List Table
              loadingExams ? (
                <div className="loading-state">Loading exams...</div>
              ) : exams.length === 0 ? (
                <div className="empty-state">No exams found for {instituteId}.</div>
              ) : (
                <div className="table-responsive">
                  <table className="accounts-table">
                    <thead>
                      <tr>
                        <th>Exam Code</th>
                        <th>Name</th>
                        <th>Exam Date</th>
                        <th>Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam, idx) => (
                        <tr key={idx}>
                          <td><strong>{exam.exam_code}</strong></td>
                          <td>{exam.name}</td>
                          <td>{exam.exam_date}</td>
                          <td>{exam.num_students || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : loadingAccounts ? (
              <div className="loading-state">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="empty-state">No Admin or Uploader accounts found for {instituteId}.</div>
            ) : (
              <div className="table-responsive">
                <table className="accounts-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Institute ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`role-pill ${acc.role.toLowerCase()}`}>
                            {acc.role}
                          </span>
                        </td>
                        <td><strong>{acc.user_id}</strong></td>
                        <td>{acc.name}</td>
                        <td>{acc.phone || "-"}</td>
                        <td><code>{acc.institute_id}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default InstitutionDashboardPage;
