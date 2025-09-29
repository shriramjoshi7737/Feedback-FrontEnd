import axios from "axios";

const Api = axios.create({
  //baseURL: "https://localhost:7056/api/",
  // baseURL:
  //   "https://feedbackmanagementsystem-bcaygzc6bsekengt.centralindia-01.azurewebsites.net/api/",
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default Api;
