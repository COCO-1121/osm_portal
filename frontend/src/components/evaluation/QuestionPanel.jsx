import "./Evaluation.css";

function QuestionPanel() {
  const questions = [
    { id: "Q1", max: 2, obtained: "" },
    { id: "Q2", max: 3, obtained: "" },
    { id: "Q3", max: 5, obtained: "" },
    { id: "Q4", max: 4, obtained: "" },
    { id: "Q5", max: 6, obtained: "" },
    { id: "Q6", max: 10, obtained: "" },
    { id: "Q7", max: 5, obtained: "" },
    { id: "Q8", max: 5, obtained: "" },
  ];

  return (
    <aside className="question-panel">

      <div className="panel-header">
        <h3>Question Wise Marks</h3>
      </div>

      <div className="question-list">

        {questions.map((question) => (

          <div className="question-row" key={question.id}>

            <div className="question-name">
              {question.id}
            </div>

            <div className="max-marks">
              / {question.max}
            </div>

            <input
              type="number"
              placeholder="0"
              className="marks-input"
            />

          </div>

        ))}

      </div>

      <div className="total-box">

        <div className="total-score">
          0 / 40
        </div>

      </div>

    </aside>
  );
}

export default QuestionPanel;