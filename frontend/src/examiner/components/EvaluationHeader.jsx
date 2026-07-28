import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Evaluation.css";

function EvaluationHeader() {
  const { subjectId } = useParams();
  const [userId, setUserId] = useState("E1438427");
  const [scriptId, setScriptId] = useState("684429");

  useEffect(() => {
    const storedUserId = localStorage.getItem("examinerUserId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    // Switch script ID slightly based on subject for demo purposes
    if (subjectId === "0551") {
      setScriptId("684430");
    } else {
      setScriptId("684429");
    }
  }, [subjectId]);

  const subjectName = subjectId === "0551" ? "ACCOUNTANCY - Set 1" : "ECONOMICS - Set 2";
  const displaySubjectId = subjectId || "0302";

  return (
    <header className="evaluation-header">

      <div className="subject-info">

        <h2>Subject : ({displaySubjectId}) {subjectName}</h2>

      </div>

      <div className="header-details">

        <div className="detail-card">
          <span className="label">User ID</span>
          <span className="value">{userId}</span>
        </div>

        <div className="detail-card">
          <span className="label">Role</span>
          <span className="value">Evaluator</span>
        </div>

        <div className="detail-card">
          <span className="label">Script ID</span>
          <span className="value">{scriptId}</span>
        </div>

      </div>

    </header>
  );
}

export default EvaluationHeader;