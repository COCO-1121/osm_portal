import "./Evaluation.css";
import { useNavigate } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sun,
  Contrast,
  CheckCircle,
  XCircle,
  X,
  Eye,
  FileX,
  ClipboardList,
  HelpCircle,
  Trash2,
  MessageCircle,
  Slash,
  Save,
  Send,
  FileText,
  BookOpen,
  AlertTriangle,
  CircleDot
} from "lucide-react";

function BottomToolbar({ currentPage, totalPages, onSave, onSubmit, onReject, onUFM, activeTool, setActiveTool }) {
  const navigate = useNavigate();

  const handleToolSelect = (toolName) => {
    setActiveTool(toolName);
    if (toolName === 'comment') {
      const c = window.prompt("Enter Script-wise comment:");
      if (c) alert("Comment saved: " + c);
      setActiveTool('M'); // revert to default
    }
  };

  const getToolStyle = (toolName) => {
    return activeTool === toolName ? { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' } : {};
  };

  return (
    <footer className="bottom-toolbar">

      {/* Left Information */}
      <div className="toolbar-left">
        <div className="status-box" title="Current student answer sheet number">
          <span>Answer Book</span>
          <strong>1 / 1</strong>
        </div>

        <div className="status-box" title="Current page number">
          <span>Page</span>
          <strong>{currentPage} / {totalPages}</strong>
        </div>

        <div className="status-box" title="Time elapsed in evaluation">
          <span>Time</span>
          <strong>00:02:42</strong>
        </div>
      </div>

      {/* Annotation Controls */}
      <div className="toolbar-group">
        <button style={getToolStyle('M')} title="Mark Annotation On/Off Button" onClick={() => handleToolSelect("M")}>
          <CircleDot size={16} color="#eab308" />
        </button>
        <button style={getToolStyle('tick')} title="Tick mark Annotation" onClick={() => handleToolSelect("tick")}>
          <CheckCircle size={16} color="#16a34a" />
        </button>
        <button style={getToolStyle('cross')} title="Wrong mark Annotation" onClick={() => handleToolSelect("cross")}>
          <XCircle size={16} color="#dc2626" />
        </button>
        <button style={getToolStyle('line')} title="Cross line Annotation" onClick={() => handleToolSelect("line")}>
          <Slash size={16} color="#dc2626" />
        </button>
        <button style={getToolStyle('eye')} title="Viewed Page Annotation" onClick={() => handleToolSelect("eye")}>
          <Eye size={16} color="#9333ea" />
        </button>
        <button style={getToolStyle('blank')} title="Blank Page Annotation" onClick={() => handleToolSelect("blank")}>
          <FileX size={16} color="#dc2626" />
        </button>
        <button style={getToolStyle('note')} title="Notes Annotation" onClick={() => handleToolSelect("note")}>
          <ClipboardList size={16} color="#9a3412" />
        </button>
        <button style={{ ...getToolStyle('repeat'), fontSize: '10px', fontWeight: 'bold', color: '#1d4ed8' }} title="Repeat Answer annotation" onClick={() => handleToolSelect("repeat")}>
          R Ans
        </button>
        <button style={getToolStyle('wrong_q')} title="Wrong Question annotation" onClick={() => handleToolSelect("wrong_q")}>
          <HelpCircle size={16} color="#dc2626" />
        </button>
        <button style={getToolStyle('delete')} title="Delete Annotation" onClick={() => handleToolSelect("delete")}>
          <Trash2 size={16} color="#dc2626" />
        </button>
        <button style={getToolStyle('comment')} title="Script-wise Comments" onClick={() => handleToolSelect("comment")}>
          <MessageCircle size={16} color="#dc2626" />
        </button>
      </div>



      {/* Actions */}
      <div className="toolbar-actions">
        <button className="solution-btn" title="View Model Solutions & Answer Key Keys" onClick={() => handleAction("View Model Solutions")}>
          <BookOpen size={16} />
          Solution
        </button>

        <button className="qp-btn" title="View Exam Question Paper File" onClick={() => handleAction("View Question Paper")}>
          <FileText size={16} />
          Q.P.
        </button>

        <button className="save-btn" title="Save Evaluation Draft Progress" onClick={() => {
          alert("Draft saved successfully!");
          if (onSave) onSave();
        }}>
          <Save size={16} />
          Save
        </button>

        <button className="ufm-btn" title="Report Unfair Means / Cheating Malpractice case" onClick={() => {
          if (onUFM) {
            onUFM();
          } else if (confirm("Are you sure you want to mark this script under UFM (Unfair Means)?")) {
            alert("Script marked under UFM successfully.");
          }
        }}>
          <AlertTriangle size={16} />
          UFM
        </button>

        <button className="reject-btn" title="Reject Answer Sheet scan quality" onClick={() => {
          if (onReject) {
            onReject();
          } else if (confirm("Are you sure you want to Reject this answer sheet for re-scanning?")) {
            alert("Script rejected for re-scanning.");
          }
        }}>
          <X size={16} />
          Reject
        </button>

        <button className="submit-btn" title="Submit Final Marks Sheet to database" onClick={() => {
          if (onSubmit) {
            onSubmit();
          } else if (confirm("Are you sure you want to Submit these marks?")) {
            navigate('/day-report');
          }
        }}>
          <Send size={16} />
          Submit
        </button>
      </div>

    </footer>
  );
}

export default BottomToolbar;