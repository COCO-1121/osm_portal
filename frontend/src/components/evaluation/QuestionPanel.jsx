import "./Evaluation.css";

function QuestionPanel({ questions, activeQuestionId, onQuestionSelect, onMarksChange }) {
  const totalMax = questions.reduce((sum, q) => sum + q.max, 0);
  const totalObtained = questions.reduce((sum, q) => sum + (parseFloat(q.obtained) || 0), 0);

  return (
    <aside className="question-panel" style={{ width: "260px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="panel-header" style={{ padding: "10px 14px", borderBottom: "1px solid #ccc" }}>
        <h3 style={{ margin: 0, fontSize: "14px", color: "#1b3d87" }}>Question Wise Marks</h3>
      </div>

      {/* Table Headers (Removed Steps column) */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 2fr",
          backgroundColor: "#d7e8f5",
          borderBottom: "1px solid #b8d4ed",
          padding: "6px 4px",
          fontWeight: "bold",
          fontSize: "10px",
          textAlign: "center",
          color: "#333"
        }}
      >
        <div>Q.No.</div>
        <div>Max. Marks</div>
        <div>Marks</div>
      </div>

      {/* Scrollable Rows Container */}
      <div className="question-list" style={{ flex: 1, overflowY: "auto", padding: 0 }}>
        {questions.map((question) => {
          const isActive = question.id === activeQuestionId;
          const isGraded = question.obtained !== "";

          return (
            <div
              key={question.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1.5fr 2fr",
                alignItems: "stretch",
                borderBottom: "1px solid #e0e0e0",
                fontSize: "11px",
                height: "36px",
                backgroundColor: isActive ? "#f0fdf4" : "transparent"
              }}
            >
              {/* Q.No Column */}
              <div 
                style={{ 
                  backgroundColor: "#e7f3fc", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  fontWeight: "600",
                  color: isGraded ? "#c2185b" : "#333",
                  borderRight: "1px solid #d2e4f5"
                }}
              >
                {question.id}
              </div>

              {/* Max Marks Column */}
              <div 
                style={{ 
                  backgroundColor: "#e7f3fc", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  fontWeight: "600",
                  color: "#333",
                  borderRight: "1px solid #d2e4f5"
                }}
              >
                {question.max}
              </div>

              {/* Marks Column - Clicking here activates marking on screen */}
              <div 
                onClick={(e) => onQuestionSelect(question.id, e)}
                style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  padding: "2px 6px",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "26px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    border: isActive ? "2.5px solid #2e7d32" : "1px solid #ccc",
                    borderRadius: "2px",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                    transition: "border-color 0.15s ease"
                  }}
                >
                  {question.obtained}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-box" style={{ padding: "8px 12px", borderTop: "1px solid #ccc", backgroundColor: "#fff" }}>
        <div className="total-score" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 0, padding: "8px 12px", fontSize: "12px", backgroundColor: "#1565c0" }}>
          <span>Total Marks:</span>
          <span>{totalObtained.toFixed(1).replace(".0", "")} / {totalMax}</span>
        </div>
      </div>
    </aside>
  );
}

export default QuestionPanel;