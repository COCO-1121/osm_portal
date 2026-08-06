import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, ShieldCheck, AlertTriangle, BookOpen, CheckCircle } from "lucide-react";
import Footer from "../../shared/components/Footer";

export default function InstructionPage() {
  const navigate = useNavigate();
  const [isAccepted, setIsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Clear bank details completion flag when instructions are opened
  useEffect(() => {
    localStorage.removeItem("examiner_bank_details_updated");
    localStorage.removeItem("examiner_bank_details");
  }, []);

  const handleContinue = () => {
    if (!isAccepted) {
      setErrorMsg("Please check the box to confirm you have read and understood all instructions.");
      return;
    }
    setErrorMsg("");
    localStorage.setItem("examiner_instructions_accepted", "true");
    navigate('/examiner/bank-details');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm border-b p-5">
        <h1 className="text-3xl font-bold text-blue-900">
          Evaluation Instructions
        </h1>
        <p className="text-gray-600 mt-2">
          Please read all instructions before starting evaluation.
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-8">

        <div className="grid lg:grid-cols-2 gap-8">

          {/* System Requirements */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-5">
              <Monitor className="text-blue-600"/>
              <h2 className="text-xl font-semibold">
                System Requirements
              </h2>
            </div>

            <ul className="space-y-4">

              <li className="flex gap-3">
                <CheckCircle className="text-green-600"/>
                Windows 10 or above
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600"/>
                Chrome / Edge Browser
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600"/>
                Minimum 4GB RAM
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600"/>
                Stable Internet Connection
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600"/>
                Webcam Enabled
              </li>

            </ul>

          </div>

          {/* Guidelines */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="text-blue-600"/>
              <h2 className="text-xl font-semibold">
                Evaluation Guidelines
              </h2>
            </div>

            <ul className="space-y-4">

              <li>✔ Verify the Question Paper.</li>

              <li>✔ Check the Marking Scheme carefully.</li>

              <li>✔ Evaluate every answer before submitting.</li>

              <li>✔ Save your progress regularly.</li>

              <li>✔ Report discrepancies immediately.</li>

            </ul>

          </div>

        </div>

        {/* Warning */}

        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mt-8">

          <div className="flex items-center gap-3">

            <AlertTriangle className="text-yellow-600"/>

            <h2 className="text-xl font-semibold">
              Important Notes
            </h2>

          </div>

          <ul className="mt-5 space-y-3">

            <li>Do not refresh the browser while evaluating.</li>

            <li>Do not share your credentials.</li>

            <li>Keep webcam enabled throughout evaluation.</li>

            <li>Complete evaluation responsibly.</li>

          </ul>

        </div>

        {/* Manual */}

        <div className="bg-white rounded-xl shadow mt-8 p-6 flex justify-between items-center">

          <div className="flex gap-3">

            <BookOpen className="text-blue-600"/>

            <div>

              <h3 className="font-semibold">
                User Manual
              </h3>

              <p className="text-gray-500">
                Download complete OSM evaluation guide.
              </p>

            </div>

          </div>

          <button className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800">
            Download PDF
          </button>

        </div>

        {/* Checkbox */}

        <div className="mt-8">

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => {
                setIsAccepted(e.target.checked);
                if (e.target.checked) setErrorMsg("");
              }}
              className="w-5 h-5 accent-blue-700 cursor-pointer"
            />

            <span className="text-gray-700 font-medium select-none">
              I have read and understood all the instructions.
            </span>
          </label>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2 font-semibold flex items-center gap-1">
              ⚠️ {errorMsg}
            </p>
          )}

        </div>

        {/* Continue */}

        <div className="mt-6">

          <button
            onClick={handleContinue}
            className={`px-8 py-3 rounded-xl text-lg font-semibold shadow transition-all ${
              isAccepted
                ? "bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                : "bg-blue-300 text-white cursor-not-allowed opacity-80"
            }`}
          >
            Continue for Evaluation
          </button>

        </div>

      </div>

      <Footer />
    </div>
  );
}