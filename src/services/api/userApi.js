import api from "./apiClient";

export const userApi = {
  getAll: async () => {
    const response = await api.get("/Users");
    return response.data;
  },
};