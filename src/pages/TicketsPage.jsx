import { useNavigate } from "react-router-dom";
import { customerApi } from "../services/api/customerApi";
import { useEffect, useState } from "react";
import { ticketApi } from "../services/api/ticketApi";
import { userApi } from "../services/api/userApi";


const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [users, setUsers] = useState([]);
  
  const navigate = useNavigate();
  
  const fetchCustomers = async () => {
  try {
    const data = await customerApi.getAll();

    if (Array.isArray(data)) {
      setCustomers(data);
    } else if (Array.isArray(data.data)) {
      setCustomers(data.data);
    } else if (Array.isArray(data.items)) {
      setCustomers(data.items);
    } else {
      console.log("Beklenmeyen customers response:", data);
      setCustomers([]);
    }
  } catch (err) {
    console.error("Müşteriler alınamadı", err);
    setCustomers([]);
  }
};
const fetchUsers = async () => {
  try {
    const data = await userApi.getAll();

    if (Array.isArray(data)) {
      setUsers(data);
    } else if (Array.isArray(data.data)) {
      setUsers(data.data);
    } else {
      setUsers([]);
    }
  } catch (err) {
    console.error("Users alınamadı", err);
  }
};

const [form, setForm] = useState({
  customerId: "",
  title: "",
  description: "",
  priority: "Medium",
  assignedToUserId: ""
});

  const fetchTickets = async () => {
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
    } catch (error) {
      console.error("Ticketlar alınamadı", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await ticketApi.create({
  customerId: Number(form.customerId),
  title: form.title,
  description: form.description,
  priority: form.priority,
  assignedToUserId: form.assignedToUserId
    ? Number(form.assignedToUserId)
    : null,
});

      setForm({
        customerId: "",
        title: "",
        description: "",
        priority: "Medium",
      });

      fetchTickets();
    } catch (err) {
      console.error("Ticket oluşturulamadı", err);
    }
  };
  const handleStatusChange = async (id, status) => {
  try {
    await ticketApi.updateStatus(id, status);
    fetchTickets();
  } catch (err) {
    console.error("Ticket durumu güncellenemedi", err);
  }
};
const handleDelete = async (id) => {
  if (!window.confirm("Bu ticket silinsin mi?")) return;

  try {
    await ticketApi.delete(id);
    fetchTickets();
  } catch (err) {
    console.error("Ticket silinemedi", err);
  }
};

  return (
   <div className="container-fluid p-4">
  <h2 className="fw-bold mb-1">Destek Talepleri</h2>

  <div className="card mb-4 shadow-sm">
    <div className="card-header">
      <strong>Yeni Ticket Oluştur</strong>
    </div>

    <div className="card-body">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Müşteri</label>
          <select
            className="form-select"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
          >
            <option value="">Müşteri seç</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
  <label className="form-label">Atanan</label>
  <select
    className="form-select"
    name="assignedToUserId"
    value={form.assignedToUserId || ""}
    onChange={handleChange}
  >
    <option value="">Seç</option>
    {users?.map((u) => (
      <option key={u.id} value={u.id}>
        {u.userName}
      </option>
    ))}
  </select>
</div>

        <div className="col-md-3">
          <label className="form-label">Başlık</label>
          <input
            className="form-control"
            name="title"
            placeholder="Ticket başlığı"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Açıklama</label>
          <input
            className="form-control"
            name="description"
            placeholder="Kısa açıklama"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Öncelik</label>
          <select
            className="form-select"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="col-md-1">
          <button className="btn btn-primary w-100" onClick={handleSubmit}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Müşteri</th>
            <th>Başlık</th>
            <th>Durum</th>
            <th>Öncelik</th>
            <th>Atanan</th>
            <th>İşlem</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.customerName}</td>
              <td>{t.title}</td>
              <td>
               <select
    className="form-select form-select-sm"
    value={t.status}
    onChange={(e) => handleStatusChange(t.id, e.target.value)}
  >
    <option value="Open">Open</option>
    <option value="InProgress">In Progress</option>
    <option value="Resolved">Resolved</option>
    <option value="Closed">Closed</option>
              </select>
              </td>
              <td>{t.priority}</td>
              <td>{t.assignedToUserName || "-"}</td>
              <td>
              <button
    className="btn btn-sm btn-outline-primary me-2"
    onClick={() => navigate(`/tickets/${t.id}`)}
  >
    Detay
            </button>

             <button
    className="btn btn-sm btn-outline-danger"
    onClick={() => handleDelete(t.id)}
  >
    Sil
            </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsPage;