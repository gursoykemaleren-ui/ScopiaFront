import api from "./apiClient";

export const customerInteractionApi = {
  getByCustomer: async (customerId) => {
    const response = await api.get(`/CustomerInteractions/by-customer/${customerId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/CustomerInteractions", data);
    return response.data;
  },
  update: async (id, data) => {
  const response = await api.put(`/CustomerInteractions/${id}`, data);
  return response.data;
},

delete: async (id) => {
  const response = await api.delete(`/CustomerInteractions/${id}`);
  return response.data;
},
};