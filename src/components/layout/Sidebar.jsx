import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    management: true,
    requests: true,
    analysis: true,
  });

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

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const getLinkStyle = ({ isActive }) => ({
    display: "block",
    padding: "9px 12px",
    borderRadius: "8px",
    marginBottom: "6px",
    color: "#ffffff",
    textDecoration: "none",
    background: isActive ? "#0d6efd" : "transparent",
    transition: "0.2s",
    fontSize: "14px",
  });

  const disabledLinkStyle = {
    display: "block",
    padding: "9px 12px",
    borderRadius: "8px",
    marginBottom: "6px",
    color: "#ffffff",
    textDecoration: "none",
    background: "transparent",
    opacity: 0.55,
    cursor: "not-allowed",
    transition: "0.2s",
    fontSize: "14px",
  };

  const sectionButtonStyle = {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 4px",
    marginTop: "8px",
    marginBottom: "6px",
    fontWeight: "700",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    cursor: "pointer",
  };

  const sectionContentStyle = {
    paddingLeft: "6px",
    marginBottom: "6px",
  };

  const handleUnauthorizedClick = () => {
    alert("Kullanıcı Yönetimi modülünü yalnızca admin kullanabilir.");
  };

  const SectionHeader = ({ sectionKey, icon, title }) => (
    <button
      type="button"
      style={sectionButtonStyle}
      onClick={() => toggleSection(sectionKey)}
    >
      <span>
        <span style={{ marginRight: "6px" }}>{icon}</span>
        {title}
      </span>

      <span style={{ fontSize: "12px" }}>
        {openSections[sectionKey] ? "▾" : "▸"}
      </span>
    </button>
  );

  return (
    <aside
    style={{
    width: "300px",
    minWidth: "300px",
    maxWidth: "300px",
    height: "100vh",
    position: "sticky",
    top: 0,
    background: "#1f2a3a",
    color: "#ffffff",
    padding: "18px 14px",
    flexShrink: 0,
    overflowY: "auto",
  }}
>
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "25px",
    padding: "6px 4px",
  }}
>
  <img
    src="/icon1.png"
    alt="ScopiaCRM Logo"
    style={{
      width: "100px",
      height: "100px",
      borderRadius: "14px",
      objectFit: "cover",
      background: "#ffffff",
      padding: "3px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
    }}
  />

  <div>
    <div
      style={{
        fontWeight: "800",
        fontSize: "27px",
        lineHeight: "1.1",
      }}
    >
      ScopiaCRM
    </div>

    <small
      style={{
        color: "#cbd5e1",
        fontSize: "12px",
      }}
    >
      CRM & İş Takibi
    </small>
  </div>
</div>

      <nav>
        <SectionHeader
          sectionKey="dashboard"
          icon="🟢"
          title="Dashboard"
        />

        {openSections.dashboard && (
          <div style={sectionContentStyle}>
            <NavLink to="/dashboard" style={getLinkStyle}>
              Ana Grafikler
            </NavLink>
          </div>
        )}

        <SectionHeader
          sectionKey="management"
          icon="🔴"
          title="Yönetim"
        />

        {openSections.management && (
          <div style={sectionContentStyle}>
            <NavLink to="/customers" style={getLinkStyle}>
              Müşteri Yönetimi
            </NavLink>

            <NavLink to="/jobs" style={getLinkStyle}>
              İş Yönetimi
            </NavLink>

            <NavLink to="/documents" style={getLinkStyle}>
              Belge Yönetimi
            </NavLink>

            <NavLink to="/accounting" style={getLinkStyle}>
              Ön Muhasebe Yönetimi
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
          </div>
        )}

        <SectionHeader
          sectionKey="requests"
          icon="🔵"
          title="Talepler"
        />

        {openSections.requests && (
          <div style={sectionContentStyle}>
            <NavLink to="/tickets" style={getLinkStyle}>
              Destek Talepleri
            </NavLink>

            <NavLink to="/return-requests" style={getLinkStyle}>
              İade Talepleri
            </NavLink>

            <NavLink to="/reports" style={getLinkStyle}>
              Raporlama
            </NavLink>
          </div>
        )}

        <SectionHeader
          sectionKey="analysis"
          icon="🟡"
          title="Analiz"
        />

        {openSections.analysis && (
          <div style={sectionContentStyle}>
            <NavLink to="/customer-analysis" style={getLinkStyle}>
              Müşteri Analizi
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;