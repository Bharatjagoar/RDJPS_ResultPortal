import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin"
});

// 🔐 attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const searchTeachers = (query) =>
  API.get(`/teachers/search?q=${query}`);

export const getTeacherActivities = (teacherId) =>
  API.get(`/teachers/${teacherId}/activities`);
