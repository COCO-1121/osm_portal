import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaUserEdit,
  FaRandom,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function ReviewActions() {
  const navigate = useNavigate();

  // Main decision: "examiner" | "uploader" | ""
  const [decision, setDecision] = useState("");

  // Examiner queue sub-options
  const [assignDifferent, setAssignDifferent] = useState(false);
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  // Uploader path
  const [uploaderRemarks, setUploaderRemarks] = useState("");

  // Accordion toggle for assignment policy
  const [policyOpen, setPolicyOpen] = useState(false);

  const defaultMessages = [
    "All pages verified.",
    "Continue evaluation.",
  ];

  const handleSubmit = () => {
    if (!decision) {
      alert("Please select a review decision.");
      return;
    }


    const summary =
      decision === "examiner"
        ? assignDifferent
          ? "Return to Examiner Queue — script will be placed in the pool and assigned to a new examiner."
          : "Return to Examiner Queue — script will be returned to the original examiner."
        : "Return to Uploader — script will be sent back for re-upload.";

    const confirmed = window.confirm(`${summary}\n\nConfirm submission?`);
    if (!confirmed) return;

    alert("Decision submitted successfully.");
    navigate("/admin/rejected-scripts");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Review Decision</h2>
      <p className="text-sm text-gray-500 mb-6">
        Select how this rejected script should be handled.
      </p>

      {/* ── Decision Cards ─────────────────────────────────── */}
      <div className="space-y-3">

        {/* Option 1 — Return to Examiner Queue */}
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
            decision === "examiner"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <input
            type="radio"
            value="examiner"
            checked={decision === "examiner"}
            onChange={(e) => setDecision(e.target.value)}
            className="mt-1 accent-blue-600"
          />
          <div>
            <span className="font-semibold text-gray-800">
              Return to Examiner Queue
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Uploader rejection was invalid — return script for continued evaluation.
            </p>
          </div>
        </label>

        {/* Option 2 — Return to Uploader */}
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
            decision === "uploader"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-orange-300"
          }`}
        >
          <input
            type="radio"
            value="uploader"
            checked={decision === "uploader"}
            onChange={(e) => setDecision(e.target.value)}
            className="mt-1 accent-orange-500"
          />
          <div>
            <span className="font-semibold text-gray-800">Return to Uploader</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Rejection is valid — send script back to uploader for re-upload.
            </p>
          </div>
        </label>

      </div>

      {/* ── Examiner Queue Panel ───────────────────────────────────── */}
      {decision === "examiner" && (
        <div className="mt-6 space-y-5">

          {/* Default verification messages */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Default Message
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              {defaultMessages.map((msg) => (
                <div
                  key={msg}
                  className="flex items-center gap-2 text-green-700 text-sm"
                >
                  <FaCheckCircle className="flex-shrink-0" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional remarks — optional */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Additional Remarks{" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={additionalRemarks}
              onChange={(e) => setAdditionalRemarks(e.target.value)}
              placeholder="Enter any additional notes for the examiner..."
              className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-600 resize-none"
            />
          </div>

          {/* Assignment section */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Assignment Policy
            </p>
            <div className="border border-gray-200 rounded-xl overflow-hidden">

              {/* Default — same examiner */}
              <div
                className={`flex items-center gap-3 p-4 cursor-pointer transition ${
                  !assignDifferent ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setAssignDifferent(false)}
              >
                <FaUserEdit
                  className={`text-lg flex-shrink-0 ${
                    !assignDifferent ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Return to Original Examiner
                  </p>
                  <p className="text-xs text-gray-500">
                    Script is reassigned to the same examiner by default.
                  </p>
                </div>
                <input
                  type="radio"
                  checked={!assignDifferent}
                  onChange={() => setAssignDifferent(false)}
                  className="accent-blue-600"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="border-t border-gray-200" />

              {/* Assign different examiner */}
              <div
                className={`flex items-center gap-3 p-4 cursor-pointer transition ${
                  assignDifferent ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setAssignDifferent(true)}
              >
                <FaRandom
                  className={`text-lg flex-shrink-0 ${
                    assignDifferent ? "text-indigo-600" : "text-gray-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Assign Different Examiner
                  </p>
                  <p className="text-xs text-gray-500">
                    Script enters the pool and is randomly assigned to a new examiner.
                  </p>
                </div>
                <input
                  type="radio"
                  checked={assignDifferent}
                  onChange={() => setAssignDifferent(true)}
                  className="accent-indigo-600"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Policy accordion */}
              {assignDifferent && (
                <div className="border-t border-indigo-100 bg-indigo-50">
                  <button
                    type="button"
                    onClick={() => setPolicyOpen((o) => !o)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition"
                  >
                    {policyOpen ? <FaChevronUp /> : <FaChevronDown />}
                    Assignment Policy Details
                  </button>
                  {policyOpen && (
                    <ul className="px-6 pb-4 text-xs text-indigo-800 space-y-1.5 list-disc">
                      <li>
                        The original examiner will{" "}
                        <strong>not</strong> be reassigned this script.
                      </li>
                      <li>
                        The script is placed into the examiner assignment pool.
                      </li>
                      <li>
                        A new examiner is selected randomly by the
                        system's assignment algorithm.
                      </li>
                      <li>
                        This ensures workload balancing across available examiners.
                      </li>
                    </ul>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Uploader Remarks Panel ─────────────────────────────────── */}
      {decision === "uploader" && (
        <div className="mt-6">
          <label className="text-sm font-semibold text-gray-700">
            Remarks <span className="font-normal text-gray-400">(Optional)</span>
          </label>
          <textarea
            rows={4}
            value={uploaderRemarks}
            onChange={(e) => setUploaderRemarks(e.target.value)}
            placeholder="State the reason for returning to uploader..."
            className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500 resize-none"
          />
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={!decision}
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            decision
              ? "bg-blue-700 hover:bg-blue-800 text-white shadow hover:shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Decision
        </button>
      </div>

    </div>
  );
}

export default ReviewActions;