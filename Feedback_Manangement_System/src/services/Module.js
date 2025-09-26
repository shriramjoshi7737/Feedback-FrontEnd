import api from "./api";

const token = localStorage.getItem("token");

export const getModules = async () => {
  try {
    const response = await api.get("Modules", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const getModuleById = async (moduleId) => {
  try {
    const response = await api.get(`Modules/${moduleId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching module with ID ${moduleId}:`, error);
    throw error;
  }
};
