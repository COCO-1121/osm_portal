import EvaluationHeader from "../components/evaluation/EvaluationHeader";
import QuestionPanel from "../components/evaluation/QuestionPanel";
import ImageViewer from "../components/evaluation/ImageViewer";
import BottomToolbar from "../components/evaluation/BottomToolbar";
import "../components/evaluation/Evaluation.css";

function EvaluationPage() {
  return (
    <div className="evaluation-page">

      <EvaluationHeader />

      <div className="evaluation-body">

        <QuestionPanel />

        <ImageViewer />

      </div>

      <BottomToolbar />

    </div>
  );
}

export default EvaluationPage;