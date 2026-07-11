import AdminLayout from "../layouts/AdminLayout";
import ScriptDetailsCard from "../components/evaluation/ScriptDetailsCard";
import PDFViewer from "../components/evaluation/PDFViewer";
import ReviewActions from "../components/evaluation/ReviewActions";

function RejectedScriptReview() {
  return (
    <AdminLayout title="Rejected Script Review">

      <ScriptDetailsCard />

      <div className="mt-6">
        <PDFViewer />
      </div>

      <div className="mt-6">
        <ReviewActions />
      </div>

    </AdminLayout>
  );
}

export default RejectedScriptReview;