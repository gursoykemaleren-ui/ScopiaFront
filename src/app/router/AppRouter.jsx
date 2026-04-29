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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;