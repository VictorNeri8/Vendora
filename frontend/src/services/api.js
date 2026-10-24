
import axios from "axios";

const api = axios.create({
  baseURL: "https://vendora-backend-cho7.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
