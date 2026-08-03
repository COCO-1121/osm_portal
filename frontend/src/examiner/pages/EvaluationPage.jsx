import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EvaluationHeader from "../components/EvaluationHeader";
import QuestionPanel from "../components/QuestionPanel";
import ImageViewer from "../components/ImageViewer";
import BottomToolbar from "../components/BottomToolbar";
import "../components/Evaluation.css";

function EvaluationPage() {
  const params = useParams();
  const subjectId = params.subjectId || params.scriptId || "0302";
  const navigate = useNavigate();

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

  const [questions, setQuestions] = useState([
    { id: "1", name: "Write short note on Band Theory", max: 5, obtained: "", steps: "0 Marks", pageRange: [1, 2] },
    { id: "2", name: "Differentiate Conductor, Insulator, Semiconductor", max: 5, obtained: "", steps: "0 Marks", pageRange: [2, 3] },
    { id: "3", name: "Derive relation between K and Chi", max: 10, obtained: "", steps: "0 Marks", pageRange: [4, 5] },
  ]);

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
      if (localStorage.getItem(`evaluated_${subjectId}`)) {
        navigate('/examiner/assessment', { replace: true });
        return;
      }
      
      const savedData = localStorage.getItem(`evaluation_data_${subjectId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.stamps) setStamps(parsed.stamps);
      }
    }
  }, [subjectId, navigate]);

  const updateStats = (type) => {
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const statsKey = 'daily_stats';
    let dailyStats = JSON.parse(localStorage.getItem(statsKey));
    
    // Initialize if empty
    if (!dailyStats) {
      dailyStats = {};
    }

    const key = `${today}_${subjectId}`;
    if (!dailyStats[key]) {
      // Determine subject name for new entries
      const subjectName = subjectId === "0302" ? "ECONOMICS - Set 2" : "ACCOUNTANCY - Set 1";
      dailyStats[key] = { subject: subjectName, completed: 0, rejected: 0, ufm: 0 };
    }

    if (type === 'completed') dailyStats[key].completed += 1;
    if (type === 'rejected') dailyStats[key].rejected += 1;
    if (type === 'ufm') dailyStats[key].ufm += 1;

    localStorage.setItem(statsKey, JSON.stringify(dailyStats));
    localStorage.setItem(`evaluated_${subjectId}`, 'true');
    
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
      const unmarkedIds = unmarked.map(q => q.id).join(', ');
      const makeNA = window.confirm(`Step Marks Pending : Q.No. ${unmarkedIds}\n\nAre you sure you want to mark them as Not Attempted (NA)?`);
      
      if (makeNA) {
        currentQuestions = currentQuestions.map(q => q.obtained === "" ? { ...q, obtained: "NA", steps: "NA" } : q);
        setQuestions(currentQuestions);
      } else {
        return; // Prevent submission
      }
    }

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
      updateStats('completed');
      navigate('/examiner/day-wise-report', { replace: true });
    }
  };

  const [modalState, setModalState] = useState({ type: null, visible: false });
  const [selectedReason, setSelectedReason] = useState("");

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
  };

  const handleUFM = () => {
    setModalState({ type: 'UFM', visible: true });
    setSelectedReason("");
  };

  const handleModalSubmit = () => {
    if (!selectedReason) {
      alert("Please select a reason.");
      return;
    }
    
    if (modalState.type === 'REJECT') {
      updateStats('rejected');
    } else {
      updateStats('ufm');
    }
    
    setModalState({ type: null, visible: false });
    navigate('/examiner/day-wise-report', { replace: true });
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
      <EvaluationHeader />

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
          totalPages={5}
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
        />
      </div>

      <BottomToolbar 
        currentPage={currentPage} 
        totalPages={5} 
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
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '13px' }}>
                Reason for {modalState.type === 'UFM' ? 'UFM' : 'Reject'}:
              </label>
              <select 
                value={selectedReason} 
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
              >
                <option value="" disabled></option>
                {(modalState.type === 'UFM' ? ufmReasons : rejectReasons).map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setModalState({ type: null, visible: false })}
                style={{ padding: '6px 16px', border: '1px solid #ccc', backgroundColor: '#64748b', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button 
                onClick={handleModalSubmit}
                style={{ padding: '6px 16px', border: 'none', backgroundColor: '#dc2626', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationPage;