import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDateTimeTR, formatDateTR } from "../../utils/date";

function CustomerListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5002/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data.items;
      setCustomers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Customers alınamadı:", err);
      setError("Customers verisi alınırken hata oluştu.");
    }
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        await fetchCustomers();
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      city: "",
      address: "",
      notes: "",
    });
  };

  const deleteCustomer = async (id) => {
  const confirmDelete = window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?");

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5002/api/Customers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // listeyi yeniden yükle
    fetchCustomers();
  } catch (err) {
    console.error("Customer silme hatası:", err);
    alert("Müşteri silinirken hata oluştu.");
  }
};

const restoreCustomer = async (id) => {
  const confirmRestore = window.confirm("Bu müşteriyi geri yüklemek istiyor musunuz?");

  if (!confirmRestore) return;

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `http://localhost:5002/api/Customers/${id}/restore`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await fetchCustomers();
    alert("Müşteri geri yüklendi.");
  } catch (err) {
    console.error("Customer restore hatası:", err);
    alert("Müşteri geri yüklenirken hata oluştu.");
  }
};


  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      const payload = {
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        address: form.address,
        notes: form.notes,
      };

      await axios.post("http://localhost:5002/api/customers", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      resetForm();
      setShowModal(false);
      await fetchCustomers();
    } catch (err) {
      console.error("Customer oluşturulamadı:", err);
      setError("Customer oluşturulurken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1 fw-bold">Müşteri Yönetimi</h2>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Yeni Customer
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : customers.length === 0 ? (
            <p className="mb-0">Kayıt bulunamadı.</p>
          ) : (
            <table className="table table-striped mb-0">
              <thead>
  <tr>
    <th>ID</th>
    <th>Company</th>
    <th>Email</th>
    <th>Phone</th>
    <th>City</th>
    <th>Actions</th>
  </tr>
</thead>
              <tbody>
  {customers.map((c) => (
    <tr key={c.id}>
      <td>{c.id}</td>
      <td>{c.companyName ?? "-"}</td>
      <td>{c.email ?? "-"}</td>
      <td>{c.phone ?? "-"}</td>
      <td>{c.city ?? "-"}</td>
      <td>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate(`/customers/${c.id}`)}
        >
          Detay
        </button>
        <button
    className="btn btn-sm btn-outline-danger"
    onClick={() => deleteCustomer(c.id)}
  >
    Sil
  </button>
</td>
      
    </tr>
  ))}
</tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleCreateCustomer}>
                  <div className="modal-header">
                    <h5 className="modal-title">Yeni Customer</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="contactName"
                          value={form.contactName}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Kapat
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerListPage;