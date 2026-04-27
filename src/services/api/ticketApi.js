import api from "./apiClient";

export const ticketApi = {
  getAll: async () => {
    const response = await api.get("/Tickets");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Tickets/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/Tickets", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/Tickets/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/Tickets/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/Tickets/${id}`);
    return response.data;
  },

  getByCustomer: async (customerId) => {
  const response = await api.get(`/Tickets/by-customer/${customerId}`);
  return response.data;
},

getSummary: async () => {
  const response = await api.get("/Tickets/summary");
  return response.data;
},

};