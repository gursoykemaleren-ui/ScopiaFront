import { customerInteractionApi } from "../../services/api/customerInteractionsApi";
import { ticketApi } from "../../services/api/ticketApi";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateTimeTR } from "../../utils/date";

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editingInteractionId, setEditingInteractionId] = useState(null);
  const [editingInteractionText, setEditingInteractionText] = useState("");


  const [tickets, setTickets] = useState([]);

  const [interactions, setInteractions] = useState([]);
  const [interactionText, setInteractionText] = useState("");

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactForm, setContactForm] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    mobilePhone: "",
    notes: "",
    isPrimary: false,
  });
  const startEditInteraction = (interaction) => {
  setEditingInteractionId(interaction.id);
  setEditingInteractionText(interaction.description ?? "");
};

const cancelEditInteraction = () => {
  setEditingInteractionId(null);
  setEditingInteractionText("");
};

const handleUpdateInteraction = async (interaction) => {
  if (!editingInteractionText.trim()) return;

  try {
    await customerInteractionApi.update(interaction.id, {
      title: interaction.title || "Görüşme Notu",
      description: editingInteractionText.trim(),
      interactionType: interaction.interactionType || "Note",
      interactionDate: interaction.interactionDate,
    });

    setEditingInteractionId(null);
    setEditingInteractionText("");
    await fetchInteractions();
  } catch (err) {
    console.error("Interaction güncellenemedi:", err);
    alert("Görüşme notu güncellenemedi.");
  }
};

const handleDeleteInteraction = async (id) => {
  if (!window.confirm("Bu görüşme notu silinsin mi?")) return;

  try {
    await customerInteractionApi.delete(id);
    await fetchInteractions();
  } catch (err) {
    console.error("Interaction silinemedi:", err);
    alert("Görüşme notu silinemedi.");
  }
};


  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactUpdating, setContactUpdating] = useState(false);
  const [editContactId, setEditContactId] = useState(null);
  const [editContactForm, setEditContactForm] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
    isPrimary: false,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const openEditContactModal = (contact) => {
  setEditContactId(contact.id);
  setEditContactForm({
    fullName: contact.fullName ?? "",
    title: contact.title ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? contact.mobilePhone ?? "",
    notes: contact.notes ?? "",
    isPrimary: contact.isPrimary ?? false,
  });
  setShowEditContactModal(true);
};

  const filteredContacts = contacts.filter((c) => {
    const search = contactSearch.toLowerCase().trim();

    if (!search) return true;

    return (
      (c.fullName ?? "").toLowerCase().includes(search) ||
      (c.title ?? "").toLowerCase().includes(search) ||
      (c.email ?? "").toLowerCase().includes(search) ||
      (c.mobilePhone ?? "").toLowerCase().includes(search)
    );
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5002/api/customers/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setCustomer(response.data);
    } catch (err) {
      console.error("Customer detayı alınamadı:", err);
      setError("Customer detayı alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  const fetchTickets = async () => {
  try {
    const data = await ticketApi.getByCustomer(id);
    setTickets(data);
  } catch (err) {
    console.error("Ticketlar alınamadı", err);
  }
};
const fetchInteractions = async () => {
  try {
    const data = await customerInteractionApi.getByCustomer(id);
    setInteractions(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Interactions alınamadı:", err);
    setInteractions([]);
  }
};

  const fetchContacts = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `http://localhost:5002/api/customers/${id}/contacts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = response.data?.items ?? response.data ?? [];
    const normalizedContacts = Array.isArray(result)
      ? result.map((contact) => ({
          ...contact,
          phone: contact.phone ?? contact.mobilePhone ?? "",
        }))
      : [];

    setContacts(normalizedContacts);
  } catch (err) {
    console.error("Contacts alınamadı:", err);

    if (err.response?.status === 404) {
      setContacts([]);
      return;
    }
  }
};
const handleAddInteraction = async () => {
  if (!interactionText.trim()) return;

  try {
    await customerInteractionApi.create({
      customerId: Number(id),
      title: "Görüşme Notu",
      description: interactionText.trim(),
      interactionType: "Note",
      interactionDate: new Date().toISOString(),
    });

    setInteractionText("");
    await fetchInteractions();
  } catch (err) {
    console.error("Interaction eklenemedi:", err);
    alert("Görüşme notu eklenemedi.");
  }
};

  const handleDeleteContact = async (contactId) => {
    const confirmDelete = window.confirm(
      "Bu contact kaydını silmek istediğinize emin misiniz?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5002/api/customer-contacts/${contactId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setContacts((prev) => prev.filter((x) => x.id !== contactId));

      try {
        await fetchContacts();
      } catch {
        // liste local state ile zaten güncellendi
      }
    } catch (err) {
      console.error("Contact silinemedi:", err);
      alert("Contact silinirken hata oluştu.");
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchContacts();
    fetchTickets();
    fetchInteractions();
  }, [id]);

  useEffect(() => {
    if (customer) {
      setEditForm({
        companyName: customer.companyName || "",
        contactName: customer.contactName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;

    setContactForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditContactChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditContactForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleCreateContact = async (e) => {
  e.preventDefault();

  if (contactSaving) return;

  setContactSaving(true);

  try {
    await axios.post(
      `http://localhost:5002/api/customers/${id}/contacts`,
      {
        fullName: contactForm.fullName.trim(),
        title: contactForm.title,
        email: contactForm.email,
        phone: contactForm.phone,
        mobilePhone: contactForm.mobilePhone || contactForm.phone,
        notes: contactForm.notes,
        isPrimary: contactForm.isPrimary,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    await fetchContacts();

    setContactForm({
      fullName: "",
      title: "",
      email: "",
      phone: "",
      mobilePhone: "",
      notes: "",
      isPrimary: false,
    });

    setShowContactModal(false);
  } catch (err) {
    console.error("Contact ekleme isteğinde hata:", err);

    // Backend 500 dönüyor ama kayıt veritabanına düşüyor.
    // Bu yüzden tekrar listeyi çekip modalı kapatıyoruz.
    await fetchContacts();

    setContactForm({
      fullName: "",
      title: "",
      email: "",
      phone: "",
      mobilePhone: "",
      notes: "",
      isPrimary: false,
    });

    setShowContactModal(false);
  } finally {
    setContactSaving(false);
  }
};

  const handleUpdateContact = async (e) => {
  e.preventDefault();

  try {
    setContactUpdating(true);

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5002/api/customer-contacts/${editContactId}`,
      {
        fullName: editContactForm.fullName,
        title: editContactForm.title,
        email: editContactForm.email,
        phone: editContactForm.phone,
        notes: editContactForm.notes,
        isPrimary: editContactForm.isPrimary,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setShowEditContactModal(false);
    setEditContactId(null);

    await fetchContacts();
  } catch (err) {
    console.error("Contact güncellenirken hata oluştu:", err);
    alert("Contact güncellenemedi.");
  } finally {
    setContactUpdating(false);
  }
};

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);

      await axios.put(`http://localhost:5002/api/customers/${id}`, editForm, {
        headers: getAuthHeaders(),
      });

      await fetchCustomer();
      setShowEditModal(false);
    } catch (err) {
      console.error("Customer güncellenemedi:", err);
      alert("Customer güncellenirken hata oluştu.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!customer) {
    return <p>Kayıt bulunamadı.</p>;
  }

  return (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">Customer Detail</h2>

      <div className="d-flex gap-2">
        <button
          className="btn btn-warning"
          onClick={() => setShowEditModal(true)}
        >
          Düzenle
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/customers")}
        >
          Geri
        </button>
      </div>
    </div>

    {/* Customer Info */}
    <div className="card">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <strong>ID</strong>
            <div>{customer.id}</div>
          </div>

          <div className="col-md-6">
            <strong>Company Name</strong>
            <div>{customer.companyName ?? "-"}</div>
          </div>

          <div className="col-md-6">
            <strong>Contact Name</strong>
            <div>{customer.contactName ?? "-"}</div>
          </div>

          <div className="col-md-6">
            <strong>Email</strong>
            <div>{customer.email ?? "-"}</div>
          </div>

          <div className="col-md-6">
            <strong>Phone</strong>
            <div>{customer.phone ?? "-"}</div>
          </div>

          <div className="col-md-6">
            <strong>City</strong>
            <div>{customer.city ?? "-"}</div>
          </div>

          <div className="col-md-12">
            <strong>Address</strong>
            <div>{customer.address ?? "-"}</div>
          </div>

          <div className="col-md-12">
            <strong>Notes</strong>
            <div>{customer.notes ?? "-"}</div>
          </div>

          <div className="col-md-6">
            <strong>Is Active</strong>
            <div>{customer.isActive ? "Yes" : "No"}</div>
          </div>

          <div className="col-md-6">
            <strong>Created At</strong>
            <div>{formatDateTimeTR(customer.createdAt)}</div>
          </div>

          <div className="col-md-6">
            <strong>Updated At</strong>
            <div>{formatDateTimeTR(customer.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>

    {/* Contacts */}
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="mb-0">Contacts ({filteredContacts.length})</h5>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Contact ara..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              style={{ width: "220px" }}
            />

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setShowContactModal(true)}
            >
              Yeni Contact
            </button>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <p className="text-muted mb-0">
            {contactSearch.trim()
              ? "Aramaya uygun contact bulunamadı."
              : "Contact bulunamadı."}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Title</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Primary</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredContacts.map((c) => (
                  <tr key={c.id} className={c.isPrimary ? "table-success" : ""}>
                    <td>{c.fullName ?? "-"}</td>
                    <td>{c.title ?? "-"}</td>
                    <td>
                      {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "-"}
                    </td>
                    <td>{c?.phone || c?.mobilePhone || "-"}</td>
                    <td>
                      {c.isPrimary ? (
                        <span className="badge bg-success">Primary</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditContactModal(c)}
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteContact(c.id)}
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

    {/* Customer Interactions */}
    {/* Customer Interactions */}
<div className="card mt-4">
  <div className="card-header">
    <strong>Müşteri Görüşmeleri</strong>
  </div>

  <div className="card-body">
    <div className="d-flex gap-2 mb-3">
      <input
        className="form-control"
        placeholder="Not ekle..."
        value={interactionText}
        onChange={(e) => setInteractionText(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleAddInteraction}>
        Ekle
      </button>
    </div>

    {interactions.length === 0 ? (
      <p className="text-muted mb-0">Henüz görüşme kaydı yok.</p>
    ) : (
      <ul className="list-group">
        {interactions.map((i) => (
          <li key={i.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <strong>{i.title}</strong>
                  <small className="text-muted">
                    {formatDateTimeTR(i.interactionDate)}
                  </small>
                </div>

                {editingInteractionId === i.id ? (
                  <div className="mt-2">
                    <input
                      className="form-control form-control-sm mb-2"
                      value={editingInteractionText}
                      onChange={(e) =>
                        setEditingInteractionText(e.target.value)
                      }
                    />

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateInteraction(i)}
                      >
                        Kaydet
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEditInteraction}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">{i.description}</div>
                )}
              </div>

              {editingInteractionId !== i.id && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => startEditInteraction(i)}
                  >
                    Düzenle
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteInteraction(i.id)}
                  >
                    Sil
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

{/* Customer Tickets */}
<div className="card mt-4">
  <div className="card-header">
    <strong>Bu Müşteriye Ait Ticketlar</strong>
  </div>

  <div className="card-body p-0">
    <table className="table table-bordered mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Başlık</th>
          <th>Durum</th>
          <th>Öncelik</th>
          <th>Tarih</th>
        </tr>
      </thead>

      <tbody>
        {tickets.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center text-muted py-3">
              Bu müşteriye ait ticket bulunamadı.
            </td>
          </tr>
        ) : (
          tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
              <td>{formatDateTimeTR(t.createdAt)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      {showEditModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleUpdateCustomer}>
                <div className="modal-header">
                  <h5 className="modal-title">Customer Düzenle</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
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
                        value={editForm.companyName}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contact Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contactName"
                        value={editForm.contactName}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={editForm.city}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        rows="3"
                        value={editForm.notes}
                        onChange={handleEditChange}
                      />
                    </div>
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

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateContact}>
                <div className="modal-header">
                  <h5 className="modal-title">Yeni Contact</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowContactModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={contactForm.fullName}
                      onChange={handleContactChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={contactForm.title}
                      onChange={handleContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      rows="3"
                      value={contactForm.notes}
                      onChange={handleContactChange}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isPrimary"
                      checked={contactForm.isPrimary}
                      onChange={handleContactChange}
                      id="isPrimary"
                    />
                    <label className="form-check-label" htmlFor="isPrimary">
                      Primary Contact
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowContactModal(false)}
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactSaving}
                  >
                    {contactSaving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditContactModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateContact}>
                <div className="modal-header">
                  <h5 className="modal-title">Contact Düzenle</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditContactModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={editContactForm.fullName}
                      onChange={handleEditContactChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={editContactForm.title}
                      onChange={handleEditContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editContactForm.email}
                      onChange={handleEditContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={editContactForm.phone}
                      onChange={handleEditContactChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      rows="3"
                      value={editContactForm.notes}
                      onChange={handleEditContactChange}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isPrimary"
                      checked={editContactForm.isPrimary}
                      onChange={handleEditContactChange}
                      id="editIsPrimary"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="editIsPrimary"
                    >
                      Primary Contact
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditContactModal(false)}
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactUpdating}
                  >
                    {contactUpdating ? "Güncelleniyor..." : "Güncelle"}
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

export default CustomerDetailPage;
