import api from "./apiClient";

export const getAllReturnRequests = async () => {
  const res = await api.get("/ReturnRequests");
  return res.data;
};

export const createReturnRequest = async (data) => {
  const res = await api.post("/ReturnRequests", data);
  return res.data;
};

export const updateReturnStatus = async (id, status) => {
  const res = await api.put(`/ReturnRequests/${id}`, { status });
  return res.data;
};

export const deleteReturnRequest = async (id) => {
  const res = await api.delete(`/returnrequests/${id}`);
  return res.data;
};
