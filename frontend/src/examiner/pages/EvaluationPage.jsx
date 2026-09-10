import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import EvaluationHeader from "../components/EvaluationHeader";
import QuestionPanel from "../components/QuestionPanel";
import ImageViewer from "../components/ImageViewer";
import BottomToolbar from "../components/BottomToolbar";
import apiClient from "../../shared/services/apiClient";
import "../components/Evaluation.css";

function EvaluationPage() {
  const params = useParams();
  const location = useLocation();
  const scriptInfo = location.state?.script;
  const subjectId = params.subjectId || params.scriptId || "0302";
  const navigate = useNavigate();

  const [documentUrl, setDocumentUrl] = useState(null);
  const [documentName, setDocumentName] = useState(scriptInfo?.subject || null);
  const [loadedBarcode, setLoadedBarcode] = useState(
    scriptInfo?.barcode || (subjectId && (subjectId.startsWith("OSM-") || subjectId.startsWith("BC")) ? subjectId : null)
  );
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [totalPages, setTotalPages] = useState(5);

  useEffect(() => {
    // Prevent back navigation using browser buttons
    const handlePopState = (event) => {
      window.history.pushState(null, null, window.location.href);
    };
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Fetch real document copy if available
  useEffect(() => {
    let createdUrl = null;
    const fetchDocument = async () => {
      if (!subjectId) return;
      setLoadingDocument(true);
      try {
        const targetBarcode = scriptInfo?.barcode || subjectId;
        const targetDocId = scriptInfo?.docId;

        let res = null;
        try {
          res = await apiClient.get(`/scanned-documents/by-barcode/${encodeURIComponent(targetBarcode)}/preview?cb=${Date.now()}`, {
            responseType: "blob"
          });
        } catch (err) {
          if (targetDocId) {
            res = await apiClient.get(`/scanned-documents/${targetDocId}/preview?cb=${Date.now()}`, {
              responseType: "blob"
            });
          } else if (!isNaN(targetBarcode)) {
            res = await apiClient.get(`/scanned-documents/${targetBarcode}/preview?cb=${Date.now()}`, {
              responseType: "blob"
            });
          } else {
            // Fallback: attempt latest preview if barcode was generic like '048'
            try {
              res = await apiClient.get(`/scanned-documents/preview-latest`, {
                responseType: "blob"
              });
            } catch (e) {}
          }
        }

        if (res && res.data) {
          createdUrl = URL.createObjectURL(res.data);
          setDocumentUrl(createdUrl);

          const pagesHeader = res.headers["x-total-pages"] || res.headers["X-Total-Pages"];
          if (pagesHeader) {
            const count = parseInt(pagesHeader, 10);
            if (!isNaN(count) && count > 0) {
              setTotalPages(count);
            }
          }

          const docBarcode = res.headers["x-document-barcode"] || res.headers["X-Document-Barcode"];
          if (docBarcode) {
            setLoadedBarcode(docBarcode);
          }
        }

        // If barcode not loaded yet, resolve real barcode via doc lookup or assigned copies
        if (!loadedBarcode) {
          if (!isNaN(subjectId) || targetDocId) {
            try {
              const docIdToQuery = targetDocId || subjectId;
              const docRes = await apiClient.get(`/scanned-documents/${docIdToQuery}`);
              if (docRes.data && docRes.data.barcode) {
                setLoadedBarcode(docRes.data.barcode);
              }
            } catch (e) {}
          }

          if (!loadedBarcode) {
            try {
              const copiesRes = await apiClient.get(`/examiner/dashboard/assigned-copies`);
              if (copiesRes.data && copiesRes.data.copies && copiesRes.data.copies.length > 0) {
                const matched = copiesRes.data.copies.find(c => c.barcode === subjectId || String(c.id) === String(subjectId)) || copiesRes.data.copies[0];
                if (matched && matched.barcode) {
                  setLoadedBarcode(matched.barcode);
                }
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Could not fetch uploaded document for script", subjectId, "- using default sheet viewer.");
      } finally {
        setLoadingDocument(false);
      }
    };

    fetchDocument();

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [subjectId, scriptInfo]);

  const generateDefaultQuestions = (totalMarks = 100) => {
    const count = totalMarks === 100 ? 10 : (totalMarks === 70 ? 7 : 5);
    const marksPerQ = Math.round(totalMarks / count);
    const qList = [];
    for (let i = 1; i <= count; i++) {
      qList.push({
        id: `${i}`,
        name: `Question ${i}`,
        max: marksPerQ,
        obtained: "",
        steps: "0 Marks",
        pageRange: [i, i + 1]
      });
    }
    return qList;
  };

  const [questions, setQuestions] = useState(() => generateDefaultQuestions(scriptInfo?.maxMarks || 100));

  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isMarkingActive, setIsMarkingActive] = useState(false);
  const [activeTool, setActiveTool] = useState('M');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogState, setDialogState] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Floating stamps state
  const [stamps, setStamps] = useState([]);

  useEffect(() => {
    if (subjectId) {
      const savedData = localStorage.getItem(`evaluation_data_${subjectId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.questions) setQuestions(parsed.questions);
          if (parsed.stamps) setStamps(parsed.stamps);
        } catch (e) {}
      }
    }
  }, [subjectId]);

  const updateStats = async (type, marks, maxMarks) => {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = 'daily_evaluation_stats';
    let dailyStats = JSON.parse(localStorage.getItem(statsKey)) || {};

    const key = `${today}_048`;

    if (!dailyStats[key]) {
      const subjectName = scriptInfo?.subject || documentName || "PHYSICS (048)";
      dailyStats[key] = { subject: subjectName, completed: 0, rejected: 0, ufm: 0 };
    }

    if (type === 'completed') {
      dailyStats[key].completed += 1;
      const prevTotal = parseInt(localStorage.getItem('total_eval_completed') || '0', 10);
      const prevToday = parseInt(localStorage.getItem('today_eval_completed') || '0', 10);
      localStorage.setItem('total_eval_completed', (prevTotal + 1).toString());
      localStorage.setItem('today_eval_completed', (prevToday + 1).toString());
    } else if (type === 'rejected') {
      dailyStats[key].rejected += 1;
    } else if (type === 'ufm') {
      dailyStats[key].ufm += 1;
    }

    localStorage.setItem(statsKey, JSON.stringify(dailyStats));
    localStorage.setItem(`evaluated_${subjectId}`, 'true');

    // Patch backend document status if available
    try {
      const targetDocId = scriptInfo?.docId || (!isNaN(subjectId) ? subjectId : null);
      const newStatus = type === 'completed' ? 'Completed' : (type === 'rejected' ? 'Rejected' : 'UFM');
      if (targetDocId) {
        let url = `/scanned-documents/${targetDocId}/status?status=${newStatus}`;
        if (type === 'completed' && marks !== undefined && maxMarks !== undefined) {
          url += `&marks=${marks}&max_marks=${maxMarks}`;
        }
        await apiClient.patch(url).catch(() => {});
      }
    } catch (e) {
      console.warn("Could not patch document status to backend:", e);
    }
    
    // Clear saved draft if submitted
    if (type === 'completed') {
      localStorage.removeItem(`saved_evaluation_${subjectId}`);
    }
  };

  const handleSaveEvaluation = () => {
    const dataToSave = { questions, stamps };
    localStorage.setItem(`evaluation_data_${subjectId}`, JSON.stringify(dataToSave));
    localStorage.setItem(`saved_evaluation_${subjectId}`, 'true');
    navigate('/examiner/assessment', { replace: true });
  };

  const handleSubmit = () => {
    let currentQuestions = [...questions];
    const unmarked = currentQuestions.filter(q => q.obtained === "");
    
    if (unmarked.length > 0) {
      const confirmZero = window.confirm(
        `There are ${unmarked.length} unmarked questions. Do you want to allocate 0 marks to them and complete evaluation?`
      );
      if (confirmZero) {
        currentQuestions = currentQuestions.map(q => {
          if (q.obtained === "") {
            return { ...q, obtained: "0", steps: "0 Marks" };
          }
          return q;
        });
        setQuestions(currentQuestions);
        handleCompleteEvaluation(currentQuestions);
      }
    } else {
      handleCompleteEvaluation(currentQuestions);
    }
  };

  const handleCompleteEvaluation = (currentQuestions = questions) => {
    let totalScore = 0;
    let maxTotalScore = 0;
    currentQuestions.forEach(q => {
      maxTotalScore += q.max;
      if (q.obtained !== "NA" && q.obtained !== "") {
        totalScore += parseFloat(q.obtained) || 0;
      }
    });

    const notes = window.prompt(`Enter Notes :\nScore ${totalScore} out of ${maxTotalScore}`, "");
    
    if (notes !== null) {
      updateStats('completed', totalScore, maxTotalScore);
      navigate('/examiner/day-wise-report', { replace: true });
    }
  };

  const [modalState, setModalState] = useState({ type: null, visible: false });
  const [selectedReason, setSelectedReason] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [submittingModal, setSubmittingModal] = useState(false);
  const [scriptUfmInfo, setScriptUfmInfo] = useState(null);

  // Check if current script has an active UFM case or review status
  useEffect(() => {
    const targetBarcode = loadedBarcode || scriptInfo?.barcode || subjectId;
    if (!targetBarcode) return;

    const checkUfmStatus = async () => {
      try {
        const res = await apiClient.get(`/examiner/ufm-status/${encodeURIComponent(targetBarcode)}`);
        if (res.data && res.data.has_ufm) {
          setScriptUfmInfo(res.data);
        }
      } catch (e) {
        // Fallback: check scriptInfo status
        if (scriptInfo && scriptInfo.status && scriptInfo.status.toUpperCase().includes("UFM")) {
          setScriptUfmInfo({
            has_ufm: true,
            status: scriptInfo.status,
            reason: "Suspected Unfair Means"
          });
        }
      }
    };

    checkUfmStatus();
  }, [loadedBarcode, scriptInfo, subjectId]);

  const ufmReasons = [
    "Writing Roll No./Reg. No./Religious Symbol/Prayer/Appeal",
    "Seeking Sympathy Or Other Distinguishing Marks",
    "Writing Any Extraneous Irrelevant Unwanted Not/Remarks/Mobile No.",
    "Writing In A Colour Other Than Blue Or Black",
    "Writing In Different Handwritings",
    "Tearing Or Carrying Of Page",
    "Abusive Language Or Remarks",
    "Put Signatures",
    "Others"
  ];

  const rejectReasons = [
    "Improper Scanning",
    "Answer Book of different Subject",
    "Medium of Answer Book is different",
    "Missing pages",
    "Same page Scan twice",
    "Others"
  ];

  const handleReject = () => {
    setModalState({ type: 'REJECT', visible: true });
    setSelectedReason("");
    setModalRemarks("");
  };

  const handleUFM = () => {
    setModalState({ type: 'UFM', visible: true });
    setSelectedReason("");
    setModalRemarks("");
  };

  const handleModalSubmit = async () => {
    if (!selectedReason) {
      alert("Please select a reason.");
      return;
    }
    
    const targetBarcode = loadedBarcode || scriptInfo?.barcode || subjectId;
    setSubmittingModal(true);

    if (modalState.type === 'REJECT') {
      try {
        await apiClient.post("/examiner/reject-script", {
          barcode: targetBarcode,
          reason: selectedReason,
          examiner_remarks: modalRemarks || `Rejected by examiner: ${selectedReason}`,
          subject: scriptInfo?.subject || documentName || "PHYSICS (048)"
        });
        alert(`Script ${targetBarcode} rejected and sent to assigned Admin for verification.`);
        updateStats('rejected');
        setModalState({ type: null, visible: false });
        navigate('/examiner/day-wise-report', { replace: true });
      } catch (err) {
        console.error("Failed to post script rejection:", err);
        alert(`Failed to reject script: ${err?.response?.data?.detail || err.message}`);
      } finally {
        setSubmittingModal(false);
      }
    } else if (modalState.type === 'UFM') {
      try {
        await apiClient.post("/examiner/report-ufm", {
          barcode: targetBarcode,
          reason: selectedReason,
          examiner_remarks: modalRemarks || `Reported UFM by examiner: ${selectedReason}`,
          subject: scriptInfo?.subject || documentName || "PHYSICS (048)"
        });
        alert(`Script ${targetBarcode} marked under UFM and sent to Admin for review.`);
        updateStats('ufm');
        setModalState({ type: null, visible: false });
        navigate('/examiner/day-wise-report', { replace: true });
      } catch (err) {
        console.error("Failed to post UFM report:", err);
        alert(`Failed to report UFM: ${err?.response?.data?.detail || err.message}`);
      } finally {
        setSubmittingModal(false);
      }
    }
  };

  const handleQuestionSelect = (id, event) => {
    setActiveQuestionId(id);
    setIsMarkingActive(true); // Enable marking on screen
    
    const q = questions.find((item) => item.id === id);
    if (q && q.pageRange) {
      setCurrentPage(q.pageRange[0]);
    }
    
    setDialogState({
      visible: false,
      x: 350,
      y: 200,
    });
  };

  const handleMarksChange = (id, score) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return { ...q, obtained: score };
        }
        return q;
      })
    );
  };

  // Add floating stamp
  const handleAddStamp = (qId, markVal) => {
    const mark = parseFloat(markVal);
    const q = questions.find(item => item.id === qId);
    if (!q) return;

    const qStamps = stamps.filter(s => s.qId === qId);
    const currentTotal = qStamps.reduce((sum, s) => sum + s.mark, 0);

    if (currentTotal + mark > q.max) {
      alert(`Maximum marks of ${q.max} will be exceeded! Remaining marks allowed: ${q.max - currentTotal}`);
      return;
    }
    
    setStamps((prev) => {
      const newStamp = {
        id: `${qId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'mark',
        qId,
        mark,
        x: dialogState.x,
        y: dialogState.y,
        page: currentPage
      };
      
      const newStamps = [...prev, newStamp];

      // Update obtained mark
      setTimeout(() => {
        const updatedQStamps = newStamps.filter(s => s.qId === qId);
        const totalScore = updatedQStamps.reduce((sum, s) => sum + s.mark, 0);
        const finalScore = Math.min(totalScore, q.max);

        setQuestions((prevQ) =>
          prevQ.map((item) => {
            if (item.id === qId) {
              return {
                ...item,
                obtained: totalScore === 0 ? "" : finalScore.toString(),
                steps: `${updatedQStamps.length} Marks`
              };
            }
            return item;
          })
        );
      }, 0);

      return newStamps;
    });

    setDialogState(prev => ({ ...prev, visible: false }));
  };

  // Delete specific stamp
  const handleDeleteStamp = (stampId) => {
    setStamps((prev) => {
      const stampToDelete = prev.find(s => s.id === stampId);
      if (!stampToDelete) return prev;

      const qId = stampToDelete.qId;
      const newStamps = prev.filter(s => s.id !== stampId);

      // Recalculate obtained marks for this question
      setTimeout(() => {
        const updatedQStamps = newStamps.filter(s => s.qId === qId);
        const totalScore = updatedQStamps.reduce((sum, s) => sum + s.mark, 0);
        
        setQuestions((prevQ) =>
          prevQ.map((item) => {
            if (item.id === qId) {
              return {
                ...item,
                obtained: updatedQStamps.length === 0 ? "" : totalScore.toString(),
                steps: `${updatedQStamps.length} Marks`
              };
            }
            return item;
          })
        );
      }, 0);

      return newStamps;
    });
  };

  const handleImageClick = (e) => {
    if (activeTool === 'comment' || activeTool === 'delete') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'M') {
      if (!isMarkingActive) return;

      const q = questions.find(item => item.id === activeQuestionId);
      if (!q) return;

      // Check if maximum marks are already reached
      const qStamps = stamps.filter(s => s.type === 'mark' && s.qId === activeQuestionId);
      const currentTotal = qStamps.reduce((sum, s) => sum + s.mark, 0);

      if (currentTotal >= q.max) {
        alert(`Maximum marks are allotted for Question ${q.id}!`);
        return;
      }

      setDialogState({
        visible: true,
        x: x + 15,
        y: y - 10,
      });
    } else if (activeTool === 'note') {
      const noteText = window.prompt("Enter your note:");
      if (noteText) {
        setStamps(prev => [...prev, {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'note',
          text: noteText,
          x, y, page: currentPage,
          qId: activeQuestionId
        }]);
      }
    } else {
      setStamps(prev => [...prev, {
        id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: activeTool,
        x, y, page: currentPage,
        qId: activeQuestionId
      }]);
    }
  };

  const handleClearStamps = (qId) => {
    setStamps(prev => prev.filter(s => s.qId !== qId));
    setQuestions(prevQ => prevQ.map(q => {
      if (q.id === qId) {
        return { ...q, obtained: "", steps: "0 Marks" };
      }
      return q;
    }));
  };

  return (
    <div className="evaluation-page">
      <EvaluationHeader
        subjectName={scriptInfo?.subject || documentName || "PHYSICS (048)"}
        subjectCode={scriptInfo?.barcode || subjectId}
        scriptId={scriptInfo?.barcode || scriptInfo?.id || subjectId}
      />

      {/* UFM Notice Banner */}
      {scriptUfmInfo && scriptUfmInfo.has_ufm && (
        <div style={{
          backgroundColor: scriptUfmInfo.status === 'UFM_CONFIRMED' ? '#fee2e2' : (scriptUfmInfo.status === 'RETURNED_TO_EXAMINER' ? '#eff6ff' : '#fef3c7'),
          color: scriptUfmInfo.status === 'UFM_CONFIRMED' ? '#991b1b' : (scriptUfmInfo.status === 'RETURNED_TO_EXAMINER' ? '#1e40af' : '#92400e'),
          borderBottom: `1px solid ${scriptUfmInfo.status === 'UFM_CONFIRMED' ? '#fca5a5' : (scriptUfmInfo.status === 'RETURNED_TO_EXAMINER' ? '#bfdbfe' : '#fde68a')}`,
          padding: '10px 24px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div>
            {scriptUfmInfo.status === 'PENDING_ADMIN_REVIEW' && (
              <span>⚠️ This script was reported for UFM ({scriptUfmInfo.reason}) and is currently under Admin review. Evaluation is locked.</span>
            )}
            {scriptUfmInfo.status === 'UFM_CONFIRMED' && (
              <span>🚫 UFM Confirmed by Admin ({scriptUfmInfo.reason}). Paper cancelled, marks = 0. Evaluation locked.</span>
            )}
            {scriptUfmInfo.status === 'RETURNED_TO_EXAMINER' && (
              <span>ℹ️ Returned by Admin: {scriptUfmInfo.admin_remarks || 'UFM cleared. Continue evaluation.'}</span>
            )}
          </div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.08)', padding: '3px 8px', borderRadius: '4px' }}>
            Status: {scriptUfmInfo.status}
          </span>
        </div>
      )}

      <div className="evaluation-body">
        <QuestionPanel
          questions={questions}
          activeQuestionId={activeQuestionId}
          onQuestionSelect={handleQuestionSelect}
          onMarksChange={handleMarksChange}
        />

        <ImageViewer
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onImageClick={handleImageClick}
          dialogState={dialogState}
          setDialogState={setDialogState}
          activeQuestion={questions.find(q => q.id === activeQuestionId)}
          stamps={stamps}
          onAddStamp={handleAddStamp}
          onDeleteStamp={handleDeleteStamp}
          onClearStamps={handleClearStamps}
          isMarkingActive={isMarkingActive}
          activeTool={activeTool}
          documentUrl={documentUrl}
          documentName={documentName}
          loadingDocument={loadingDocument}
          scriptBarcode={scriptInfo?.barcode || subjectId}
          docId={scriptInfo?.docId}
        />
      </div>

      <BottomToolbar 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onSave={handleSaveEvaluation}
        onSubmit={handleSubmit}
        onReject={handleReject}
        onUFM={handleUFM}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      {/* UFM / Reject Modal */}
      {modalState.visible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '4px',
            width: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#d32f2f' }}>
                Reason for {modalState.type === 'UFM' ? 'UFM' : 'Reject'} :
              </h3>
              <button 
                onClick={() => setModalState({ type: null, visible: false })}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' }}
              >×</button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '13px' }}>
                Reason for {modalState.type === 'UFM' ? 'UFM' : 'Reject'}:
              </label>
              <select 
                value={selectedReason} 
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
              >
                <option value="" disabled>-- Select Reason --</option>
                {(modalState.type === 'UFM' ? ufmReasons : rejectReasons).map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '13px' }}>
                Additional Remarks / Details (Optional):
              </label>
              <textarea
                value={modalRemarks}
                onChange={(e) => setModalRemarks(e.target.value)}
                placeholder={modalState.type === 'UFM' ? "e.g. Roll number written on page 3, distinct ink used..." : "e.g. Page 2 is blurry or unreadable..."}
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setModalState({ type: null, visible: false })}
                style={{ padding: '6px 16px', border: '1px solid #ccc', backgroundColor: '#64748b', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                disabled={submittingModal}
              >
                Close
              </button>
              <button 
                onClick={handleModalSubmit}
                style={{ padding: '6px 16px', border: 'none', backgroundColor: '#dc2626', color: 'white', borderRadius: '4px', cursor: submittingModal ? 'not-allowed' : 'pointer', opacity: submittingModal ? 0.7 : 1 }}
                disabled={submittingModal}
              >
                {submittingModal ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationPage;