const API_URL = "http://127.0.0.1:8000/api/v1/admin/audit-logs";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export async function getAuditLogs() {
  const response = await fetch(API_URL, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch audit logs.");
  }

  return data;
}
