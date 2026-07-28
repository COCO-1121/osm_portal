import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaHistory,
  FaQuestionCircle,
  FaFileAlt,
  FaExclamationCircle,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaCloudUploadAlt,
  FaChevronDown,
} from "react-icons/fa";

function UploaderDashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/uploader-login");
    }
  };

  // Whenever the selected date changes, fetch exams that were conducted
  // on that date so the "Select Exam" dropdown only shows relevant options.
  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedDate) {
        setExams([]);
        setSelectedExam("");
        return;
      }

      const token = localStorage.getItem("uploader_token");
      if (!token) return;

      setExamsLoading(true);
      setSelectedExam(""); // reset previously selected exam when date changes

      try {
        const response = await fetch(
          "/api/exams/?date=" + encodeURIComponent(selectedDate),
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (!response.ok) {
          setExams([]);
          setExamsLoading(false);
          return;
        }

        const data = await response.json();
        setExams(data || []);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, [selectedDate]);

  const uploadButtonLabel = uploading ? "Uploading..." : "Upload";

  const performUpload = async (pickedFile) => {
    const token = localStorage.getItem("uploader_token");
    if (!token) {
      alert("Please login again.");
      navigate("/uploader-login");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      // backend's /upload endpoint reads this Form field as "exam"
      formData.append("exam", selectedExam);
      formData.append("date", selectedDate);
      formData.append("file", pickedFile);

      const response = await fetch("/api/scanned-documents/upload", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("uploader_token");
        localStorage.removeItem("uploader_id");
        navigate("/uploader-login");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("Upload failed:", response.status, text);
        setMessageType("error");
        setMessage(
          "Upload failed (Status " + response.status + "). " + (text ? text.slice(0, 200) : "")
        );
        return;
      }

      setMessageType("success");
      setMessage("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Unable to connect to backend. " + (err?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!selectedDate || !selectedExam) {
      setMessageType("error");
      setMessage("Please select date and exam before uploading.");
      return;
    }
    setMessage("");
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    performUpload(picked);
  };

  const messageColor =
    messageType === "success"
      ? "text-green-600"
      : messageType === "error"
      ? "text-red-500"
      : "text-gray-500";

  const examDropdownPlaceholder = !selectedDate
    ? "Select date first"
    : examsLoading
    ? "Loading exams..."
    : exams.length === 0
    ? "No exams on this date"
    : "Select Exam";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="px-6 py-6">
            <span className="text-2xl font-bold text-gray-900">OSM Portal</span>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-100 text-gray-900 text-[15px] font-semibold cursor-pointer">
              <FaHome className="text-[17px]" />
              <span>Home</span>
            </a>
            <a
              onClick={() => navigate("/rejected-queue")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
            >
              <FaExclamationCircle className="text-[17px]" />
              <span>Rejected Queue</span>
            </a>
            <a
              onClick={() => navigate("/uploader/uploaded-copies")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
            >
              <FaHistory className="text-[17px]" />
              <span>History</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer">
              <FaQuestionCircle className="text-[17px]" />
              <span>Support</span>
            </a>
          </nav>
        </div>

        <div className="px-3 pb-6">
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 text-[15px] font-medium cursor-pointer"
          >
            <FaSignOutAlt className="text-[17px]" />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-5">
          <h2 className="text-2xl font-bold text-gray-800">On-Screen Marking System</h2>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Uploader</p>
              <p className="text-xs text-gray-500">ID: 992831</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              UP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-4xl mx-auto mt-4 text-center">
            <h1 className="text-4xl font-extrabold text-blue-700">Uploader</h1>
            <p className="text-[15px] text-gray-500 mt-2 mb-8">
              Manage scanned answer sheets and upload them securely.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <button
                onClick={() => navigate("/rejected-queue")}
                className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg text-[15px]"
              >
                <FaExclamationCircle />
                <span>Rejected Queue</span>
              </button>

              <button
                onClick={() => navigate("/uploader/preview")}
                className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg text-[15px]"
              >
                <FaEye />
                <span>View Scanned Copy</span>
              </button>

              <button
                onClick={() => navigate("/uploader/uploaded-copies")}
                className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg text-[15px]"
              >
                <FaFileAlt />
                <span>View Uploaded Copies</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 text-left mb-8">
              <div>
                <label className="text-[15px] font-medium text-gray-700 block mb-2">
                  Select Date
                </label>
                <div className="relative flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2.5">
                  <FaCalendarAlt className="text-blue-700 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-[15px] text-gray-500 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-[15px] font-medium text-gray-700 block mb-2">
                  Select Exam
                </label>
                <div className="relative flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2.5">
                  <FaGraduationCap className="text-blue-700 shrink-0" />
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    disabled={!selectedDate || examsLoading || exams.length === 0}
                    className="w-full appearance-none text-[15px] text-gray-500 outline-none bg-transparent pr-6 disabled:cursor-not-allowed"
                  >
                    <option value="">{examDropdownPlaceholder}</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.name}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3.5 text-gray-400 text-xs pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hidden file input - triggered by Upload button, never shown */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileSelected}
              className="hidden"
            />

            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-semibold py-3.5 px-10 rounded-lg text-[15px] mx-auto"
            >
              <FaCloudUploadAlt />
              <span>{uploadButtonLabel}</span>
            </button>

            {message ? (
              <p className={"text-sm mt-4 " + messageColor}>{message}</p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploaderDashboardPage;
