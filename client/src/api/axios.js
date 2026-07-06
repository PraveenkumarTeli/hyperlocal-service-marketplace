import axios from "axios";

const API = axios.create({
  baseURL: "https://hyperlocal-marketplace-api.onrender.com/api",
});

// Automatically attach the JWT token to every request, if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;