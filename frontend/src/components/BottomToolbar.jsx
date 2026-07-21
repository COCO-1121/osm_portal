import "./Evaluation.css";
import { useNavigate } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sun,
  Contrast,
  Check,
  X,
  Circle,
  Pencil,
  Eraser,
  Undo2,
  MessageSquare,
  Save,
  Send,
  FileText,
  BookOpen,
  AlertTriangle,
  Eye,
} from "lucide-react";

function BottomToolbar() {
  const navigate = useNavigate();
  return (
    <footer className="bottom-toolbar">

      {/* Left Information */}

      <div className="toolbar-left">

        <div className="status-box">
          <span>Answer Book</span>
          <strong>1 / 5</strong>
        </div>

        <div className="status-box">
          <span>Page</span>
          <strong>5 / 32</strong>
        </div>

        <div className="status-box">
          <span>Time</span>
          <strong>00:02:42</strong>
        </div>

      </div>

      {/* Image Controls */}

      <div className="toolbar-group">

        <button title="Brightness +">
          <Sun size={16}/>
        </button>

        <button>+</button>

        <button>-</button>

        <button>R</button>

      </div>

      <div className="toolbar-group">

        <button title="Contrast">
          <Contrast size={16}/>
        </button>

        <button>+</button>

        <button>-</button>

        <button>R</button>

      </div>

      {/* Zoom */}

      <div className="toolbar-group">

        <button title="Zoom In">
          <ZoomIn size={16}/>
        </button>

        <button title="Zoom Out">
          <ZoomOut size={16}/>
        </button>

        <button title="Rotate Left">
          <RotateCcw size={16}/>
        </button>

        <button title="Rotate Right">
          <RotateCw size={16}/>
        </button>

      </div>

      {/* Annotation */}

      <div className="toolbar-group">

        <button title="Tick">
          <Check size={16}/>
        </button>

        <button title="Cross">
          <X size={16}/>
        </button>

        <button title="Circle">
          <Circle size={16}/>
        </button>

        <button title="Pen">
          <Pencil size={16}/>
        </button>

        <button title="Eraser">
          <Eraser size={16}/>
        </button>

        <button title="Undo">
          <Undo2 size={16}/>
        </button>

        <button title="Comment">
          <MessageSquare size={16}/>
        </button>

        <button title="View">
          <Eye size={16}/>
        </button>

      </div>

      {/* Actions */}

      <div className="toolbar-actions">

        <button className="solution-btn">

          <BookOpen size={16}/>

          Solution

        </button>

        <button className="qp-btn">

          <FileText size={16}/>

          Q.P.

        </button>

        <button className="save-btn">

          <Save size={16}/>

          Save

        </button>

        <button className="ufm-btn">

          <AlertTriangle size={16}/>

          UFM

        </button>

        <button className="reject-btn">

          <X size={16}/>

          Reject

        </button>

        <button className="submit-btn" onClick={() => navigate('/day-report')}>

          <Send size={16}/>

          Submit

        </button>

      </div>

    </footer>
  );
}

export default BottomToolbar;