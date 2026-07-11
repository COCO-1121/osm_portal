import Navbar from "../components/Navbar";
import ExaminerLoginCard from "../components/ExaminerLoginCard";
import Footer from "../components/Footer";

function ExaminerLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Navbar />

      <main className="flex-1 bg-gray-50 flex items-center justify-center px-10">
        <ExaminerLoginCard />
      </main>

      <Footer />

    </div>
  );
}

export default ExaminerLoginPage;