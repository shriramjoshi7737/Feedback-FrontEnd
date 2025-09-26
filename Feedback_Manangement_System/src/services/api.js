import axios from "axios";

const Api = axios.create({
  //baseURL: "https://localhost:7056/api/",
  baseURL:
    "https://feedbackmanagementsystem-bcaygzc6bsekengt.centralindia-01.azurewebsites.net/api/",
});

export default Api;
