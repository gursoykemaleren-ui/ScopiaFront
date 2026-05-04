import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDateTR } from "../../utils/date";
import { adminUserApi } from "../../services/api/adminUserApi";

function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assigningJobId, setAssigningJobId] = useState(null);

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const getUserId = (user) => {
    return user.id ?? user.userId ?? user.UserId ?? user.Id;
  };

  const getUserName = (user) => {
    return user.userName ?? user.UserName ?? user.email ?? user.Email ?? "-";
  };

  const getAssignedUserName = (assignedId) => {
    if (!assignedId) return "Atanmamış";

    const user = users.find((u) => Number(getUserId(u)) === Number(assignedId));

    return user ? getUserName(user) : `Kullanıcı #${assignedId}`;
  };

  const getStatusBadgeClass = (statusValue) => {
    switch (statusValue) {
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

  const getPriorityBadgeClass = (priorityValue) => {
    switch (priorityValue) {
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

  const fetchUsers = async () => {
    try {
      const data = await adminUserApi.getAll();
      const userList = normalizeList(data).filter((user) => {
        const isActive = user.isActive ?? user.IsActive;
        return isActive !== false;
      });

      setUsers(userList);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
      setUsers([]);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = {};

      if (search.trim()) {
        params.q = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      const response = await axios.get("http://localhost:5002/api/jobs", {
        headers: getAuthHeaders(),
        params,
      });

      const items =
        response.data?.items ??
        response.data?.data?.items ??
        response.data?.data ??
        response.data ??
        [];

      setJobs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Jobs alınamadı:", err);
      console.log("GET jobs error:", err.response?.data);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5002/api/customers", {
        headers: getAuthHeaders(),
      });

      const customerData =
        response.data?.items ??
        response.data?.data?.items ??
        response.data?.data ??
        response.data ??
        [];

      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (err) {
      console.error("Customers alınamadı:", err);
      console.log("GET customers error:", err.response?.data);
      setCustomers([]);
    }
  };

  const handleAssignJob = async (jobId, selectedUserId) => {
    if (!selectedUserId) {
      alert("Lütfen atanacak kullanıcıyı seç.");
      return;
    }

    try {
      setAssigningJobId(jobId);

      await axios.post(
        `http://localhost:5002/api/jobs/${jobId}/assign`,
        {
          assignedToUserId: Number(selectedUserId),
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      await fetchJobs();
    } catch (err) {
      console.error("İş ataması yapılamadı:", err);
      console.log("ASSIGN job error:", err.response?.data);

      if (err.response?.status === 403) {
        alert("Bu işlem için yetkin yok. Kullanıcına jobs.assign izni verilmesi gerekiyor.");
        return;
      }

      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : "İş ataması yapılırken hata oluştu."
      );
    } finally {
      setAssigningJobId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm("Bu job'u silmek istiyor musun?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5002/api/jobs/${jobId}`, {
        headers: getAuthHeaders(),
      });

      await fetchJobs();
    } catch (err) {
      console.error("Job silinemedi:", err);
      alert("Job silinirken hata oluştu.");
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title boş olamaz.");
      return;
    }

    if (!customerId) {
      alert("Customer seçmelisiniz.");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title: title.trim(),
        customerId: Number(customerId),
        priority,
        status,
        description: description.trim() || null,
        dueDate: dueDate || null,
      };

      if (assignedToUserId) {
        payload.assignedToUserId = Number(assignedToUserId);
      }

      await axios.post("http://localhost:5002/api/jobs", payload, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      setTitle("");
      setCustomerId("");
      setAssignedToUserId("");
      setPriority("Medium");
      setStatus("Open");
      setDueDate("");
      setDescription("");

      await fetchJobs();
    } catch (err) {
      console.error("Job oluşturulamadı:", err);
      console.log("POST job error:", err.response?.data);

      alert(
        JSON.stringify(
          err.response?.data?.error?.details || err.response?.data,
          null,
          2
        )
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="container-fluid">
      <div className="mb-3">
        <h2 className="fw-bold mb-1">İş Yönetimi</h2>
        <p className="text-muted mb-0">
          İş kayıtları, görev atamaları, durum takibi ve son teslim tarihleri
        </p>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Yeni İş Oluştur</h5>

          <form onSubmit={handleCreateJob}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Başlık</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Müşteri</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Müşteri seç</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Atanacak Kullanıcı</label>
                <select
                  className="form-select"
                  value={assignedToUserId}
                  onChange={(e) => setAssignedToUserId(e.target.value)}
                >
                  <option value="">Atanmamış oluştur</option>
                  {users.map((user) => (
                    <option key={getUserId(user)} value={getUserId(user)}>
                      {getUserName(user)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Öncelik</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Düşük</option>
                  <option value="Medium">Orta</option>
                  <option value="High">Yüksek</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Durum</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Open">Açık</option>
                  <option value="InProgress">Devam Ediyor</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Cancelled">İptal Edildi</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Son Teslim Tarihi</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Açıklama</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? "Oluşturuluyor..." : "Yeni İş Oluştur"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">İş Filtreleri</h5>

          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Arama</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="İş başlığı veya açıklama ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Durum</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="Open">Açık</option>
                  <option value="InProgress">Devam Ediyor</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Cancelled">İptal Edildi</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Öncelik</label>
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="Low">Düşük</option>
                  <option value="Medium">Orta</option>
                  <option value="High">Yüksek</option>
                </select>
              </div>

              <div className="col-md-2 d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">
                  Ara
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleResetFilters}
                >
                  Sıfırla
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <p className="mb-0">Yükleniyor...</p>
          ) : jobs.length === 0 ? (
            <p className="mb-0">Kayıt bulunamadı.</p>
          ) : (
            <div className="table-responsive jobs-table-scroll">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Başlık</th>
                    <th>Durum</th>
                    <th>Müşteri</th>
                    <th>Öncelik</th>
                    <th>Son Teslim</th>
                    <th>Atanan Kullanıcı</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.id}</td>

                      <td className="fw-semibold">{job.title}</td>

                      <td>
                        <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>

                      <td>{job.customerName || "-"}</td>

                      <td>
                        <span className={`badge ${getPriorityBadgeClass(job.priority)}`}>
                          {job.priority || "-"}
                        </span>
                      </td>

                      <td>{formatDateTR(job.dueDate)}</td>

                      <td style={{ minWidth: 190 }}>
                        <select
                          className="form-select form-select-sm"
                          value={job.assignedToUserId ?? job.AssignedToUserId ?? ""}
                          disabled={assigningJobId === job.id}
                          onChange={(e) => handleAssignJob(job.id, e.target.value)}
                        >
                          <option value="">
                            {getAssignedUserName(
                              job.assignedToUserId ?? job.AssignedToUserId
                            )}
                          </option>

                          {users.map((user) => (
                            <option key={getUserId(user)} value={getUserId(user)}>
                              {getUserName(user)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Detay
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobListPage;