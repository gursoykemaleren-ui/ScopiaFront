import api from "./apiClient";

export const getJobAttachments = async (jobId) => {
  const res = await api.get(`/attachments/job/${jobId}`);
  return res.data;
};

export const uploadJobAttachment = async (jobId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/attachments/job/${jobId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getAllAttachments = async () => {
  const res = await api.get("/attachments");
  return res.data;
};

export const deleteAttachment = async (id) => {
  await api.delete(`/attachments/${id}`);
};

export const getAttachmentDownloadUrl = (id) => {
  return `http://localhost:5002/api/attachments/${id}/download`;
};