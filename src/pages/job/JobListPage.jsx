import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDateTR } from "../../utils/date";

function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
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

      await axios.post("http://localhost:5002/api/jobs", payload, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      setTitle("");
      setCustomerId("");
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
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Jobs</h2>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Yeni Job Oluştur</h5>

          <form onSubmit={handleCreateJob}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Customer</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Customer seç</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="InProgress">InProgress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
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
                  {creating ? "Oluşturuluyor..." : "Yeni Job Oluştur"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Job Filters</h5>

          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Job title veya description ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="InProgress">InProgress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
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
            <p className="mb-0">Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="mb-0">Kayıt bulunamadı.</p>
          ) : (
            <div className="table-responsive jobs-table-scroll">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.id}</td>
                      <td>{job.title}</td>
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
                      <td className="d-flex gap-2">
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