import { NavLink } from "react-router-dom";

function Sidebar() {
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

  const getLinkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "8px",
    color: "#ffffff",
    textDecoration: "none",
    background: isActive ? "#0d6efd" : "transparent",
    transition: "0.2s",
  });

  const disabledLinkStyle = {
    display: "block",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "8px",
    color: "#ffffff",
    textDecoration: "none",
    background: "transparent",
    opacity: 0.55,
    cursor: "not-allowed",
    transition: "0.2s",
  };

  const handleUnauthorizedClick = () => {
    alert("Kullanıcı Yönetimi modülünü yalnızca admin kullanabilir.");
  };

  return (
    <aside
      style={{
        width: "230px",
        minWidth: "230px",
        maxWidth: "230px",
        minHeight: "100vh",
        background: "#1f2a3a",
        color: "#ffffff",
        padding: "18px 14px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontWeight: "700",
          fontSize: "18px",
          marginBottom: "24px",
        }}
      >
        ScopiaCRM
      </div>

      <nav>
        <NavLink to="/dashboard" style={getLinkStyle}>
          Ana Grafikler
        </NavLink>

        <NavLink to="/customers" style={getLinkStyle}>
          Müşteri Yönetimi
        </NavLink>

        <NavLink to="/jobs" style={getLinkStyle}>
          İş Yönetimi
        </NavLink>

        <NavLink to="/tickets" style={getLinkStyle}>
          Destek Talepleri
        </NavLink>

        <NavLink to="/documents" style={getLinkStyle}>
          Belge Yönetimi
        </NavLink>

        <NavLink to="/customer-analysis" style={getLinkStyle}>
          Müşteri Analizi
        </NavLink>

        <NavLink to="/return-requests" style={getLinkStyle}>
          İade Talepleri
        </NavLink>

        {isAdmin ? (
          <NavLink to="/admin/users" style={getLinkStyle}>
            Kullanıcı Yönetimi
          </NavLink>
        ) : (
          <div style={disabledLinkStyle} onClick={handleUnauthorizedClick}>
            Kullanıcı Yönetimi
          </div>
        )}

        <NavLink to="/reports" style={getLinkStyle}>
          Raporlama
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;