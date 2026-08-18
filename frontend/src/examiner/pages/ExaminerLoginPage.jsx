import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import ExaminerLoginCard from "../../shared/components/ExaminerLoginCard";
import Footer from "../../shared/components/Footer";

function ExaminerLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Navbar onBack={() => navigate("/")} />

      <main className="flex-1 bg-gray-50 flex items-center justify-center py-2 px-4 min-h-0 overflow-y-auto">
        <ExaminerLoginCard />
      </main>

      <Footer />
    </div>
  );
}

export default ExaminerLoginPage;