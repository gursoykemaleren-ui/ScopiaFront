import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { formatDateTimeTR, formatDateTR } from "../../utils/date";
import {
  getJobAttachments,
  uploadJobAttachment,
  deleteAttachment,
  getAttachmentDownloadUrl,
} from "../../services/api/attachmentApi";


function JobDetailPage() {
  const { id } = useParams();

  const [attachments, setAttachments] = useState([]);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentSuccess, setAttachmentSuccess] = useState("");

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(true);
  
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");

  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentUpdating, setCommentUpdating] = useState(false);
  const [commentDeletingId, setCommentDeletingId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    if (job) {
      setEditForm({
        title: job.title || "",
        description: job.description || "",
        priority: job.priority || "Medium",
        dueDate:
          typeof job.dueDate === "string" && job.dueDate.length >= 16
            ? job.dueDate.slice(0, 16)
            : "",
      });
    }
  }, [job]);

  const handleUpdateJob = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5002/api/jobs/${id}`, editForm, {
        headers: getAuthHeaders(),
      });

      setShowEditModal(false);

      await fetchJob();
      await fetchActivities();
    } catch (err) {
      console.error("Job update hatası:", err);
      alert("Job güncellenemedi.");
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false;
    if (status === "Completed" || status === "Cancelled") return false;

    return new Date(dueDate) < new Date();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-primary";
      case "InProgress":
        return "bg-warning text-dark";
      case "Completed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-success";
      case "Medium":
        return "bg-info text-dark";
      case "High":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const fetchAttachments = async () => {
  try {
    setAttachmentLoading(true);
    setAttachmentError("");

    const data = await getJobAttachments(id);
    setAttachments(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Dosyalar alınamadı:", err);
    setAttachmentError("Dosyalar alınırken hata oluştu.");
  } finally {
    setAttachmentLoading(false);
  }
};

const handleUploadAttachment = async (e) => {
  e.preventDefault();

  setAttachmentError("");
  setAttachmentSuccess("");

  if (!attachmentFile) {
    setAttachmentError("Lütfen bir dosya seç.");
    return;
  }

  try {
    setAttachmentUploading(true);

    await uploadJobAttachment(id, attachmentFile);

    setAttachmentFile(null);
    e.target.reset();

    setAttachmentSuccess("Dosya başarıyla yüklendi.");

    await fetchAttachments();
    await fetchActivities();
  } catch (err) {
    console.error("Dosya yüklenemedi:", err);

    const apiMessage =
      err.response?.data?.message ||
      err.response?.data ||
      "Dosya yüklenemedi.";

    setAttachmentError(apiMessage);
  } finally {
    setAttachmentUploading(false);
  }
};

const handleDeleteAttachment = async (attachmentId) => {
  const ok = window.confirm("Bu dosyayı silmek istiyor musun?");
  if (!ok) return;

  try {
    await deleteAttachment(attachmentId);
    await fetchAttachments();
  } catch (err) {
    console.error("Dosya silinemedi:", err);
    setAttachmentError("Dosya silinemedi.");
  }
};

const formatFileSize = (size) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
const getFileIcon = (contentType) => {
  if (!contentType) return "📎";
  if (contentType.includes("pdf")) return "📄";
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType.includes("word")) return "📝";
  if (contentType.includes("excel") || contentType.includes("spreadsheet")) return "📊";
  return "📎";
};


  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/jobs/${id}`, {
        headers: getAuthHeaders(),
      });

      setJob(response.data);
    } catch (err) {
      console.error("Job detail alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError("");

      const response = await axios.get(
        `http://localhost:5002/api/jobs/${id}/activities-log`,
        {
          headers: getAuthHeaders(),
        }
      );

      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Job activity log alınamadı:", err);
      setActivitiesError("İşlem geçmişi alınırken bir hata oluştu.");
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);

      const response = await axios.get(
        `http://localhost:5002/api/jobs/${id}/comments`,
        {
          headers: getAuthHeaders(),
        }
      );

      const commentData =
        response.data?.data ??
        response.data?.items ??
        response.data ??
        [];

      setComments(Array.isArray(commentData) ? commentData : []);
    } catch (err) {
      console.error("Comments alınamadı:", err);
      console.log("GET comments error:", err.response?.data);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setUpdating(true);

      await axios.post(
        `http://localhost:5002/api/jobs/${id}/status`,
        {
          status: selectedStatus,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      await fetchJob();
      await fetchActivities();
    } catch (err) {
      console.error("Status update hatası:", err);
      console.log("Status update error:", err.response?.data);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
  e.preventDefault();

  setCommentError("");
  setCommentSuccess("");

  if (!commentText.trim()) {
    setCommentError("Yorum boş olamaz.");
    return;
  }

  try {
    setCommentSubmitting(true);

    const response = await axios.post(
      `http://localhost:5002/api/jobs/${id}/comments`,
      {
        text: commentText.trim(),
      },
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("POST comment response:", response.data);

    setCommentText("");
    setCommentSuccess("Yorum başarıyla eklendi.");

    await fetchComments();
    await fetchActivities();
  } catch (err) {
    console.error("Comment eklenemedi:", err);
    console.log("POST comment error full:", err.response?.data);

    setCommentError("Yorum eklenemedi.");
  } finally {
    setCommentSubmitting(false);
  }
};

  const handleDeleteComment = async (commentId) => {
  const confirmDelete = window.confirm("Bu yorumu silmek istiyor musun?");
  if (!confirmDelete) return;

  setCommentError("");
  setCommentSuccess("");

  try {
    setCommentDeletingId(commentId);

    await axios.delete(
      `http://localhost:5002/api/jobs/${id}/comments/${commentId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    setCommentSuccess("Yorum başarıyla silindi.");

    await fetchComments();
    await fetchActivities();
  } catch (err) {
    console.error("Comment silinemedi:", err);
    console.log("DELETE comment error:", err.response?.data);

    setCommentError("Yorum silinemedi.");
  } finally {
    setCommentDeletingId(null);
  }
};

  const startEditComment = (comment) => {
  setCommentError("");
  setCommentSuccess("");
  setEditingCommentId(comment.id);
  setEditCommentText(comment.content ?? comment.text ?? comment.message ?? "");
};

  const cancelEditComment = () => {
  setEditingCommentId(null);
  setEditCommentText("");
  setCommentError("");
};
  const handleUpdateComment = async (commentId) => {
  setCommentError("");
  setCommentSuccess("");

  if (!editCommentText.trim()) {
    setCommentError("Yorum boş olamaz.");
    return;
  }

  try {
    setCommentUpdating(true);

    await axios.put(
      `http://localhost:5002/api/jobs/${id}/comments/${commentId}`,
      JSON.stringify(editCommentText.trim()),
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );

    setEditingCommentId(null);
    setEditCommentText("");
    setCommentSuccess("Yorum başarıyla güncellendi.");

    await fetchComments();
    await fetchActivities();
  } catch (err) {
    console.error("Comment güncellenemedi:", err);
    console.log("PUT comment error:", err.response?.data);

    setCommentError("Yorum güncellenemedi.");
  } finally {
    setCommentUpdating(false);
  }
};

  useEffect(() => {
    fetchJob();
    fetchActivities();
    fetchComments();
    fetchAttachments();
  }, [id]);

  useEffect(() => {
    if (job?.status) {
      setSelectedStatus(job.status.toLowerCase());
    }
  }, [job]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
        <div className="mt-2 text-muted">Job yükleniyor...</div>
      </div>
    );
  }

  if (!job) return <p>Kayıt bulunamadı.</p>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">İş Detayı</h2>
          <div className="text-muted">Job #{job.id}</div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-warning shadow-sm"
            onClick={() => setShowEditModal(true)}
          >
            Düzenle
          </button>

          <Link to="/jobs" className="btn btn-outline-secondary">
            ← Jobs List
          </Link>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
              <h4 className="mb-2">{job.title}</h4>

              <div className="row g-2 mt-2">
                <div className="col-auto">
                  <span className={`badge ${getStatusBadgeClass(job.status)} fs-6`}>
                    {job.status || "-"}
                  </span>
                </div>

                <div className="col-auto">
                  <span
                    className={`badge ${getPriorityBadgeClass(job.priority)} fs-6`}
                  >
                    {job.priority || "-"}
                  </span>
                </div>

                {isOverdue(job.dueDate, job.status) && (
                  <div className="col-auto">
                    <span className="badge bg-dark fs-6">Overdue</span>
                  </div>
                )}

                <div className="col-auto">
                  <span className="badge bg-light text-dark border fs-6">
                    Customer: {job.customerName || "-"}
                  </span>
                </div>

                <div className="col-auto">
                  <span className="badge bg-light text-dark border fs-6">
                    Assigned: {job.assignedToUserName || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h6 className="mb-3">Job Bilgileri</h6>

                <div className="row g-2">
                  <div className="col-12">
                    <strong>Description:</strong>
                    <div className="text-muted">
                      {job.description || "Açıklama yok"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Customer</strong>
                    <div>{job.customerName || "-"}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Assigned User</strong>
                    <div>{job.assignedToUserName || "-"}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Created By</strong>
                    <div>{job.createdByUserName || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h6 className="mb-3">Tarih Bilgileri</h6>

                <div className="row g-2">
                  <div className="col-md-6">
                    <strong>Due Date</strong>
                    <div>{formatDateTR(job.dueDate)}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Created At</strong>
                    <div>{formatDateTimeTR(job.createdAt)}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Updated At</strong>
                    <div>{formatDateTimeTR(job.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Update Job Status</h5>
          <p className="text-muted small mb-3">
            Job durumunu buradan güncelleyebilirsiniz.
          </p>

          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-3">
              <button
                className="btn btn-primary w-100 shadow-sm"
                onClick={updateStatus}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Job Comments</h5>

{commentSuccess && (
  <div className="alert alert-success py-2">{commentSuccess}</div>
)}

{commentError && (
  <div className="alert alert-danger py-2">{commentError}</div>
)}

<form onSubmit={handleAddComment} className="mb-4">
  <textarea
    className="form-control"
    rows="3"
    placeholder="Yorum yaz..."
    value={commentText}
    onChange={(e) => {
      setCommentText(e.target.value);
      if (commentError) setCommentError("");
    }}
  />

  <button
    type="submit"
    className="btn btn-primary mt-2 shadow-sm"
    disabled={commentSubmitting}
  >
    {commentSubmitting ? "Ekleniyor..." : "Comment Ekle"}
  </button>
</form>

{commentsLoading ? (
  <p className="mb-0">Comments loading...</p>
) : comments.length === 0 ? (
  <p className="mb-0 text-muted">Henüz yorum yok.</p>
) : (
  <div className="list-group">

    {comments.map((c) => (

      <div
        key={c.id ?? `${c.createdAt}-${c.createdByUserId}`}
        className="list-group-item border-0 border-bottom py-3"
      >

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">

          <div className="flex-grow-1">

            <div className="d-flex align-items-center gap-2 mb-1">
              <div className="fw-bold">
                {c.createdByUserName
                  ? c.createdByUserName
                  : `User ${c.createdByUserId ?? "-"}`}
              </div>

              {c.updatedAt && c.updatedAt !== c.createdAt && (
                <span className="badge bg-light text-dark border">
                  Düzenlendi
                </span>
              )}
            </div>

            {editingCommentId === c.id ? (

              <>
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={editCommentText}
                  onChange={(e) => {
                    setEditCommentText(e.target.value);
                    if (commentError) setCommentError("");
                  }}
                />

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-success shadow-sm"
                    onClick={() => handleUpdateComment(c.id)}
                    disabled={commentUpdating}
                  >
                    {commentUpdating ? "Kaydediliyor..." : "Kaydet"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={cancelEditComment}
                    disabled={commentUpdating}
                  >
                    İptal
                  </button>
                </div>
              </>

            ) : (

              <>
                <div
                  className="mb-2 text-dark"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {c.content ?? c.text ?? c.message ?? "-"}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-warning shadow-sm"
                    onClick={() => startEditComment(c)}
                  >
                    Düzenle
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger shadow-sm"
                    onClick={() => handleDeleteComment(c.id)}
                    disabled={commentDeletingId === c.id}
                  >
                    {commentDeletingId === c.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </>
            )}

          </div>

          <small className="text-muted">
            {formatDateTimeTR(c.createdAt)}
          </small>

        </div>

      </div>

    ))}

  </div>
)}

<div className="card shadow-sm border-0 mb-4">
  <div className="card-body">
    <h5 className="mb-3">Job Dosyaları</h5>

    {attachmentError && (
      <div className="alert alert-danger py-2">{attachmentError}</div>
    )}
    {attachmentSuccess && (
  <div className="alert alert-success py-2">{attachmentSuccess}</div>
    )}

    <form onSubmit={handleUploadAttachment} className="d-flex gap-2 mb-3">
      <input
        type="file"
        className="form-control"
        accept = ".png,.jpg,.jpeg,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={attachmentUploading}
      >
        {attachmentUploading ? "Yükleniyor..." : "Yükle"}
      </button>
    </form>

    {attachmentLoading ? (
      <p className="text-muted mb-0">Dosyalar yükleniyor...</p>
    ) : attachments.length === 0 ? (
      <p className="text-muted mb-0">Bu iş için henüz dosya yok.</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Dosya Adı</th>
              <th>Tür</th>
              <th>Boyut</th>
              <th>Yüklenme Tarihi</th>
              <th className="text-end">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map((file) => (
              <tr key={file.id}>
                <td>
                <span className="me-2">{getFileIcon(file.contentType)}</span>
               {file.originalFileName}
                </td>
                <td>{file.contentType || "-"}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{formatDateTimeTR(file.uploadedAt)}</td>
                <td className="text-end">
                  <a
                    href={getAttachmentDownloadUrl(file.id)}
                    className="btn btn-sm btn-outline-primary me-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    İndir
                  </a>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteAttachment(file.id)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-3">Job Activity Log</h5>

          {activitiesLoading && <p className="mb-0">Loading activities...</p>}

          {!activitiesLoading && activitiesError && (
            <div className="alert alert-danger mb-0">{activitiesError}</div>
          )}

          {!activitiesLoading &&
            !activitiesError &&
            activities.length === 0 && (
              <div className="text-muted">
                Bu job için henüz activity kaydı yok.
              </div>
            )}

          {!activitiesLoading &&
            !activitiesError &&
            activities.length > 0 && (
              <div className="list-group">
                {activities.map((activity) => (
                  <div
                    key={
                      activity.activityId ??
                      `${activity.createdAt}-${activity.type}`
                    }
                    className="list-group-item"
                  >
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <div className="fw-semibold">{activity.type ?? "-"}</div>
                        <div className="text-muted small">
                          {activity.message || "Mesaj yok"}
                        </div>
                      </div>

                      <div className="text-end small text-muted">
                        <div>{formatDateTimeTR(activity.createdAt)}</div>
                        <div>User: {activity.performedByUserId ?? "-"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {showEditModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateJob}>
                <div className="modal-header">
                  <h5 className="modal-title">Job Düzenle</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editForm.dueDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    İptal
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;