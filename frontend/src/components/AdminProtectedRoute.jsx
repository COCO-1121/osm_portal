import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("admin_user");

  if (!token || !storedUser) {
    return <Navigate to="/admin-login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user.role !== "ADMIN") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("admin_user");

      return <Navigate to="/admin-login" replace />;
    }
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("admin_user");

    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;