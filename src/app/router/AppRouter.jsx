import TicketDetailPage from "../../pages/TicketDetailPage";
import TicketsPage from "../../pages/TicketsPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import LoginPage from "../../pages/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import CustomerListPage from "../../pages/customer/CustomerListPage";
import JobListPage from "../../pages/job/JobListPage";
import ProtectedRoute from "./ProtectedRoute";
import { getToken } from "../../services/storage/tokenStorage";
import CustomerDetailPage from "../../pages/customer/CustomerDetailPage";
import JobDetailPage from "../../pages/job/JobDetailPage";
import DocumentsPage from "../../pages/DocumentsPage";
import CustomerAnalysisPage from "../../pages/CustomerAnalysisPage";
import ReturnRequestsPage from "../../pages/ReturnRequestsPage";
import AdminUsersPage from "../../pages/AdminUsersPage";
import ReportsPage from "../../pages/ReportsPage";

function getRolesFromStorage() {
  try {
    const roles = JSON.parse(localStorage.getItem("roles")) || [];
    return Array.isArray(roles) ? roles : [];
  } catch {
    return [];
  }
}

function AdminOnly({ children }) {
  let roles = [];

  try {
    const parsedRoles = JSON.parse(localStorage.getItem("roles")) || [];
    roles = Array.isArray(parsedRoles) ? parsedRoles : [];
  } catch {
    roles = [];
  }

  const userName = localStorage.getItem("userName") || "";

  const isAdmin =
    userName.toLowerCase() === "admin" ||
    roles.some((role) => String(role).toLowerCase() === "admin");

  if (!isAdmin) {
    return (
      <div className="container-fluid py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <h3 className="fw-bold mb-2">Yetkisiz Erişim</h3>
            <p className="text-muted mb-3">
              Kullanıcı Yönetimi modülünü yalnızca admin kullanabilir.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function AppRouter() {
  const token = getToken();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/customer-analysis" element={<CustomerAnalysisPage />} />
            <Route path="/return-requests" element={<ReturnRequestsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            <Route
              path="/admin/users"
              element={
                <AdminOnly>
                  <AdminUsersPage />
                </AdminOnly>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;