import { useEffect, useMemo, useState } from "react";
import { accountingApi } from "../services/api/accountingApi";
import { customerApi } from "../services/api/customerApi";

const initialForm = {
  customerId: "",
  type: "Income",
  category: "Hizmet Bedeli",
  title: "",
  amount: "",
  vatRate: "20",
  discountRate: "0",
  transactionDate: "",
  description: "",
};

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function AccountingPage() {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterType, setFilterType] = useState("All");

  const loadData = async () => {
    try {
      const [transactionData, summaryData, customerData] = await Promise.all([
        accountingApi.getAll(),
        accountingApi.getSummary(),
        customerApi.getAll(),
      ]);

      const normalizedCustomers = Array.isArray(customerData)
        ? customerData
        : Array.isArray(customerData?.items)
        ? customerData.items
        : [];

      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setSummary(summaryData || {});
      setCustomers(normalizedCustomers);
    } catch (err) {
      console.error("Ön muhasebe verileri alınamadı:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculated = useMemo(() => {
    const amount = Number(form.amount || 0);
    const vatRate = Number(form.vatRate || 0);
    const discountRate = Number(form.discountRate || 0);

    const discountAmount = (amount * discountRate) / 100;
    const amountAfterDiscount = amount - discountAmount;
    const vatAmount = (amountAfterDiscount * vatRate) / 100;
    const totalAmount = amountAfterDiscount + vatAmount;

    return {
      discountAmount,
      vatAmount,
      totalAmount,
    };
  }, [form.amount, form.vatRate, form.discountRate]);

  const filteredTransactions = useMemo(() => {
  if (filterType === "Income") {
    return transactions.filter((item) => item.type === "Income");
  }

  if (filterType === "Expense") {
    return transactions.filter((item) => item.type === "Expense");
  }

  return transactions;
}, [transactions, filterType]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId) {
      alert("Lütfen müşteri seçiniz.");
      return;
    }

    if (!form.title.trim()) {
      alert("Lütfen başlık giriniz.");
      return;
    }

    if (Number(form.amount || 0) <= 0) {
      alert("Tutar sıfırdan büyük olmalıdır.");
      return;
    }

    const payload = {
      customerId: Number(form.customerId),
      type: form.type,
      category: form.category,
      title: form.title.trim(),
      amount: Number(form.amount),
      vatRate: Number(form.vatRate || 0),
      discountRate: Number(form.discountRate || 0),
      transactionDate: form.transactionDate || null,
      description: form.description || "",
    };

    try {
      if (editingId) {
        await accountingApi.update(editingId, payload);
      } else {
        await accountingApi.create(payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Muhasebe kaydı kaydedilemedi:", err);
      alert(editingId ? "Kayıt güncellenemedi." : "Kayıt oluşturulamadı.");
    }
  };

  const handleShowDetail = (item) => {
    setSelectedTransaction(item);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      customerId: String(item.customerId || ""),
      type: item.type || "Income",
      category: item.category || "",
      title: item.title || "",
      amount: String(item.amount || ""),
      vatRate: String(item.vatRate || 0),
      discountRate: String(item.discountRate || 0),
      transactionDate: item.transactionDate
        ? item.transactionDate.substring(0, 10)
        : "",
      description: item.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Silmek istiyor musunuz?")) return;

    try {
      await accountingApi.delete(id);
      await loadData();
    } catch (err) {
      console.error("Muhasebe kaydı silinemedi:", err);
      alert("Kayıt silinemedi.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Ön Muhasebe Yönetimi</h2>
          <p className="text-muted mb-0">
            Gelir, gider ve temel finansal işlemler
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Toplam Gelir</div>
              <h4 className="fw-bold mb-0">
                {formatMoney(summary.totalIncome)}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Toplam Gider</div>
              <h4 className="fw-bold mb-0">
                {formatMoney(summary.totalExpense)}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Net Bakiye</div>
              <h4 className="fw-bold mb-0">
                {formatMoney(summary.netBalance)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {editingId ? "Kaydı Düzenle" : "Yeni Kayıt"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Müşteri</label>
                  <select
                    className="form-select"
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                  >
                    <option value="">Müşteri seçiniz</option>
                    {customers.map((c) => (
                      <option key={c.id || c.customerId} value={c.id || c.customerId}>
                        {c.companyName ||
                          c.name ||
                          c.contactName ||
                          `Müşteri #${c.id || c.customerId}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">İşlem Türü</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="Income">Gelir</option>
                    <option value="Expense">Gider</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Kategori</label>
                  <input
                    className="form-control"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Örn: Hizmet Bedeli"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Başlık</label>
                  <input
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Örn: Bakım hizmeti"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Tutar</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">KDV %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="form-control"
                      name="vatRate"
                      value={form.vatRate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">İndirim %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="form-control"
                      name="discountRate"
                      value={form.discountRate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3 mt-3">
                  <label className="form-label">İşlem Tarihi</label>
                  <input
                    type="date"
                    className="form-control"
                    name="transactionDate"
                    value={form.transactionDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="İsteğe bağlı açıklama"
                  />
                </div>

                <div className="border rounded p-3 bg-light my-3">
                  <div className="d-flex justify-content-between">
                    <span>İndirim</span>
                    <strong>{formatMoney(calculated.discountAmount)}</strong>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span>KDV</span>
                    <strong>{formatMoney(calculated.vatAmount)}</strong>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Genel Toplam</span>
                    <strong>{formatMoney(calculated.totalAmount)}</strong>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary w-100">
                    {editingId ? "Güncelle" : "Kaydı Oluştur"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Finansal Kayıtlar</h5>
             <select
              className="form-select form-select-sm"
             style={{ maxWidth: "180px" }}
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             >
             <option value="All">Tüm Kayıtlar</option>
             <option value="Income">Sadece Gelirler</option>
             <option value="Expense">Sadece Giderler</option>
             </select>
             </div>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Müşteri</th>
                      <th>Tür</th>
                      <th>Başlık</th>
                      <th>Toplam</th>
                      <th className="text-end">İşlemler</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.customerName}</td>

                        <td>
                          <span
                            className={
                              item.type === "Income"
                                ? "badge bg-success"
                                : "badge bg-danger"
                            }
                          >
                            {item.type === "Income" ? "Gelir" : "Gider"}
                          </span>
                        </td>

                        <td>{item.title}</td>

                        <td>{formatMoney(item.totalAmount)}</td>

                        <td>
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => handleShowDetail(item)}
                            >
                              Detay
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(item)}
                            >
                              Düzenle
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item.id)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                <p className="text-muted mb-0">
                Seçilen filtreye uygun kayıt bulunmuyor.
                </p>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    Finansal Kayıt Detayı
                  </h5>
                  <small className="text-muted">
                    İşlem bilgileri ve hesaplama detayları
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseDetail}
                />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100 bg-light">
                      <small className="text-muted d-block mb-1">Müşteri</small>
                      <div className="fw-semibold">
                        {selectedTransaction.customerName || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100 bg-light">
                      <small className="text-muted d-block mb-1">
                        İşlem Türü
                      </small>
                      <span
                        className={
                          selectedTransaction.type === "Income"
                            ? "badge bg-success"
                            : "badge bg-danger"
                        }
                      >
                        {selectedTransaction.type === "Income"
                          ? "Gelir"
                          : "Gider"}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted d-block mb-1">Kategori</small>
                      <div className="fw-semibold">
                        {selectedTransaction.category || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 h-100">
                      <small className="text-muted d-block mb-1">Başlık</small>
                      <div className="fw-semibold">
                        {selectedTransaction.title || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded p-3">
                      <small className="text-muted d-block mb-1">
                        Açıklama
                      </small>
                      <div>{selectedTransaction.description || "-"}</div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center h-100">
                      <small className="text-muted d-block mb-1">
                        Ana Tutar
                      </small>
                      <h5 className="fw-bold mb-0">
                        {formatMoney(selectedTransaction.amount)}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center h-100">
                      <small className="text-muted d-block mb-1">
                        KDV Oranı
                      </small>
                      <h5 className="fw-bold mb-0">
                        %{selectedTransaction.vatRate || 0}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center h-100">
                      <small className="text-muted d-block mb-1">
                        İndirim Oranı
                      </small>
                      <h5 className="fw-bold mb-0">
                        %{selectedTransaction.discountRate || 0}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center h-100">
                      <small className="text-muted d-block mb-1">
                        İşlem Tarihi
                      </small>
                      <div className="fw-semibold">
                        {formatDate(selectedTransaction.transactionDate)}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="border rounded p-4 text-center bg-light h-100">
                      <small className="text-muted d-block mb-1">
                        İndirim Tutarı
                      </small>
                      <h4 className="fw-bold mb-0 text-danger">
                        {formatMoney(selectedTransaction.discountAmount)}
                      </h4>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="border rounded p-4 text-center bg-light h-100">
                      <small className="text-muted d-block mb-1">
                        KDV Tutarı
                      </small>
                      <h4 className="fw-bold mb-0 text-primary">
                        {formatMoney(selectedTransaction.vatAmount)}
                      </h4>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="border rounded p-4 text-center bg-dark text-white h-100">
                      <small className="d-block mb-1">Genel Toplam</small>
                      <h3 className="fw-bold mb-0">
                        {formatMoney(selectedTransaction.totalAmount)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDetail}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountingPage;