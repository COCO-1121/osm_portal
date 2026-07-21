import { useNavigate } from "react-router-dom";
import {
  Monitor,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import "./InstructionPage.css";
import { useState } from "react";
import Footer from "../components/Footer";

export default function InstructionPage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    if (!accepted) return;

    navigate("/bank-details");
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
              <Monitor className="text-blue-600" />
              <h2 className="text-xl font-semibold">
                System Requirements
              </h2>
            </div>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle className="text-green-600" />
                Windows 10 or above
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600" />
                Chrome / Edge Browser
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600" />
                Minimum 4GB RAM
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600" />
                Stable Internet Connection
              </li>

              <li className="flex gap-3">
                <CheckCircle className="text-green-600" />
                Webcam Enabled
              </li>
            </ul>
          </div>

          {/* Guidelines */}

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="text-blue-600" />
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
            <AlertTriangle className="text-yellow-600" />

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
            <BookOpen className="text-blue-600" />

            <div>
              <h3 className="font-semibold">
                User Manual
              </h3>

              <p className="text-gray-500">
                Download complete OSM evaluation guide.
              </p>
            </div>
          </div>

          <a 
            href="/user_manual.pdf" 
            download="OSM_User_Manual.pdf"
            className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 inline-block text-center"
          >
            Download PDF
          </a>
        </div>

        {/* Checkbox */}

        <div className="mt-8 flex items-center gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />

          <span className="text-gray-700">
            I have read and understood all the instructions.
          </span>
        </div>

        {/* Continue Button */}

        <div className="mt-8">
          <button
              onClick={handleContinue}
              disabled={!accepted}
              className={`bg-blue-700 text-white px-10 py-4 rounded-xl text-2xl font-semibold shadow-md transition-all duration-200
            ${
                accepted
                  ? "hover:bg-blue-800 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
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