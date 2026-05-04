import api from "./apiClient";

export const adminUserApi = {
  getAll: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  updateStatus: async (id, isActive) => {
    const response = await api.put(`/admin/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  setRole: async (id, roleId) => {
    const response = await api.post(`/admin/users/${id}/role`, {
      roleId: Number(roleId),
    });
    return response.data;
  },
};