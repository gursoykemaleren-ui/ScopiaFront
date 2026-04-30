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
      title: "Total Jobs",
      value: summary.totalJobs,
      icon: "📋",
      sub: "Toplam iş",
      border: "primary",
    },
    {
      title: "Open Jobs",
      value: summary.openJobs,
      icon: "🟦",
      sub: "Açık işler",
      border: "info",
    },
    {
      title: "Completed Jobs",
      value: summary.completedJobs,
      icon: "✅",
      sub: "Tamamlanan işler",
      border: "success",
    },
    {
      title: "Total Tickets",
      value: ticketSummary.total,
      icon: "🎫",
      sub: "Toplam destek talebi",
      border: "primary",
    },
  ];

  const secondaryKpis = [
    {
      title: "Overdue Jobs",
      value: summary.overdueJobs,
      icon: "⏰",
      sub: "Gecikmiş işler",
      border: "danger",
    },
    {
      title: "Unassigned Jobs",
      value: unassignedCount,
      icon: "👤",
      sub: "Atanmamış işler",
      border: "warning",
    },
    {
      title: "My Assigned Jobs",
      value: summary.myAssignedJobs,
      icon: "🧑‍💻",
      sub: "Bana atanmış işler",
      border: "dark",
    },
    {
      title: "Open Tickets",
      value: ticketSummary.open,
      icon: "🟠",
      sub: "Açık ticket",
      border: "warning",
    },
    {
      title: "Critical Tickets",
      value: ticketSummary.critical,
      icon: "🚨",
      sub: "Kritik ticket",
      border: "danger",
    },
  ];

  return (
    <>
      <style>{dashboardStyle}</style>

      <div className="container-fluid py-3">
        <div className="mb-4">
          <h2 className="mb-1 fw-bold">Dashboard</h2>
          <p className="text-muted mb-0">
            CRM WorkTrack genel durum, iş yoğunluğu ve son aktiviteler
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
                    className={`card h-100 shadow-sm border-start border-4 border-${card.border} dashboard-card dashboard-hover-card`}
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
              {secondaryKpis.map((card) =>
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
              )};
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12 col-lg-6">
                <div className="alert alert-danger shadow-sm mb-0 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Overdue Jobs Alert</h6>
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
                      <h6 className="fw-bold mb-1">Unassigned Jobs Alert</h6>
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
                        Jobs by Priority
                      </div>
                      <div className="text-muted small">
                        Öncelik bazlı iş dağılımı
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
                        Jobs per Customer
                      </div>
                      <div className="text-muted small">
                        Müşteri bazlı iş yoğunluğu
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

            <div className="row g-4">
              <div className="col-12 col-xl-6">
                <div className="card shadow-sm border-0 h-100 dashboard-card">
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="dashboard-section-title">Recent Jobs</div>
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
                              <th>Title</th>
                              <th>Customer</th>
                              <th>Status</th>
                              <th>Priority</th>
                              <th>Created</th>
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
                        Recent Activities
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
                                      "Activity"}
                                  </div>

                                  <div className="text-muted small mt-1">
                                    {activity.jobTitle
                                      ? `Job: ${activity.jobTitle}`
                                      : activity.type || "-"}
                                  </div>

                                  {activity.performedByUserName && (
                                    <div className="text-muted small">
                                      By: {activity.performedByUserName}
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