import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import Footer from "../../shared/components/Footer";
import AdminLoginCard from "../components/AdminLoginCard";

function AdminLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-white admin-login-page overflow-hidden">
      {/* Navbar */}
      <Navbar onBack={() => navigate("/")} />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-2 px-4 admin-login-main min-h-0 overflow-y-auto">
        <AdminLoginCard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AdminLoginPage;