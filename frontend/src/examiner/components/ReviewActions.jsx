import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ReviewActions({ rejectionId }) {
  const navigate = useNavigate();

  // Main decision: "examiner" | "uploader" | ""
  const [decision, setDecision] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [uploaderRemarks, setUploaderRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const defaultMessages = [
    "All pages verified.",
    "Continue evaluation.",
  ];

  const handleSubmit = async () => {
    if (!decision) {
      alert("Please select a review decision.");
      return;
    }

    const summary =
      decision === "examiner"
        ? "Return to Examiner Queue — script will be returned for continued evaluation."
        : "Return to Uploader — script will be sent back for re-upload.";

    const confirmed = window.confirm(`${summary}\n\nConfirm submission?`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("access_token");

      if (rejectionId && token) {
        const payloadDecision =
          decision === "examiner" ? "RETURN_TO_EXAMINER" : "RETURN_TO_UPLOADER";
        const remarks =
          decision === "examiner" ? additionalRemarks : uploaderRemarks;

        const response = await fetch(
          `${API_URL}/api/v1/admin/rejected-scripts/${rejectionId}/decision`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              decision: payloadDecision,
              admin_remarks: remarks || undefined,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to submit review decision.");
        }
      }

      alert("Decision submitted successfully.");
      navigate("/admin/rejected-scripts");
    } catch (err) {
      console.error("Submit decision error:", err);
      alert(err.message || "Failed to submit decision.");
    } finally {
      setSubmitting(false);
    }
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
            name="reviewDecision"
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
            name="reviewDecision"
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
          type="button"
          onClick={handleSubmit}
          disabled={!decision || submitting}
          className={`px-8 py-3 rounded-lg font-semibold transition cursor-pointer ${
            decision && !submitting
              ? "bg-blue-700 hover:bg-blue-800 text-white shadow hover:shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Decision"}
        </button>
      </div>
    </div>
  );
}

export default ReviewActions;