import { NavLink } from "react-router-dom";

function Sidebar() {
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
          Dashboard
        </NavLink>

        <NavLink to="/customers" style={getLinkStyle}>
          Customers
        </NavLink>

        <NavLink to="/jobs" style={getLinkStyle}>
          Jobs
        </NavLink>

        <NavLink to="/tickets" style={getLinkStyle}>
          Tickets
        </NavLink>

        <NavLink to="/documents" style={getLinkStyle}>
          Documents
        </NavLink>

        <NavLink to="/customer-analysis" style={getLinkStyle}>
          Customer Analysis
        </NavLink>

        <NavLink to="/return-requests" style={getLinkStyle}>
          Return Requests
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;