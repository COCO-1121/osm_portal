import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export const login = async (data) => {
  const response = await API.post("/login", data);
  return response.data;
};