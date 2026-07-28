import EvaluationHeader from "../components/EvaluationHeader";
import QuestionPanel from "../components/QuestionPanel";
import ImageViewer from "../components/ImageViewer";
import BottomToolbar from "../components/BottomToolbar";
import "../components/Evaluation.css";

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