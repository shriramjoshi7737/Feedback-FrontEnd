import api from "../services/api";

const token = localStorage.getItem("token");
export const getStaff = async () => {
  try {
    const response = await api.get("staff/getAllStaff", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching staffs:", error);
    throw error;
  }
};

export const getStaffById = async (staffId) => {
  try {
    const response = await api.get(`staff/getStaff/${staffId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff with ID ${staffId}:`, error);
    throw error;
  }
};
