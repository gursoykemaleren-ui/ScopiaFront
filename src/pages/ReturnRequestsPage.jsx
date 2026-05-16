import { useEffect, useState } from "react";
import {
  getAllReturnRequests,
  createReturnRequest,
  updateReturnStatus,
  deleteReturnRequest,
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
      console.error("İade talebi oluşturulamadı:", err);
      alert("İade talebi oluşturulamadı.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateReturnStatus(id, status);
      await loadData();
    } catch (err) {
      console.error("Durum güncellenemedi:", err);
      alert("Durum güncellenemedi.");
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Bu iade talebini silmek istiyor musun?")) return;

  try {
    await deleteReturnRequest(id);
    await loadData();
  } catch (err) {
    console.error("İade talebi silinemedi:", err);
    alert("İade talebi silinemedi.");
  }
};

  if (loading) return <p>Yükleniyor...</p>;

  const pending = returnRequests.filter((x) => x.status === "Pending");
  const approved = returnRequests.filter((x) => x.status === "Approved");
  const rejected = returnRequests.filter((x) => x.status === "Rejected");

  const renderTable = (data, title, type) => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Neden</th>
                <th>Açıklama</th>
                <th>Tarih</th>
                <th className="text-end">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{getCustomerName(item.customer)}</td>
                  <td>{item.reason}</td>
                  <td>{item.description || "-"}</td>
                  <td>{formatDateTimeTR(item.createdAt)}</td>
                  <td className="text-end text-nowrap">
           <div className="d-inline-flex gap-2">
           {type === "pending" ? (
            <>
            <button
             type="button"
             className="btn btn-success btn-sm"
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
          </>
        ) : (
            <button
           type="button"
           className="btn btn-secondary btn-sm"
           onClick={() => handleStatusChange(item.id, "Pending")}
          >
          Geri Çek
        </button>
       )}

       <button
       type="button"
       className="btn btn-outline-danger btn-sm"
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
</div>

        {data.length === 0 && <p className="text-muted mb-0">Kayıt yok.</p>}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4">
    <h2 className="fw-bold mb-1">İade Talepleri</h2>

     <p className="text-muted mb-0">
     Müşteri iade taleplerini oluşturabilir, bekleyen talepleri onaylayabilir veya reddedebilirsiniz.
     </p>
     </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5>Yeni İade Talebi</h5>

          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Müşteri seç</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCustomerName(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="Neden"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="Açıklama"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary mt-3">Oluştur</button>
          </form>
        </div>
      </div>

      {renderTable(pending, "Bekleyen İadeler", "pending")}
      {renderTable(approved, "Onaylanan İadeler", "approved")}
      {renderTable(rejected, "Reddedilen İadeler", "rejected")}
    </div>
  );
}

export default ReturnRequestsPage;