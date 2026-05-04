import { useEffect, useMemo, useState } from "react";
import { reportApi } from "../services/api/reportApi";
import { formatDateTR } from "../utils/date";

function ReportsPage() {
  const [reportType, setReportType] = useState("tickets");

  const [tickets, setTickets] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const getValue = (item, ...keys) => {
    for (const key of keys) {
      if (item?.[key] !== undefined && item?.[key] !== null) {
        return item[key];
      }
    }

    return "";
  };

  const getCustomerName = (item) => {
    return (
      item?.customerName ||
      item?.CustomerName ||
      item?.customer?.companyName ||
      item?.Customer?.CompanyName ||
      item?.customer?.name ||
      item?.Customer?.Name ||
      item?.companyName ||
      item?.CompanyName ||
      "-"
    );
  };

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const toExcelDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketsData, returnRequestsData] = await Promise.all([
        reportApi.getTickets(),
        reportApi.getReturnRequests(),
      ]);

      setTickets(normalizeList(ticketsData));
      setReturnRequests(normalizeList(returnRequestsData));
    } catch (err) {
      console.error("Rapor verileri alınamadı:", err);
      setError("Rapor verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const reportRows = useMemo(() => {
    if (reportType === "tickets") {
      return tickets.map((ticket) => ({
        id: getValue(ticket, "id", "Id"),
        title: getValue(ticket, "title", "Title", "subject", "Subject"),
        customerName: getCustomerName(ticket),
        status: getValue(ticket, "status", "Status"),
        priority: getValue(ticket, "priority", "Priority"),
        date: getValue(ticket, "createdAt", "CreatedAt", "updatedAt", "UpdatedAt"),
        description: getValue(ticket, "description", "Description"),
        type: "Destek Talebi",
      }));
    }

    return returnRequests.map((request) => ({
      id: getValue(request, "id", "Id"),
      title: getValue(request, "reason", "Reason", "title", "Title"),
      customerName: getCustomerName(request),
      status: getValue(request, "status", "Status"),
      priority: "",
      date: getValue(request, "createdAt", "CreatedAt", "requestDate", "RequestDate"),
      description: getValue(request, "description", "Description"),
      type: "İade Talebi",
    }));
  }, [reportType, tickets, returnRequests]);

  const statusOptions = useMemo(() => {
    const values = reportRows
      .map((row) => row.status)
      .filter((value) => value && value !== "-");

    return [...new Set(values)];
  }, [reportRows]);

  const priorityOptions = useMemo(() => {
    const values = reportRows
      .map((row) => row.priority)
      .filter((value) => value && value !== "-");

    return [...new Set(values)];
  }, [reportRows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reportRows.filter((row) => {
      const rowDateValue = toDateInputValue(row.date);

      const matchesSearch =
        !term ||
        String(row.title || "").toLowerCase().includes(term) ||
        String(row.customerName || "").toLowerCase().includes(term) ||
        String(row.description || "").toLowerCase().includes(term) ||
        String(row.status || "").toLowerCase().includes(term);

      const matchesStatus =
        !statusFilter || String(row.status) === String(statusFilter);

      const matchesPriority =
        !priorityFilter || String(row.priority) === String(priorityFilter);

      const matchesDate = !selectedDate || rowDateValue === selectedDate;

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [reportRows, search, statusFilter, priorityFilter, selectedDate]);

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearch("");
    setSelectedDate("");
  };

  const getReportTitle = () => {
    if (reportType === "tickets") return "Destek Talebi Raporu";
    return "İade Talebi Raporu";
  };

  const exportCsv = () => {
    if (filteredRows.length === 0) {
      alert("Dışa aktarılacak kayıt bulunamadı.");
      return;
    }

    const headers =
      reportType === "returns"
        ? ["ID", "Rapor Türü", "Başlık", "Müşteri", "Durum", "Tarih", "Açıklama"]
        : [
            "ID",
            "Rapor Türü",
            "Başlık",
            "Müşteri",
            "Durum",
            "Öncelik",
            "Tarih",
            "Açıklama",
          ];

    const rows = filteredRows.map((row) => {
      if (reportType === "returns") {
        return [
          row.id,
          row.type,
          row.title,
          row.customerName,
          row.status,
          toExcelDate(row.date),
          row.description,
        ];
      }

      return [
        row.id,
        row.type,
        row.title,
        row.customerName,
        row.status,
        row.priority,
        toExcelDate(row.date),
        row.description,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((line) =>
        line
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${getReportTitle().replaceAll(" ", "_")}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Raporlama</h2>
          <p className="text-muted mb-0">
            Destek talebi ve iade süreçlerine ait kayıtları filtreleyin ve dışa aktarın.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadReports}>
          Yenile
        </button>
      </div>

      {loading && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <p className="mb-0">Rapor verileri yükleniyor...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger shadow-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-3">
                  <label className="form-label">Rapor Türü</label>
                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      clearFilters();
                    }}
                  >
                    <option value="tickets">Destek Talebi Raporu</option>
                    <option value="returns">İade Talebi Raporu</option>
                  </select>
                </div>

                <div className="col-12 col-md-2">
                  <label className="form-label">Durum</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tümü</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {reportType !== "returns" && (
                  <div className="col-12 col-md-2">
                    <label className="form-label">Öncelik</label>
                    <select
                      className="form-select"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="">Tümü</option>
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-12 col-md-2">
                  <label className="form-label">Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div
                  className={
                    reportType === "returns"
                      ? "col-12 col-md-5"
                      : "col-12 col-md-3"
                  }
                >
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                  >
                    Temizle
                  </button>
                </div>

                <div className="col-12 col-md-9">
                  <label className="form-label">Arama</label>
                  <input
                    className="form-control"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Başlık, müşteri, açıklama veya durum ara..."
                  />
                </div>

                <div className="col-12 col-md-3">
                  <button className="btn btn-success w-100" onClick={exportCsv}>
                    CSV Olarak Dışa Aktar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="fw-semibold mb-0">{getReportTitle()}</h5>
                <small className="text-muted">
                  {filteredRows.length} kayıt görüntüleniyor.
                </small>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Başlık</th>
                    <th>Müşteri</th>
                    <th>Durum</th>
                    {reportType !== "returns" && <th>Öncelik</th>}
                    <th>Tarih</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={reportType === "returns" ? 6 : 7}
                        className="text-center text-muted py-4"
                      >
                        Filtrelere uygun kayıt bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => (
                      <tr key={`${row.type}-${row.id}-${index}`}>
                        <td>{row.id || "-"}</td>
                        <td className="fw-semibold">{row.title || "-"}</td>
                        <td>{row.customerName || "-"}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {row.status || "-"}
                          </span>
                        </td>

                        {reportType !== "returns" && (
                          <td>
                            <span className="badge bg-info text-dark">
                              {row.priority || "-"}
                            </span>
                          </td>
                        )}

                        <td>{row.date ? formatDateTR(row.date) : "-"}</td>

                        <td
                          style={{
                            maxWidth: 320,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row.description || ""}
                        >
                          {row.description || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsPage;