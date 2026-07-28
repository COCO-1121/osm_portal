const API_URL = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/v1/admin/examiners`;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export async function getAllExaminers() {
  const response = await fetch(API_URL, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch examiners.");
  }

  return data;
}

export async function getExaminer(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch examiner.");
  }

  return data;
}

export async function createExaminer(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create examiner.");
  }

  return data;
}

export async function updateExaminer(id, payload) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update examiner.");
  }

  return data;
}

export async function resetPassword(id, password) {
  const response = await fetch(`${API_URL}/${id}/password`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Password reset failed.");
  }

  return data;
}

export async function changeStatus(id, is_active) {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({
      is_active,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Status update failed.");
  }

  return data;
}