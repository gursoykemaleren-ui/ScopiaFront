import api from "./apiClient";

export const reportApi = {
  getTickets: async () => {
    const response = await api.get("/Tickets");
    return response.data;
  },

  getReturnRequests: async () => {
    const response = await api.get("/ReturnRequests");
    return response.data;
  },
};