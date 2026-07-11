import "./Evaluation.css";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function ImageViewer() {
  return (
    <div className="image-viewer">

      {/* Viewer Header */}

      <div className="viewer-header">

        <h3>Answer Sheet Viewer</h3>

        <div className="viewer-actions">

          <button><ZoomOut size={18} /></button>

          <button><ZoomIn size={18} /></button>

          <button><RotateCw size={18} /></button>

          <button><Maximize2 size={18} /></button>

        </div>

      </div>

      {/* Answer Sheet */}

      <div className="viewer-body">

        <div className="paper">

          <div className="paper-placeholder">

            <h2>Answer Sheet</h2>

            <p>
              Scanned answer sheet will appear here.
            </p>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="viewer-footer">

        <button className="page-btn">

          <ChevronLeft size={18} />

          Previous

        </button>

        <span>

          Page 1 of 24

        </span>

        <button className="page-btn">

          Next

          <ChevronRight size={18} />

        </button>

      </div>

    </div>
  );
}

export default ImageViewer;