import api from "./apiClient";

export const departmentApi = {
  getAll: async () => {
    const response = await api.get("/Departments");
    return response.data;
  },
};