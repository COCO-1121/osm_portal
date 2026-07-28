import { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const updateAdmin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem(
      "admin",
      JSON.stringify(adminData)
    );
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("access_token");
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        updateAdmin,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}