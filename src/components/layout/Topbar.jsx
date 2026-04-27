import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationsDropdown";

function Topbar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Kullanıcı";

  let roles = [];
  try {
    roles = JSON.parse(localStorage.getItem("roles")) || [];
  } catch {
    roles = [];
  }

  const roleText = roles.length > 0 ? roles.join(", ") : "Active User";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("roles");
    localStorage.removeItem("perms");

    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white shadow-sm">
      <div>
        <h5 className="mb-0 fw-bold">CRM WorkTrack</h5>
        <small className="text-muted">Admin Panel</small>
      </div>

      <div className="d-flex align-items-center gap-3">
        <NotificationDropdown />

        <div
          className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white fw-bold"
          style={{ width: "42px", height: "42px" }}
        >
          {avatarLetter}
        </div>

        <div className="text-end">
          <div className="fw-semibold">{userName}</div>
          <small className="text-muted">{roleText}</small>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;