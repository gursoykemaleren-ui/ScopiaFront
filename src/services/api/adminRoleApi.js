import api from "./apiClient";

export const adminRoleApi = {
  getAll: async () => {
    const response = await api.get("/admin/roles");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/admin/roles", data);
    return response.data;
  },
};