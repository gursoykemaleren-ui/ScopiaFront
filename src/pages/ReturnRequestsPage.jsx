import { useEffect, useState } from "react";
import {
  getAllReturnRequests,
  createReturnRequest,
  updateReturnStatus,
} from "../services/api/returnRequestApi";
import { customerApi } from "../services/api/customerApi";
import { formatDateTimeTR } from "../utils/date";

function ReturnRequestsPage() {
  const [returnRequests, setReturnRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.items?.$values)) return data.items.$values;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.result?.$values)) return data.result.$values;

    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [returnsData, customersData] = await Promise.all([
        getAllReturnRequests(),
        customerApi.getAll(),
      ]);

      console.log("returnsData:", returnsData);
      console.log("customersData:", customersData);

      setReturnRequests(normalizeList(returnsData));
      setCustomers(normalizeList(customersData));
    } catch (err) {
      console.error("Veriler alınamadı:", err);
      setReturnRequests([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCustomerName = (customer) => {
    return (
      customer?.name ||
      customer?.companyName ||
      customer?.title ||
      customer?.fullName ||
      `Müşteri #${customer?.id}`
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const payload = {
      customerId: Number(customerId),
      reason: reason.trim(),
      description: description.trim() || null,
    };

    console.log("Return request payload:", payload);

    if (!payload.customerId || !payload.reason) {
      alert("Müşteri ve iade nedeni zorunlu.");
      return;
    }

    try {
      await createReturnRequest(payload);

      setCustomerId("");
      setReason("");
      setDescription("");

      await loadData();
    } catch (err) {
      console.error("İade talebi oluşturulamadı:", err.response?.data || err);

      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : "İade talebi oluşturulurken hata oluştu."
      );
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateReturnStatus(id, status);
      await loadData();
    } catch (err) {
      console.error("İade durumu güncellenemedi:", err.response?.data || err);
      alert("İade durumu güncellenirken hata oluştu.");
    }
  };

  if (loading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }
  
  return (
    <div>
      <h2 className="fw-bold mb-1">Return Requests</h2>
      <p className="text-muted mb-4">
        Müşteri iade taleplerini oluşturun, takip edin ve sonuçlandırın.
      </p>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Yeni İade Talebi</h5>

          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Müşteri</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Müşteri seçiniz</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {getCustomerName(customer)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">İade Nedeni</label>
                <input
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Örn: Ürün hatası"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Açıklama</label>
                <input
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kısa açıklama"
                />
              </div>
            </div>

            <button className="btn btn-primary mt-3">
              İade Talebi Oluştur
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">İade Talepleri Listesi</h5>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>Neden</th>
                  <th>Açıklama</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {returnRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{getCustomerName(item.customer)}</td>
                    <td>{item.reason}</td>
                    <td>{item.description || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "Approved"
                            ? "bg-success"
                            : item.status === "Rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDateTimeTR(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleStatusChange(item.id, "Approved")}
                      >
                        Onayla
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(item.id, "Rejected")}
                      >
                        Reddet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {returnRequests.length === 0 && (
              <p className="text-muted mb-0">Henüz iade talebi yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnRequestsPage;