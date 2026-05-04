import { useEffect, useState } from "react";
import { customerApi } from "../services/api/customerApi";
import { ticketApi } from "../services/api/ticketApi";
import { getAllReturnRequests } from "../services/api/returnRequestApi";

function CustomerAnalysisPage() {
  const [analysisData, setAnalysisData] = useState([]);
  const [segmentFilter, setSegmentFilter] = useState("all");
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

  const getCustomerName = (customer) => {
    return (
      customer?.name ||
      customer?.companyName ||
      customer?.title ||
      customer?.fullName ||
      `Müşteri #${customer?.id}`
    );
  };

  const getCustomerId = (item) => {
    return Number(item?.customerId || item?.customer?.id || 0);
  };

  const calculateSegment = (returnCount, ticketCount) => {
    if (returnCount >= 3 || ticketCount >= 5) return "Riskli";
    if (returnCount >= 1 || ticketCount >= 2) return "Orta";
    return "İyi";
  };

  const getPotentialPrediction = (segment) => {
    if (segment === "Riskli") return "Riskli müşteri";
    if (segment === "Orta") return "Takip edilmeli";
    return "Yüksek potansiyel";
  };

  const loadAnalysis = async () => {
    try {
      setLoading(true);

      const [customersResponse, ticketsResponse, returnsResponse] =
        await Promise.all([
          customerApi.getAll(),
          ticketApi.getAll(),
          getAllReturnRequests(),
        ]);

      const customers = normalizeList(customersResponse);
      const tickets = normalizeList(ticketsResponse);
      const returns = normalizeList(returnsResponse);

      const result = customers.map((customer) => {
        const id = Number(customer.id);

        const customerTickets = tickets.filter(
          (ticket) => getCustomerId(ticket) === id
        );

        const customerReturns = returns.filter(
  (returnRequest) =>
    getCustomerId(returnRequest) === id &&
    returnRequest.status === "Approved"
);

        const ticketCount = customerTickets.length;
        const returnCount = customerReturns.length;
        const totalRequest = ticketCount + returnCount;

        const returnRate =
          totalRequest > 0
            ? ((returnCount / totalRequest) * 100).toFixed(1)
            : "0.0";

        const segment = calculateSegment(returnCount, ticketCount);

        return {
          id,
          name: getCustomerName(customer),
          totalRequest,
          returnCount,
          returnRate,
          ticketCount,
          segment,
          prediction: getPotentialPrediction(segment),
        };
      });

      setAnalysisData(result);
    } catch (err) {
      console.error("Customer analysis verileri alınamadı:", err);
      setAnalysisData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const filteredData =
    segmentFilter === "all"
      ? analysisData
      : analysisData.filter((item) => item.segment === segmentFilter);

  const goodCount = analysisData.filter((x) => x.segment === "İyi").length;
  const middleCount = analysisData.filter((x) => x.segment === "Orta").length;
  const riskyCount = analysisData.filter((x) => x.segment === "Riskli").length;

  if (loading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  return (
    <div>
      <h2 className="fw-bold">Müşteri Analizi</h2>
      <p className="text-muted">
        Müşteri iade oranı, destek yoğunluğu ve potansiyel segment analizi
      </p>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Toplam Müşteri</p>
              <h3 className="fw-bold">{analysisData.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">İyi Segment</p>
              <h3 className="fw-bold text-success">{goodCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Orta Segment</p>
              <h3 className="fw-bold text-warning">{middleCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">Riskli Segment</p>
              <h3 className="fw-bold text-danger">{riskyCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Müşteri Segmentasyon Listesi</h5>

            <select
              className="form-select"
              style={{ width: "180px" }}
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="all">Tüm Segmentler</option>
              <option value="İyi">İyi</option>
              <option value="Orta">Orta</option>
              <option value="Riskli">Riskli</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>Toplam Talep</th>
                  <th>İade Sayısı</th>
                  <th>İade Oranı</th>
                  <th>Destek Sayısı</th>
                  <th>Segment</th>
                  <th>Potansiyel Tahmin</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted">
                      Analiz edilecek müşteri verisi bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.totalRequest}</td>
                      <td>{item.returnCount}</td>
                      <td>%{item.returnRate}</td>
                      <td>{item.ticketCount}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.segment === "Riskli"
                              ? "bg-danger"
                              : item.segment === "Orta"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}
                        >
                          {item.segment}
                        </span>
                      </td>
                      <td>{item.prediction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerAnalysisPage;