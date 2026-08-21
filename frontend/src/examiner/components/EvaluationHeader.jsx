import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Evaluation.css";

function EvaluationHeader({ subjectName, subjectCode, scriptId, userId }) {
  const displayUserId = userId || localStorage.getItem("examinerUserId") || localStorage.getItem("examiner_id") || "EXM001";
  const displayScriptId = scriptId || "OSM-001";
  const displaySubjectName = subjectName || "PHYSICS (048)";
  const displaySubjectCode = subjectCode || "048";

  return (
    <header className="evaluation-header">

      <div className="subject-info">

        <h2>Subject : ({displaySubjectCode}) {displaySubjectName}</h2>

      </div>

      <div className="header-details">

        <div className="detail-card">
          <span className="label">User ID</span>
          <span className="value">{displayUserId}</span>
        </div>

        <div className="detail-card">
          <span className="label">Role</span>
          <span className="value">Evaluator</span>
        </div>

        <div className="detail-card">
          <span className="label">Script ID</span>
          <span className="value">{displayScriptId}</span>
        </div>

      </div>

    </header>
  );
}

export default EvaluationHeader;