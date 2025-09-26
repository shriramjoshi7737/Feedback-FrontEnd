import axios from "axios";

const Api = axios.create({
  baseURL: "https://localhost:7056/api/",
});


export default Api;