import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import SubjectAssignmentCard from "../../shared/components/SubjectAssignmentCard";

const checkBankDetailsComplete = () => {
  const isFlagged = localStorage.getItem("examiner_bank_details_updated");
  const storedData = localStorage.getItem("examiner_bank_details");
  if (isFlagged !== "true" || !storedData) return false;
  try {
    const parsed = JSON.parse(storedData);
    const required = [
      'examinerId', 'evaluatorName', 'mobile', 'email', 'bankNameAsPerAccount',
      'accountNumber', 'confirmAccountNumber', 'ifsc', 'bankName', 'branch', 'bankAddress'
    ];
    return required.every(key => parsed[key] && parsed[key].toString().trim() !== "");
  } catch (e) {
    return false;
  }
};

function ExaminerSubjectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkBankDetailsComplete()) {
      alert("Filling Evaluator Profile & Bank Details is mandatory before accessing your Subject Assignment.");
      navigate("/examiner/bank-details", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-6">
        <SubjectAssignmentCard />
      </main>

    </div>
  );
}

export default ExaminerSubjectPage;