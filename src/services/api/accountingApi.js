import api from "./apiClient";

export const accountingApi = {
  getAll: async () => {
    const response = await api.get("/Accounting");
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get("/Accounting/summary");
    return response.data;
  },

  getByCustomer: async (customerId) => {
    const response = await api.get(`/Accounting/by-customer/${customerId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/Accounting", data);
    return response.data;
  },
  update: async (id, data) => {
  const response = await api.put(`/Accounting/${id}`, data);
  return response.data;
},

  delete: async (id) => {
    const response = await api.delete(`/Accounting/${id}`);
    return response.data;
  },
};