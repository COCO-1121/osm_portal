import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("admin_user");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.role && user.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
      }
    } catch (e) {
      console.error("Error parsing admin user token:", e);
    }
  }

  return <Outlet />;
}

export default AdminProtectedRoute;