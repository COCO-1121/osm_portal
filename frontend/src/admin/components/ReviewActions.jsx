import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const API_URL = "http://127.0.0.1:8000";

function ReviewActions({ rejectionId, script }) {
  const navigate = useNavigate();

  // Main decision: "examiner" | "uploader" | ""
  const [decision, setDecision] = useState("");

  // Examiner path
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  // Uploader path
  const [uploaderRemarks, setUploaderRemarks] = useState("");

  // API submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // A script can only be reviewed while pending
  const isAlreadyReviewed =
    script?.status !== "PENDING_ADMIN_REVIEW";

  const defaultMessages = [
    "All pages verified.",
    "Continue evaluation.",
  ];

  // Convert backend status into readable UI text
  const formatStatus = (status) => {
    const statusMap = {
      PENDING_ADMIN_REVIEW: "Pending Admin Review",
      RETURNED_TO_EXAMINER: "Returned to Examiner",
      RETURNED_TO_UPLOADER: "Returned to Uploader",
    };

    return statusMap[status] || status || "Unknown";
  };

  // Convert backend decision into readable UI text
  const formatDecision = (reviewDecision) => {
    const decisionMap = {
      RETURN_TO_EXAMINER: "Return to Examiner",
      RETURN_TO_UPLOADER: "Return to Uploader",
    };

    return (
      decisionMap[reviewDecision] ||
      reviewDecision ||
      "Not Available"
    );
  };

  // Format backend datetime for UI
  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "Not Available";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return dateTime;
    }

    return date.toLocaleString();
  };

  const handleSubmit = async () => {
    // Frontend safety check
    if (isAlreadyReviewed) {
      setError(
        "This rejected script has already been reviewed."
      );
      return;
    }

    if (!decision) {
      alert("Please select a review decision.");
      return;
    }

    if (!rejectionId) {
      setError(
        "Rejection ID is missing. Unable to submit the decision."
      );
      return;
    }

    const summary =
      decision === "examiner"
        ? "Return to Examiner Queue — script will be returned to the original examiner for continued evaluation."
        : "Return to Uploader — script will be sent back to the uploader for re-upload.";

    const confirmed = window.confirm(
      `${summary}\n\nConfirm submission?`
    );

    if (!confirmed) {
      return;
    }

    // Map frontend decision values to backend values
    const apiDecision =
      decision === "examiner"
        ? "RETURN_TO_EXAMINER"
        : "RETURN_TO_UPLOADER";

    // Select remarks according to the chosen decision
    const remarks =
      decision === "examiner"
        ? additionalRemarks.trim()
        : uploaderRemarks.trim();

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/rejected-scripts/${rejectionId}/decision`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            decision: apiDecision,
            remarks: remarks || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Rejected script not found."
          );
        }

        if (response.status === 409) {
          throw new Error(
            data.detail ||
            "This rejected script has already been reviewed."
          );
        }

        throw new Error(
          data.detail ||
          "Failed to submit review decision."
        );
      }

      alert("Decision submitted successfully.");

      navigate("/admin/rejected-scripts");
    } catch (err) {
      console.error(
        "Submit review decision error:",
        err
      );

      setError(
        err.message ||
        "Something went wrong while submitting the decision."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // View-only mode for scripts that have already been reviewed
  if (isAlreadyReviewed) {
    const reviewedStatus = formatStatus(script?.status);

    const reviewedDecision = formatDecision(
      script?.review_decision
    );

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Review Decision
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          This rejected script has already been reviewed.
        </p>

        <div className="space-y-4">
          {/* Final Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">
              Final Status
            </p>

            <p className="font-semibold text-gray-800">
              {reviewedStatus}
            </p>
          </div>

          {/* Admin Decision */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 mb-1">
              Admin Decision
            </p>

            <p className="font-semibold text-blue-800">
              {reviewedDecision}
            </p>
          </div>

          {/* System Message */}
          {script?.system_message && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-600 mb-1">
                System Message
              </p>

              <div className="flex items-start gap-2 text-green-800">
                <FaCheckCircle className="mt-1 flex-shrink-0" />

                <p className="font-medium">
                  {script.system_message}
                </p>
              </div>
            </div>
          )}

          {/* Admin Remarks */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">
              Admin Remarks
            </p>

            <p className="font-medium text-gray-800 whitespace-pre-wrap">
              {script?.admin_remarks ||
                "No additional remarks provided."}
            </p>
          </div>

          {/* Reviewed At */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">
              Reviewed At
            </p>

            <p className="font-medium text-gray-800">
              {formatDateTime(script?.reviewed_at)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal review mode for pending scripts
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Review Decision
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Select how this rejected script should be handled.
      </p>

      {/* Decision Cards */}
      <div className="space-y-3">
        {/* Option 1 — Return to Examiner Queue */}
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${decision === "examiner"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
            }`}
        >
          <input
            type="radio"
            value="examiner"
            checked={decision === "examiner"}
            onChange={(e) =>
              setDecision(e.target.value)
            }
            className="mt-1 accent-blue-600"
          />

          <div>
            <span className="font-semibold text-gray-800">
              Return to Examiner Queue
            </span>

            <p className="text-xs text-gray-500 mt-0.5">
              Rejection was invalid — return the script to the
              original examiner for continued evaluation.
            </p>
          </div>
        </label>

        {/* Option 2 — Return to Uploader */}
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${decision === "uploader"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-orange-300"
            }`}
        >
          <input
            type="radio"
            value="uploader"
            checked={decision === "uploader"}
            onChange={(e) =>
              setDecision(e.target.value)
            }
            className="mt-1 accent-orange-500"
          />

          <div>
            <span className="font-semibold text-gray-800">
              Return to Uploader
            </span>

            <p className="text-xs text-gray-500 mt-0.5">
              Rejection is valid — send the script back to the
              uploader for re-upload.
            </p>
          </div>
        </label>
      </div>

      {/* Examiner Queue Panel */}
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

                  <span>
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional remarks */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Additional Remarks{" "}
              <span className="font-normal text-gray-400">
                (Optional)
              </span>
            </label>

            <textarea
              rows={3}
              value={additionalRemarks}
              onChange={(e) =>
                setAdditionalRemarks(e.target.value)
              }
              placeholder="Enter any additional notes for the examiner..."
              className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-600 resize-none"
            />
          </div>
        </div>
      )}

      {/* Uploader Remarks Panel */}
      {decision === "uploader" && (
        <div className="mt-6">
          <label className="text-sm font-semibold text-gray-700">
            Remarks{" "}
            <span className="font-normal text-gray-400">
              (Optional)
            </span>
          </label>

          <textarea
            rows={4}
            value={uploaderRemarks}
            onChange={(e) =>
              setUploaderRemarks(e.target.value)
            }
            placeholder="State the reason for returning to uploader..."
            className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500 resize-none"
          />
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!decision || submitting}
          className={`px-8 py-3 rounded-lg font-semibold transition ${decision && !submitting
              ? "bg-blue-700 hover:bg-blue-800 text-white shadow hover:shadow-md"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {submitting
            ? "Submitting..."
            : "Submit Decision"}
        </button>
      </div>
    </div>
  );
}

export default ReviewActions;