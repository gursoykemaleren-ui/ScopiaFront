import api from "./apiClient";

export const jobApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.page)
      params.append("page", filters.page);

    if (filters.pageSize)
      params.append("pageSize", filters.pageSize);

    if (filters.isCompleted !== undefined && filters.isCompleted !== null)
      params.append("isCompleted", filters.isCompleted);

    if (filters.customerId)
      params.append("customerId", filters.customerId);

    if (filters.assignedToUserId)
      params.append("assignedToUserId", filters.assignedToUserId);

    if (filters.createdByUserId)
      params.append("createdByUserId", filters.createdByUserId);

    if (filters.createdDepartmentId)
      params.append("createdDepartmentId", filters.createdDepartmentId);

    if (filters.assignedDepartmentId)
      params.append("assignedDepartmentId", filters.assignedDepartmentId);

    if (filters.priority)
      params.append("priority", filters.priority);

    if (filters.status)
      params.append("status", filters.status);

    if (filters.q)
      params.append("q", filters.q);

    const response = await api.get(`/Jobs?${params.toString()}`);

    return response.data;
  },

  getMyJobs: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.page)
      params.append("page", filters.page);

    if (filters.pageSize)
      params.append("pageSize", filters.pageSize);

    if (filters.isCompleted !== undefined && filters.isCompleted !== null)
      params.append("isCompleted", filters.isCompleted);

    if (filters.createdDepartmentId)
      params.append("createdDepartmentId", filters.createdDepartmentId);

    if (filters.q)
      params.append("q", filters.q);

    const response = await api.get(`/Jobs/my?${params.toString()}`);

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/Jobs/${id}`);
    return response.data;
  },
};