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
} from "react-icons/fa";

function BankDetails() {
  const navigate = useNavigate();

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
            <strong>E1438427</strong>
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
            <div className="input-box">
              <FaUser />
              <input value="E1438427" readOnly />
            </div>
          </div>

          <div className="field">
            <label>Evaluator Name *</label>
            <div className="input-box">
              <FaUser />
              <input value="Nakul Dhali" readOnly />
            </div>
          </div>

          <div className="field">
            <label>Mobile Number *</label>
            <div className="input-box">
              <FaPhone />
              <input placeholder="Enter Mobile Number" />
            </div>
          </div>

          <div className="field">
            <label>Email Address *</label>
            <div className="input-box">
              <FaEnvelope />
              <input placeholder="Enter Email Address" />
            </div>
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
            <div className="input-box">
              <FaUser />
              <input placeholder="Enter Name" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Bank Account Number *</label>
              <div className="input-box">
                <FaCreditCard />
                <input placeholder="Enter Account Number" />
              </div>
            </div>
            <div className="field">
              <label>Confirm Account Number *</label>
              <div className="input-box">
                <FaCreditCard />
                <input placeholder="Confirm Account Number" />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>IFSC Code *</label>
              <div className="ifsc-wrapper">
                <div className="input-box">
                  <FaUniversity />
                  <input placeholder="Enter IFSC Code" />
                </div>
                <button className="verify-btn">Verify</button>
              </div>
            </div>
            <div className="field">
              <label>Bank Name *</label>
              <div className="input-box">
                <FaUniversity />
                <input placeholder="Bank Name" />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Branch *</label>
              <div className="input-box">
                <FaUniversity />
                <input placeholder="Branch Name" />
              </div>
            </div>
            <div className="field">
              <label>Bank Address *</label>
              <div className="textarea-box">
                <FaMapMarkerAlt />
                <textarea rows="2" placeholder="Enter Complete Address"></textarea>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="cancel-btn">Cancel</button>
            <button
              onClick={() => navigate('/subject-assignment')}
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