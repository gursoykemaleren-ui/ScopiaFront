import api from "./apiClient";

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const getUnreadNotificationCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.put("/notifications/read-all");
};

export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};

export const clearNotifications = async () => {
  await api.delete("/notifications/clear");
};