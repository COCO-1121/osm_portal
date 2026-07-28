import Navbar from "../../shared/components/Navbar";
import SubjectAssignmentCard from "../../shared/components/SubjectAssignmentCard";

function ExaminerSubjectPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-6">
        <SubjectAssignmentCard />
      </main>

    </div>
  );
}

export default ExaminerSubjectPage;