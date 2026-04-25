import { NavLink } from "react-router-dom";

function Sidebar() {
  const getLinkClass = ({ isActive }) =>
    `nav-link rounded px-3 py-2 ${isActive ? "bg-primary text-white" : "text-white"}`;

  return (
    <aside
      className="bg-dark text-white p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h4 className="mb-4">CRM WorkTrack</h4>

      <nav className="nav flex-column gap-2">
        <NavLink to="/dashboard" className={getLinkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/customers" className={getLinkClass}>
          Customers
        </NavLink>

        <NavLink to="/jobs" className={getLinkClass}>
          Jobs
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;