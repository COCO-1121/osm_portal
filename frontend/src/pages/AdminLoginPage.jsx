import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminLoginCard from "../components/AdminLoginCard";

function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white admin-login-page">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-6 admin-login-main">
        <AdminLoginCard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AdminLoginPage;