import api from "./apiClient";

export const customerApi = {
  getAll: async () => {
    const response = await api.get("/Customers");
    return response.data;
  },
};