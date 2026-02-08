import { api } from "../pages/utils";

// 👇 admin-scoped instance
const adminAPI = api.create({
  baseURL: `${api.defaults.baseURL}/api/admin`,
});

// 🔐 attach token automatically
adminAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const searchTeachers = (query) =>
  adminAPI.get(`/teachers/search`, {
    params: { q: query }
  });

export const getTeacherActivities = (teacherId) =>
  adminAPI.get(`/teachers/${teacherId}/activities`);
