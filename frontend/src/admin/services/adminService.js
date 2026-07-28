const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getAdminProfile() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_URL}/api/v1/admin/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch admin profile."
    );
  }

  return data;
}

export async function updateAdminProfile(profileData) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_URL}/api/v1/admin/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update admin profile."
    );
  }

  return data;
}

export async function changeAdminPassword(oldPassword, newPassword) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_URL}/api/v1/admin/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to change admin password."
    );
  }

  return data;
}

export async function getLoginHistory(page = 1, size = 10) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_URL}/api/v1/admin/login-history?page=${page}&size=${size}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch login history."
    );
  }

  return data;
}