import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrown,
  FaPlus,
  FaList,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMagic,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./SuperAdminDashboard.css";

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

const LOCAL_PINCODE_MAP = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "110042": { city: "North Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "160001": { city: "Chandigarh", state: "Punjab" },
  "800001": { city: "Patna", state: "Bihar" },
  "751001": { city: "Bhubaneswar", state: "Odisha" },
  "781001": { city: "Guwahati", state: "Assam" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "452001": { city: "Indore", state: "Madhya Pradesh" },
};

function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const superAdminName = localStorage.getItem("super_admin_name") || "OSM Super Administrator";

  const [institutions, setInstitutions] = useState([]);
  const [loadingInst, setLoadingInst] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("University");
  const [email, setEmail] = useState("");
  
  // Phone + Country Code (Default +91)
  const [officialCountryCode, setOfficialCountryCode] = useState("+91");
  const [officialPhoneDigits, setOfficialPhoneDigits] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [autofilled, setAutofilled] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Contact Phone + Country Code (Default +91)
  const [contactCountryCode, setContactCountryCode] = useState("+91");
  const [contactPhoneDigits, setContactPhoneDigits] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInstitutions = async () => {
    setLoadingInst(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/super-admin/institutions");
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data);
      } else {
        setMsg({
          text: "Unable to load institutions from server. Please ensure backend is running.",
          type: "error",
        });
      }
    } catch (err) {
      setMsg({
        text: "Failed to connect to backend server at http://localhost:8000. Please start the backend service.",
        type: "error",
      });
    } finally {
      setLoadingInst(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("super_admin_user_id");
    localStorage.removeItem("super_admin_name");
    navigate("/");
  };

  // Handle Pincode Auto-Fill
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    setAutofilled(false);

    if (val.length === 6) {
      if (LOCAL_PINCODE_MAP[val]) {
        setCity(LOCAL_PINCODE_MAP[val].city);
        setState(LOCAL_PINCODE_MAP[val].state);
        setAutofilled(true);
        return;
      }

      setFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const foundCity = po.District || po.Division || po.Name;
            const foundState = po.State;
            setCity(foundCity);
            setState(foundState);
            setAutofilled(true);
          }
        }
      } catch (err) {
        console.error("Pincode API lookup error:", err);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  const handlePhoneDigitChange = (setter) => (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
    setter(cleaned);
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (officialPhoneDigits.length !== 10) {
      setMsg({
        text: "Official Phone Number must be a valid 10-digit number.",
        type: "error",
      });
      return;
    }

    if (contactPhoneDigits.length !== 10) {
      setMsg({
        text: "Contact Person Phone Number must be a valid 10-digit number.",
        type: "error",
      });
      return;
    }

    const fullOfficialPhone = `${officialCountryCode} ${officialPhoneDigits}`;
    const fullContactPhone = `${contactCountryCode} ${contactPhoneDigits}`;

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          institute_id: code.trim(),
          institution_type: type,
          email: email.trim(),
          phone: fullOfficialPhone,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          contact_person_name: contactName.trim(),
          contact_person_email: contactEmail.trim(),
          contact_person_phone: fullContactPhone,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create Institution");
      }

      setMsg({
        text: `Institution '${data.name}' (${data.institute_id}) successfully registered!`,
        type: "success",
      });

      setName("");
      setCode("");
      setEmail("");
      setOfficialPhoneDigits("");
      setAddress("");
      setCity("");
      setState("");
      setPincode("");
      setAutofilled(false);
      setContactName("");
      setContactEmail("");
      setContactPhoneDigits("");
      setPassword("");

      fetchInstitutions();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (instCode, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`http://localhost:8000/api/v1/super-admin/institutions/${instCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchInstitutions();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.institute_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.contact_person_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="super-dashboard-layout">
      {/* Top Navbar */}
      <header className="super-nav">
        <div className="super-nav-brand">
          <div className="super-nav-logo">
            <FaCrown />
          </div>
          <div>
            <h1>{superAdminName}</h1>
            <span className="super-badge">Head Administrator (Level 1)</span>
          </div>
        </div>

        <div className="super-nav-actions">
          <button className="super-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="super-main-container">
        {/* Message Banner */}
        {msg.text && (
          <div className={`super-alert-banner ${msg.type}`}>
            {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="super-grid">
          {/* Left Column: Create Institution Form */}
          <div className="super-form-card">
            <div className="card-header">
              <h4><FaPlus /> Register New Institution</h4>
              <p>Add college/university details to grant portal access</p>
            </div>

            <form onSubmit={handleCreateInstitution} className="super-form-body">
              {/* Institution Identity */}
              <div className="section-title">1. Institution Identity</div>
              <div className="form-row">
                <div className="field-block">
                  <label>Institution Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi Technological University"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="field-block">
                  <label>Institution Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. INST001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-block">
                  <label>Institution Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="University">University</option>
                    <option value="College">College</option>
                    <option value="Institute">Institute</option>
                  </select>
                </div>
                <div className="field-block">
                  <label>Official Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. info@dtu.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                {/* Official Phone Number with Pure Country Code Selector */}
                <div className="field-block">
                  <label>Official Phone (10 Digits) *</label>
                  <div className="phone-country-group">
                    <select
                      value={officialCountryCode}
                      onChange={(e) => setOfficialCountryCode(e.target.value)}
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
                      placeholder="e.g. 9876543210"
                      value={officialPhoneDigits}
                      onChange={handlePhoneDigitChange(setOfficialPhoneDigits)}
                      required
                    />
                  </div>
                  {officialPhoneDigits.length > 0 && officialPhoneDigits.length < 10 && (
                    <span className="field-hint warning">Must be 10 digits ({officialPhoneDigits.length}/10)</span>
                  )}
                </div>

                <div className="field-block">
                  <label>Institution Password *</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password for Institution Login"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Details with Pincode Autofill */}
              <div className="section-title">2. Address & Location</div>
              <div className="field-block">
                <label>Address *</label>
                <input
                  type="text"
                  placeholder="Shahbad Daulatpur, Main Bawana Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-row three-col">
                <div className="field-block">
                  <label>Pincode * {fetchingPincode && <small>(Looking up...)</small>}</label>
                  <input
                    type="text"
                    placeholder="e.g. 110042"
                    value={pincode}
                    onChange={handlePincodeChange}
                    required
                  />
                  {autofilled && (
                    <span className="field-hint success"><FaMagic /> City & State Autofilled!</span>
                  )}
                </div>
                <div className="field-block">
                  <label>City *</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="field-block">
                  <label>State *</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contact Person Details */}
              <div className="section-title">3. Main Contact Person</div>
              <div className="field-block">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Rajesh Kumar (Registrar)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="field-block">
                  <label>Contact Person Email *</label>
                  <input
                    type="email"
                    placeholder="registrar@dtu.ac.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Contact Person Phone with Pure Country Code Selector */}
                <div className="field-block">
                  <label>Contact Phone (10 Digits) *</label>
                  <div className="phone-country-group">
                    <select
                      value={contactCountryCode}
                      onChange={(e) => setContactCountryCode(e.target.value)}
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
                      placeholder="e.g. 9810012345"
                      value={contactPhoneDigits}
                      onChange={handlePhoneDigitChange(setContactPhoneDigits)}
                      required
                    />
                  </div>
                  {contactPhoneDigits.length > 0 && contactPhoneDigits.length < 10 && (
                    <span className="field-hint warning">Must be 10 digits ({contactPhoneDigits.length}/10)</span>
                  )}
                </div>
              </div>

              <button type="submit" className="super-submit-btn" disabled={submitting}>
                <FaPlus /> {submitting ? "Registering Institution..." : "Register Institution"}
              </button>
            </form>
          </div>

          {/* Right Column: Registered Institutions Table */}
          <div className="super-list-card">
            <div className="card-header flex-header">
              <div>
                <h4><FaList /> Registered Institutions ({filteredInstitutions.length})</h4>
                <p>Manage and monitor all institutions in the system</p>
              </div>

              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search institution or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loadingInst ? (
              <div className="loading-state">Loading registered institutions...</div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="empty-state">No institutions found. Use the form to register one.</div>
            ) : (
              <div className="table-responsive">
                <table className="super-table">
                  <thead>
                    <tr>
                      <th>Institution Details</th>
                      <th>Location</th>
                      <th>Contact Person</th>
                      <th>Metrics</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstitutions.map((inst, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="inst-name-cell">
                            <strong>{inst.name}</strong>
                            <span className="inst-code-badge">{inst.institute_id}</span>
                            <small className="inst-type">{inst.institution_type}</small>
                          </div>
                        </td>
                        <td>
                          <div className="cell-info">
                            <span><FaMapMarkerAlt /> {inst.city}, {inst.state}</span>
                            <small>Pin: {inst.pincode}</small>
                          </div>
                        </td>
                        <td>
                          <div className="cell-info">
                            <strong>{inst.contact_person_name}</strong>
                            <span><FaEnvelope /> {inst.contact_person_email}</span>
                            <span><FaPhone /> {inst.contact_person_phone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="metrics-cell">
                            <span className="m-badge admin-m">Admins: {inst.admin_count}</span>
                            <span className="m-badge uploader-m">Uploaders: {inst.uploader_count}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${inst.status.toLowerCase()}`}>
                            {inst.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="toggle-status-btn"
                            onClick={() => toggleStatus(inst.institute_id, inst.status)}
                            title="Toggle Active/Inactive Status"
                          >
                            {inst.status === "Active" ? (
                              <FaToggleOn className="icon-on" />
                            ) : (
                              <FaToggleOff className="icon-off" />
                            )}
                          </button>
                        </td>
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

export default SuperAdminDashboardPage;
