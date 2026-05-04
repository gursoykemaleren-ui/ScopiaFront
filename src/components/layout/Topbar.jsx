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
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      {/* ORTALANMIŞ BAŞLIK */}
<div
  style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
  }}
>
  <div style={{ fontWeight: "700" }}>ScopiaCRM</div>
  <small style={{ color: "#6b7280" }}>
    {userName} Kullanıcı Paneli
  </small>
</div>

      {/* SAĞ TARAF */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <NotificationDropdown />

        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#0d6efd",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
          }}
        >
          {avatarLetter}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: "500" }}>
            {userName}
          </div>
          <small style={{ color: "#6b7280" }}>{roleText}</small>
        </div>

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleLogout}
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}

export default Topbar;