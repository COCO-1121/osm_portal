import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Evaluation.css";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  XCircle,
  Eye,
  FileX,
  ClipboardList,
  Slash,
  HelpCircle
} from "lucide-react";

function ImageViewer({
  currentPage,
  setCurrentPage,
  totalPages,
  onImageClick,
  dialogState,
  setDialogState,
  activeQuestion,
  stamps,
  onAddStamp,
  onDeleteStamp,
  onClearStamps,
  isMarkingActive,
  activeTool,
  documentUrl,
  documentName,
  loadingDocument,
  scriptBarcode,
  docId
}) {
  const { scriptId } = useParams();
  const [zoom, setZoom] = useState(0.85);
  const [rotation, setRotation] = useState(0);
  const [hoveredStampId, setHoveredStampId] = useState(null);

  const targetCode = scriptBarcode || scriptId;
  const pageImageUrl = targetCode
    ? `http://127.0.0.1:8000/api/v1/scanned-documents/by-barcode/${encodeURIComponent(targetCode)}/page/${currentPage}`
    : null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.4));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(0.85);
    setRotation(0);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getMarksOptions = (max) => {
    const options = [];
    for (let i = 0; i <= max; i += 0.5) {
      options.push(i);
    }
    return options;
  };

  const qStamps = activeQuestion ? stamps.filter((s) => s.qId === activeQuestion.id && s.type === 'mark') : [];
  const currentTotal = qStamps.reduce((sum, s) => sum + s.mark, 0);
  const remainingMarks = activeQuestion ? activeQuestion.max - currentTotal : 0;

  const rawOptions = activeQuestion ? getMarksOptions(activeQuestion.max) : [];
  const marksOptions = rawOptions.filter((val) => val <= remainingMarks);

  // Filter stamps on current page
  const pageStamps = stamps.filter((s) => s.page === currentPage);

  // Find unique questions stamped on current page
  const stampedQIdsOnPage = Array.from(new Set(pageStamps.filter(s => s.type === 'mark').map((s) => s.qId)));

  return (
    <div className="image-viewer" style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Viewer Header */}
      <div className="viewer-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>Answer Sheet Viewer</h3>
          {documentName && (
            <span
              style={{
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "2px 10px",
                fontSize: "11px",
                fontWeight: "600",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
              title={documentName}
            >
              📄 {documentName}
            </span>
          )}
          {isMarkingActive && (
            <span
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                border: "1px solid #c8e6c9",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: "bold"
              }}
            >
              ● Marking Active (Q{activeQuestion?.id})
            </span>
          )}
        </div>
        <div className="viewer-actions">
          <button title="Zoom Out" onClick={handleZoomOut}><ZoomOut size={18} /></button>
          <span style={{ fontSize: "11px", display: "flex", alignItems: "center", color: "#666", fontWeight: "600" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button title="Zoom In" onClick={handleZoomIn}><ZoomIn size={18} /></button>
          <button title="Rotate" onClick={handleRotate}><RotateCw size={18} /></button>
          <button title="Fit Page / Reset" onClick={handleReset}><Maximize2 size={18} /></button>
        </div>
      </div>

      {/* Answer Sheet Container */}
      <div
        className="viewer-body"
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "15px",
          backgroundColor: "#eef2f7"
        }}
      >
        <div
          className="paper"
          onClick={onImageClick}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
            position: "relative",
            cursor: activeTool === 'delete' ? 'no-drop' : (activeTool !== 'M' ? "crosshair" : (isMarkingActive ? (remainingMarks <= 0 ? "not-allowed" : "crosshair") : "default")),
            width: "100%",
            maxWidth: "750px",
            backgroundColor: "transparent",
            boxShadow: "none",
            borderRadius: "0",
            display: "block",
            minHeight: "unset",
            margin: "0 auto",
            overflow: "visible"
          }}
        >
          {loadingDocument ? (
            <div
              style={{
                width: "100%",
                height: "600px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.18)",
                color: "#1e40af",
                fontWeight: "600"
              }}
            >
              Loading answer sheet page {currentPage}...
            </div>
          ) : pageImageUrl ? (
            <img
              src={pageImageUrl}
              alt={`Answer sheet page ${currentPage}`}
              style={{
                width: "100%",
                height: "auto",
                boxShadow: "0 4px 15px rgba(0,0,0,0.18)",
                borderRadius: "8px",
                display: "block",
                userSelect: "none"
              }}
            />
          ) : documentUrl ? (
            <div style={{ position: "relative", width: "100%", height: "800px" }}>
              <iframe
                src={`${documentUrl}#page=${currentPage}`}
                title={documentName || `Answer Sheet Page ${currentPage}`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.18)",
                  backgroundColor: "#ffffff",
                  pointerEvents: activeTool && activeTool !== 'none' ? 'none' : 'auto'
                }}
              />
            </div>
          ) : (
            <img
              src={`/sheets/page${currentPage <= 5 ? currentPage : (currentPage % 5) + 1}.png`}
              alt={`Answer sheet page ${currentPage}`}
              style={{
                width: "100%",
                height: "auto",
                boxShadow: "0 4px 15px rgba(0,0,0,0.18)",
                borderRadius: "8px",
                display: "block",
                userSelect: "none"
              }}
            />
          )}


          {/* Render Page Stamps */}
          {pageStamps.map((stamp) => {
            const isHovered = hoveredStampId === stamp.id;

            let icon = null;
            let text = "";
            let color = "#2e7d32";
            let bg = "rgba(255, 255, 255, 0.95)";

            if (stamp.type === 'mark') {
              icon = <CheckCircle size={12} color="#2e7d32" style={{ fill: "#e8f5e9" }} />;
              text = stamp.mark;
            } else if (stamp.type === 'tick') {
              icon = <CheckCircle size={16} color="#16a34a" />;
            } else if (stamp.type === 'cross') {
              icon = <XCircle size={16} color="#dc2626" />;
              color = "#dc2626";
            } else if (stamp.type === 'line') {
              icon = <Slash size={16} color="#dc2626" />;
              color = "#dc2626";
            } else if (stamp.type === 'eye') {
              icon = <Eye size={16} color="#9333ea" />;
              color = "#9333ea";
            } else if (stamp.type === 'blank') {
              text = "Blank Page";
              color = "#dc2626";
            } else if (stamp.type === 'note') {
              icon = <ClipboardList size={14} color="#9a3412" />;
              text = stamp.text;
              color = "#9a3412";
            } else if (stamp.type === 'repeat') {
              text = "R Ans";
              color = "#1d4ed8";
            } else if (stamp.type === 'wrong_q') {
              icon = <HelpCircle size={16} color="#dc2626" />;
              color = "#dc2626";
            }

            return (
              <div
                key={stamp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStamp(stamp.id);
                }}
                onMouseEnter={() => setHoveredStampId(stamp.id)}
                onMouseLeave={() => setHoveredStampId(null)}
                style={{
                  position: "absolute",
                  left: `${stamp.x}px`,
                  top: `${stamp.y}px`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  backgroundColor: isHovered ? "#fee2e2" : bg,
                  border: isHovered ? "2px solid #ef4444" : `2px solid ${color}`,
                  borderRadius: "14px",
                  color: isHovered ? "#ef4444" : color,
                  fontWeight: "bold",
                  fontSize: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  zIndex: 10,
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
                title={stamp.type === 'note' ? stamp.text : "Click to remove this mark"}
              >
                {isHovered ? (
                  <>
                    <XCircle size={12} color="#ef4444" />
                    <span>Delete</span>
                  </>
                ) : (
                  <>
                    {icon}
                    {text && <span>{text}</span>}
                  </>
                )}
              </div>
            );
          })}

          {/* Render Red Summary Total Boxes (Positioned in the Top-Right of the actual page) */}
          {stampedQIdsOnPage.map((qId, idx) => {
            const qStamps = stamps.filter((s) => s.qId === qId);
            const totalScore = qStamps.reduce((sum, s) => sum + s.mark, 0);

            const formulaStr = qStamps
              .map((s) => s.mark)
              .join(" + ");

            const q = activeQuestion && activeQuestion.id === qId ? activeQuestion : null;
            const maxVal = q ? q.max : 10;
            const finalScore = Math.min(totalScore, maxVal);

            return (
              <div
                key={qId}
                style={{
                  position: "absolute",
                  right: "20px", // Put in top-right of page
                  top: `${20 + idx * 40}px`,
                  backgroundColor: "#ffffff",
                  border: "2px solid #d32f2f",
                  borderRadius: "3px",
                  padding: "4px 12px",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  fontSize: "13px",
                  fontFamily: "monospace, Courier New",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  userSelect: "none"
                }}
              >
                <span style={{ color: "#1565c0" }}>
                  Q{qId} : {formulaStr} = {finalScore.toString().replace(".0", "")}
                </span>
                <button
                  title="Clear marks"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearStamps(qId);
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <Trash2 size={12} color="#d32f2f" />
                </button>
              </div>
            );
          })}

          {/* Floating Dialog Box */}
          {dialogState.visible && activeQuestion && (
            <div
              className="floating-dialog-box"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                left: `${dialogState.x}px`,
                top: `${dialogState.y}px`,
                width: "140px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #a3c2f0",
                borderRadius: "4px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                fontFamily: "sans-serif",
                fontSize: "11px",
                padding: "6px",
              }}
            >
              <div style={{ color: "#444", fontWeight: "600", marginBottom: "3px" }}>
                Select Mark :
              </div>

              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  padding: "4px 6px",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  marginBottom: "4px"
                }}
              >
                <span>Q{activeQuestion.id} (Max: {activeQuestion.max})</span>
                <span style={{ fontSize: "8px", color: "#666" }}>▼</span>
              </div>

              <div
                style={{
                  maxHeight: "120px",
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: "2px"
                }}
              >
                {marksOptions.map((val) => (
                  <div
                    key={val}
                    onClick={() => {
                      onAddStamp(activeQuestion.id, val.toString());
                    }}
                    style={{
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: "#17468c",
                      backgroundColor: "#fff",
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#eef4ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    {val}
                  </div>
                ))}
                {marksOptions.length === 0 && (
                  <div style={{ padding: "8px", color: "#d32f2f", fontWeight: "bold", textAlign: "center" }}>
                    Limit Reached
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  onClick={() => setDialogState(prev => ({ ...prev, visible: false }))}
                  style={{
                    backgroundColor: "#f4f4f4",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    padding: "2px 6px",
                    cursor: "pointer",
                    fontSize: "9px"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pages Bottom Strip */}
      <div
        className="pages-strip"
        style={{
          backgroundColor: "#f0f4f8",
          padding: "8px 10px",
          borderTop: "1px solid #ddd",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isSelected = pageNum === currentPage;
          const isGraded = pageNum <= currentPage;

          return (
            <div
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: "24px",
                height: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                borderRadius: "3px",
                color: "#ffffff",
                backgroundColor: isSelected ? "#d32f2f" : (isGraded ? "#2e7d32" : "#9e9e9e"),
                border: isSelected ? "2px solid #000" : "none",
                transform: isSelected ? "scale(1.1)" : "none",
                transition: "all 0.1s ease",
              }}
            >
              {pageNum.toString().padStart(2, "0")}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="viewer-footer" style={{ borderTop: "none" }}>
        <button
          className="page-btn"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.5 : 1, cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <span style={{ fontWeight: "600" }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="page-btn"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          style={{ opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default ImageViewer;