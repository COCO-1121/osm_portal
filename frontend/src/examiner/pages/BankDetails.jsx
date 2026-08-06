import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BankDetails.css";
import Footer from "../components/Footer";
import {
  FaUser,
  FaUserCircle,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaCreditCard,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaCheckCircle
} from "react-icons/fa";

function BankDetails() {
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState("");

  const [formData, setFormData] = useState({
    examinerId: "",
    evaluatorName: "",
    mobile: "",
    email: "",
    bankNameAsPerAccount: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
    branch: "",
    bankAddress: "",
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("examinerUserId") || "EX001";
    if (storedUserId) {
      setUserId(storedUserId);
      setFormData(prev => ({ ...prev, examinerId: storedUserId }));
    }
  }, []);

  const [errors, setErrors] = useState({});
  const [ifscVerified, setIfscVerified] = useState(false);

  // Automatically clear errors for any field that has a value
  useEffect(() => {
    setErrors(prevErrors => {
      let hasChanges = false;
      const updated = { ...prevErrors };
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].toString().trim() !== "" && updated[key]) {
          delete updated[key];
          hasChanges = true;
        }
      });
      return hasChanges ? updated : prevErrors;
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "ifsc") {
      setIfscVerified(false);
    }
  };

  const handleVerify = () => {
    if (!formData.ifsc || !formData.ifsc.trim()) {
      setErrors(prev => ({ ...prev, ifsc: "This field is required." }));
      return;
    }
    if (formData.ifsc.toUpperCase() === "SBIN0001234" || formData.ifsc.length === 11) {
        setFormData(prev => ({
            ...prev,
            bankName: prev.bankName || "State Bank of India",
            branch: prev.branch || "Main Branch",
        }));
        setErrors(prev => ({
          ...prev,
          ifsc: "",
          bankName: "",
          branch: ""
        }));
        setIfscVerified(true);
    } else {
        setErrors(prev => ({ ...prev, ifsc: "Invalid IFSC Code" }));
        setIfscVerified(false);
    }
  };

  const handleCancel = () => {
    const isUpdated = localStorage.getItem("examiner_bank_details_updated");
    if (!isUpdated) {
      alert("Filling Evaluator Profile & Bank Details is mandatory. Please complete the form and click 'Update Details' to proceed.");
      return;
    }
    navigate('/examiner/subjects');
  };

  const handleUpdate = () => {
    const newErrors = {};
    const requiredFields = [
      'examinerId', 'evaluatorName', 'mobile', 'email', 'bankNameAsPerAccount',
      'accountNumber', 'confirmAccountNumber', 'ifsc', 'bankName', 'branch', 'bankAddress'
    ];

    requiredFields.forEach(key => {
      if (!formData[key] || !formData[key].trim()) {
        newErrors[key] = "This field is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setErrors(prev => ({ ...prev, confirmAccountNumber: "Account numbers do not match." }));
      return;
    }

    // Save details and set mandatory completed flag
    localStorage.setItem("examiner_bank_details", JSON.stringify(formData));
    localStorage.setItem("examiner_bank_details_updated", "true");
    alert("Bank details updated successfully!");
    navigate('/examiner/subjects');
  };

  return (
    <div className="bank-page">
      {/* Header */}
      <header className="bank-header">
        <div className="header-left">
          <h1>On-Screen Marking System</h1>
          <p>Evaluator Profile & Bank Details</p>
        </div>
        <div className="header-right">
          <div className="user-box">
            <span>User ID</span>
            <strong>{userId || "EX001"}</strong>
          </div>
          <div className="user-box">
            <span>Role</span>
            <strong>Evaluator</strong>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="bank-container">
        {/* LEFT */}
        <section className="bank-card">
          <div className="card-heading">
            <FaUserCircle />
            <h2>Evaluator Profile</h2>
          </div>

          <div className="field">
            <label>User ID *</label>
            <div className={`input-box ${errors.examinerId ? 'input-error' : ''}`}>
              <FaUser />  
              <input
                type="text"
                name="examinerId"
                value={formData.examinerId}
                onChange={handleChange}
                placeholder="Enter ID"
              />
            </div>
            {errors.examinerId && <div className="error-text"><FaTimesCircle /> {errors.examinerId}</div>}
          </div>

          <div className="field">
            <label>Evaluator Name *</label>
            <div className={`input-box ${errors.evaluatorName ? 'input-error' : ''}`}>
              <FaUser />
              <input
                type="text"
                name="evaluatorName"
                value={formData.evaluatorName}
                onChange={handleChange}
                placeholder="Enter Name"
              />
            </div>
            {errors.evaluatorName && <div className="error-text"><FaTimesCircle /> {errors.evaluatorName}</div>}
          </div>

          <div className="field">
            <label>Mobile Number *</label>
            <div className={`input-box ${errors.mobile ? 'input-error' : ''}`}>
              <FaPhone />
              <input 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number" 
              />
            </div>
            {errors.mobile && <div className="error-text"><FaTimesCircle /> {errors.mobile}</div>}
          </div>

          <div className="field">
            <label>Email Address *</label>
            <div className={`input-box ${errors.email ? 'input-error' : ''}`}>
              <FaEnvelope />
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email Address" 
              />
            </div>
            {errors.email && <div className="error-text"><FaTimesCircle /> {errors.email}</div>}
          </div>
        </section>

        {/* RIGHT */}
        <section className="bank-card">
          <div className="card-heading">
            <FaUniversity />
            <h2>Bank Details</h2>
          </div>

          <div className="field">
            <label>Name As Per Bank *</label>
            <div className={`input-box ${errors.bankNameAsPerAccount ? 'input-error' : ''}`}>
              <FaUser />
              <input
                name="bankNameAsPerAccount"
                value={formData.bankNameAsPerAccount}
                onChange={handleChange}
                placeholder="Enter Name"
              />
            </div>
            {errors.bankNameAsPerAccount && <div className="error-text"><FaTimesCircle /> {errors.bankNameAsPerAccount}</div>}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Bank Account Number *</label>
              <div className={`input-box ${errors.accountNumber ? 'input-error' : ''}`}>
                <FaCreditCard />
                <input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                />
              </div>
              {errors.accountNumber && <div className="error-text"><FaTimesCircle /> {errors.accountNumber}</div>}
            </div>
            <div className="field">
              <label>Confirm Account Number *</label>
              <div className={`input-box ${errors.confirmAccountNumber ? 'input-error' : ''}`}>
                <FaCreditCard />
                <input
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleChange}
                  placeholder="Confirm Account Number"
                />
              </div>
              {errors.confirmAccountNumber && <div className="error-text"><FaTimesCircle /> {errors.confirmAccountNumber}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>IFSC Code *</label>
              <div className="ifsc-wrapper">
                <div className={`input-box ${errors.ifsc ? 'input-error' : ''}`}>
                  <FaUniversity />
                  <input
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    placeholder="Enter IFSC Code"
                  />
                </div>
                <button
                  type="button"
                  className="verify-btn"
                  onClick={handleVerify}
                >
                  Verify
                </button>
              </div>
              {errors.ifsc && <div className="error-text"><FaTimesCircle /> {errors.ifsc}</div>}
              {ifscVerified && !errors.ifsc && <div className="success-text"><FaCheckCircle /> IFSC Verified Successfully</div>}
            </div>
            <div className="field">
              <label>Bank Name *</label>
              <div className={`input-box ${errors.bankName ? 'input-error' : ''}`}>
                <FaUniversity />
                <input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                />
              </div>
              {errors.bankName && <div className="error-text"><FaTimesCircle /> {errors.bankName}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Branch *</label>
              <div className={`input-box ${errors.branch ? 'input-error' : ''}`}>
                <FaUniversity />
                <input
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="Branch Name"
                />  
              </div>
              {errors.branch && <div className="error-text"><FaTimesCircle /> {errors.branch}</div>}
            </div>
            <div className="field">
              <label>Bank Address *</label>
              <div className={`textarea-box ${errors.bankAddress ? 'input-error' : ''}`}>
                <FaMapMarkerAlt />
                <textarea
                  rows="2"
                  name="bankAddress"
                  value={formData.bankAddress}
                  onChange={handleChange}
                  placeholder="Enter Complete Address"
                />    
              </div>
              {errors.bankAddress && <div className="error-text"><FaTimesCircle /> {errors.bankAddress}</div>}
            </div>
          </div>

          <div className="button-group">
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
            <button
              type="button"
              onClick={handleUpdate}
              className="update-btn"
            >
              Update Details
            </button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

export default BankDetails;