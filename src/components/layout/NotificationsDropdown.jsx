import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/api/notificationApi";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);
   useEffect(() => {
   loadNotifications();

  const interval = setInterval(() => {
    loadNotifications();
  }, 5000); // 5 saniyede bir

  return () => clearInterval(interval);
}, []);
  

  return (
    <div className="position-relative">
      <button
        className="btn btn-light position-relative"
        onClick={() => setOpen(!open)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card position-absolute end-0 mt-2"
          style={{ width: "300px", zIndex: 999 }}
        >
          <div className="card-header d-flex justify-content-between">
            <b>Bildirimler</b>
            <button
              className="btn btn-sm btn-link"
              onClick={markAllNotificationsAsRead}
            >
              Temizle
            </button>
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 border-bottom ${
                  !n.isRead ? "bg-light" : ""
                }`}
              >
                <div className="fw-bold">{n.title}</div>
                <small>{n.message}</small>

                <div className="d-flex gap-2 mt-1">
                  {!n.isRead && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      Okundu
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNotification(n.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}