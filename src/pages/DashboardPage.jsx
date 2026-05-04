import { ticketApi } from "../services/api/ticketApi";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDateTR } from "../utils/date";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const dashboardStyle = `
.dashboard-card {
  border-radius: 14px;
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.75rem 1.5rem rgba(0,0,0,0.10) !important;
}

.dashboard-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: #f1f5f9;
}

.dashboard-section-title {
  font-size: 1rem;
  font-weight: 700;
}

.dashboard-chart-box {
  height: 320px;
}

.calendar-item {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.calendar-item:hover {
  background: #ffffff;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.08);
}
`;

function DashboardPage() {
  const [summary, setSummary] = useState({
    totalJobs: 0,
    openJobs: 0,
    completedJobs: 0,
    overdueJobs: 0,
    myAssignedJobs: 0,
  });

  const [unassignedCount, setUnassignedCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  const [priorityData, setPriorityData] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });

  const [ticketSummary, setTicketSummary] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    latestTickets: [],
  });

  const [jobsPerCustomer, setJobsPerCustomer] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();

    if (s === "open") return "bg-primary";
    if (s === "inprogress" || s === "in progress") return "bg-warning text-dark";
    if (s === "completed") return "bg-success";
    if (s === "cancelled") return "bg-danger";

    return "bg-secondary";
  };

  const getPriorityBadgeClass = (priority) => {
    const p = (priority || "").toLowerCase();

    if (p === "high") return "bg-danger";
    if (p === "medium") return "bg-warning text-dark";
    if (p === "low") return "bg-success";

    return "bg-secondary";
  };

  const getCalendarBadge = (dueDateValue) => {
    if (!dueDateValue) {
      return {
        className: "bg-secondary",
        text: "Tarih yok",
      };
    }

    const today = new Date();
    const dueDate = new Date(dueDateValue);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        className: "bg-danger",
        text: `${Math.abs(diffDays)} gün gecikti`,
      };
    }

    if (diffDays === 0) {
      return {
        className: "bg-warning text-dark",
        text: "Bugün",
      };
    }

    if (diffDays <= 3) {
      return {
        className: "bg-warning text-dark",
        text: `${diffDays} gün kaldı`,
      };
    }

    return {
      className: "bg-primary",
      text: `${diffDays} gün kaldı`,
    };
  };

  const totalPriorityCount = useMemo(() => {
    return (
      (priorityData.high ?? 0) +
      (priorityData.medium ?? 0) +
      (priorityData.low ?? 0)
    );
  }, [priorityData]);

  const priorityChartData = useMemo(
    () => [
      { name: "High", value: priorityData.high ?? 0 },
      { name: "Medium", value: priorityData.medium ?? 0 },
      { name: "Low", value: priorityData.low ?? 0 },
    ],
    [priorityData]
  );

  const customerChartData = useMemo(
    () =>
      jobsPerCustomer.map((item) => ({
        name: item.customerName,
        jobCount: item.jobCount ?? 0,
      })),
    [jobsPerCustomer]
  );

  const calendarJobs = useMemo(() => {
    return recentJobs
      .filter((job) => job.dueDate || job.DueDate)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.DueDate);
        const dateB = new Date(b.dueDate || b.DueDate);
        return dateA - dateB;
      })
      .slice(0, 6);
  }, [recentJobs]);

  const PRIORITY_COLORS = ["#dc3545", "#ffc107", "#198754"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const config = { headers: getAuthHeaders() };

        const [
          summaryRes,
          unassignedRes,
          overdueRes,
          priorityRes,
          customerRes,
          recentJobsRes,
          recentActivitiesRes,
          ticketSummaryRes,
        ] = await Promise.all([
          axios.get("http://localhost:5002/api/dashboard", config),
          axios.get("http://localhost:5002/api/dashboard/unassigned", config),
          axios.get("http://localhost:5002/api/dashboard/overdue", config),
          axios.get("http://localhost:5002/api/dashboard/jobs-by-priority", config),
          axios.get("http://localhost:5002/api/dashboard/jobs-per-customer", config),
          axios.get("http://localhost:5002/api/dashboard/recent-jobs", config),
          axios.get("http://localhost:5002/api/dashboard/recent-activities", config),
          ticketApi.getSummary(),
        ]);

        const summaryData = summaryRes.data ?? {};
        const unassignedData = unassignedRes.data ?? {};
        const overdueData = overdueRes.data ?? {};
        const priorityResult = priorityRes.data ?? {};

        const customerResult = Array.isArray(customerRes.data)
          ? customerRes.data
          : [];

        const recentJobsResult = Array.isArray(recentJobsRes.data)
          ? recentJobsRes.data
          : [];

        const recentActivitiesResult = Array.isArray(recentActivitiesRes.data)
          ? recentActivitiesRes.data
          : [];

        const ticketSummaryData = ticketSummaryRes ?? {};

        setSummary({
          totalJobs: summaryData.totalJobs ?? 0,
          openJobs: summaryData.openJobs ?? 0,
          completedJobs: summaryData.completedJobs ?? 0,
          overdueJobs: summaryData.overdueJobs ?? 0,
          myAssignedJobs: summaryData.myAssignedJobs ?? 0,
        });

        setUnassignedCount(unassignedData.count ?? 0);
        setOverdueCount(overdueData.count ?? summaryData.overdueJobs ?? 0);

        setPriorityData({
          high: priorityResult.high ?? 0,
          medium: priorityResult.medium ?? 0,
          low: priorityResult.low ?? 0,
        });

        setTicketSummary({
          total: ticketSummaryData.total ?? 0,
          open: ticketSummaryData.open ?? 0,
          inProgress: ticketSummaryData.inProgress ?? 0,
          resolved: ticketSummaryData.resolved ?? 0,
          closed: ticketSummaryData.closed ?? 0,
          critical: ticketSummaryData.critical ?? 0,
          latestTickets: ticketSummaryData.latestTickets ?? [],
        });

        setJobsPerCustomer(customerResult);
        setRecentJobs(recentJobsResult);
        setRecentActivities(recentActivitiesResult);
      } catch (err) {
        console.error("Dashboard verisi alınamadı:", err);
        setError("Dashboard verileri yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const mainKpis = [
    {
      title: "Toplam İş",
      value: summary.totalJobs,
      icon: "📋",
      sub: "Sistemdeki toplam iş",
      border: "primary",
    },
    {
      title: "Açık İşler",
      value: summary.openJobs,
      icon: "🟦",
      sub: "Devam eden işler",
      border: "info",
    },
    {
      title: "Tamamlanan İşler",
      value: summary.completedJobs,
      icon: "✅",
      sub: "Kapatılmış işler",
      border: "success",
    },
    {
      title: "Toplam Destek Talebi",
      value: ticketSummary.total,
      icon: "🎫",
      sub: "Sistemdeki ticket sayısı",
      border: "primary",
    },
  ];

  const secondaryKpis = [
    {
      title: "Geciken İşler",
      value: summary.overdueJobs,
      icon: "⏰",
      sub: "Termin tarihi geçmiş işler",
      border: "danger",
    },
    {
      title: "Atanmamış İşler",
      value: unassignedCount,
      icon: "👤",
      sub: "Henüz kullanıcıya atanmamış",
      border: "warning",
    },
    {
      title: "Bana Atanan İşler",
      value: summary.myAssignedJobs,
      icon: "🧑‍💻",
      sub: "Kullanıcıya atanmış işler",
      border: "dark",
    },
    {
      title: "Açık Ticket",
      value: ticketSummary.open,
      icon: "🟠",
      sub: "Açık destek talepleri",
      border: "warning",
    },
    {
      title: "Kritik Ticket",
      value: ticketSummary.critical,
      icon: "🚨",
      sub: "Kritik öncelikli talepler",
      border: "danger",
    },
  ];

  return (
    <>
      <style>{dashboardStyle}</style>

      <div className="container-fluid py-3">
        <div className="mb-4">
          <h2 className="mb-1 fw-bold">Ana Grafikler</h2>
          <p className="text-muted mb-0">
            Genel durum, iş yoğunluğu, yaklaşan teslim tarihleri ve son aktiviteler
          </p>
        </div>

        {loading && (
          <div className="card shadow-sm border-0 dashboard-card">
            <div className="card-body py-4">
              <p className="mb-0">Dashboard yükleniyor...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger shadow-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="row g-4 mb-4">
              {mainKpis.map((card) => (
                <div className="col-12 col-sm-6 col-xl-3" key={card.title}>
                  <div
                    className={`card h-100 shadow-sm border-start border-4 border-${card.border} dashboard-card`}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <div className="text-muted small mb-1">{card.title}</div>
                          <h3 className="fw-bold mb-1">{card.value}</h3>
                          <div className="text-muted small">{card.sub}</div>
                        </div>

                        <div className="dashboard-icon">{card.icon}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-3 mb-4">
              {secondaryKpis.map((card) => (
                <div className="col-12 col-sm-6 col-xl" key={card.title}>
                  <div
                    className={`card h-100 shadow-sm border-start border-4 border-${card.border} dashboard-card`}
                  >
                    <div className="card-body py-3">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div>
                          <div className="text-muted small">{card.title}</div>
                          <div className="fw-bold fs-5">{card.value}</div>
                          <div className="text-muted small">{card.sub}</div>
                        </div>
                        <div style={{ fontSize: "1.3rem" }}>{card.icon}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12 col-lg-6">
                <div className="alert alert-danger shadow-sm mb-0 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Geciken İş Uyarısı</h6>
                      <div>
                        Termin tarihi geçmiş <strong>{overdueCount}</strong> iş var.
                      </div>
                    </div>
                    <div className="fs-3">⚠️</div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="alert alert-warning shadow-sm mb-0 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Atanmamış İş Uyarısı</h6>
                      <div>
                        Henüz kullanıcıya atanmamış{" "}
                        <strong>{unassignedCount}</strong> iş var.
                      </div>
                    </div>
                    <div className="fs-3">📌</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12 col-xl-4">
                <div className="card shadow-sm border-0 h-100 dashboard-card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="dashboard-section-title">
                        Öncelik Bazlı İş Dağılımı
                      </div>
                      <div className="text-muted small">
                        İşlerin öncelik seviyelerine göre dağılımı
                      </div>
                    </div>

                    <div className="dashboard-chart-box">
                      {totalPriorityCount === 0 ? (
                        <p className="text-muted mb-0">Veri bulunamadı.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={priorityChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="48%"
                              outerRadius={95}
                              label
                            >
                              {priorityChartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    PRIORITY_COLORS[
                                      index % PRIORITY_COLORS.length
                                    ]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-8">
                <div className="card shadow-sm border-0 h-100 dashboard-card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="dashboard-section-title">
                        Müşteri Bazlı İş Yoğunluğu
                      </div>
                      <div className="text-muted small">
                        Müşterilere göre açılan iş sayıları
                      </div>
                    </div>

                    <div className="dashboard-chart-box">
                      {!customerChartData.length ? (
                        <p className="text-muted mb-0">Veri bulunamadı.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={customerChartData}
                            margin={{
                              top: 10,
                              right: 20,
                              left: 0,
                              bottom: 45,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-18}
                              textAnchor="end"
                              interval={0}
                              height={65}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar
                              dataKey="jobCount"
                              fill="#0d6efd"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 dashboard-card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <div>
                    <div className="dashboard-section-title">
                      Yaklaşan İş Takvimi
                    </div>
                    <div className="text-muted small">
                      Son teslim tarihi yaklaşan ve geciken işler
                    </div>
                  </div>

                  <span className="badge bg-light text-dark border">
                    {calendarJobs.length} kayıt
                  </span>
                </div>

                {!calendarJobs.length ? (
                  <p className="text-muted mb-0">
                    Takvimde gösterilecek son teslim tarihli iş bulunamadı.
                  </p>
                ) : (
                  <div className="row g-3">
                    {calendarJobs.map((job) => {
                      const dueDateValue = job.dueDate || job.DueDate;
                      const badge = getCalendarBadge(dueDateValue);

                      return (
                        <div className="col-12 col-md-6 col-xl-4" key={job.id}>
                          <div className="calendar-item p-3 h-100">
                            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                              <div>
                                <div className="fw-bold">
                                  {job.title || "Başlıksız İş"}
                                </div>
                                <div className="text-muted small">
                                  {job.customerName || "Müşteri bilgisi yok"}
                                </div>
                              </div>

                              <span className={`badge ${badge.className}`}>
                                {badge.text}
                              </span>
                            </div>

                            <div className="text-muted small mb-2">
                              Teslim Tarihi: {formatDateTR(dueDateValue)}
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  job.status
                                )}`}
                              >
                                {job.status || "Durum yok"}
                              </span>

                              <span
                                className={`badge ${getPriorityBadgeClass(
                                  job.priority
                                )}`}
                              >
                                {job.priority || "Öncelik yok"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12 col-xl-6">
                <div className="card shadow-sm border-0 h-100 dashboard-card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="dashboard-section-title">Son İşler</div>
                      <div className="text-muted small">
                        Son eklenen veya güncellenen işler
                      </div>
                    </div>

                    {!recentJobs.length ? (
                      <p className="text-muted mb-0">Kayıt bulunamadı.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Başlık</th>
                              <th>Müşteri</th>
                              <th>Durum</th>
                              <th>Öncelik</th>
                              <th>Oluşturulma</th>
                            </tr>
                          </thead>

                          <tbody>
                            {recentJobs.slice(0, 5).map((job) => (
                              <tr key={job.id}>
                                <td className="fw-semibold">{job.title}</td>
                                <td>{job.customerName ?? "-"}</td>
                                <td>
                                  <span
                                    className={`badge ${getStatusBadgeClass(
                                      job.status
                                    )}`}
                                  >
                                    {job.status ?? "-"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${getPriorityBadgeClass(
                                      job.priority
                                    )}`}
                                  >
                                    {job.priority ?? "-"}
                                  </span>
                                </td>
                                <td>{formatDateTR(job.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-6">
                <div className="card shadow-sm border-0 h-100 dashboard-card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="dashboard-section-title">
                        Son Aktiviteler
                      </div>
                      <div className="text-muted small">
                        Sistemdeki son hareketler
                      </div>
                    </div>

                    {!recentActivities.length ? (
                      <p className="text-muted mb-0">Kayıt bulunamadı.</p>
                    ) : (
                      <div>
                        {recentActivities.slice(0, 6).map((activity, index) => (
                          <div
                            key={activity.id ?? index}
                            className={`d-flex gap-3 py-3 ${
                              index !== recentActivities.slice(0, 6).length - 1
                                ? "border-bottom"
                                : ""
                            }`}
                          >
                            <div className="flex-shrink-0 pt-1">
                              <div
                                className="rounded-circle bg-primary"
                                style={{ width: "11px", height: "11px" }}
                              ></div>
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                  <div className="fw-semibold">
                                    {activity.message ||
                                      activity.type ||
                                      "Aktivite"}
                                  </div>

                                  <div className="text-muted small mt-1">
                                    {activity.jobTitle
                                      ? `İş: ${activity.jobTitle}`
                                      : activity.type || "-"}
                                  </div>

                                  {activity.performedByUserName && (
                                    <div className="text-muted small">
                                      Kullanıcı: {activity.performedByUserName}
                                    </div>
                                  )}
                                </div>

                                <div className="text-muted small text-end">
                                  {formatDateTR(activity.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default DashboardPage;