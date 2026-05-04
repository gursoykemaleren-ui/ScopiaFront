import { useEffect, useRef, useState } from "react";
import { formatDateTimeTR } from "../../utils/date";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../../services/api/notificationApi";

function NotificationDropdown() {
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const loadNotifications = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const data = await getNotifications();
      setNotifications(normalizeList(data));
    } catch (err) {
      console.error("Bildirimler alınamadı:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);

    const intervalId = setInterval(() => {
      loadNotifications(false);
    }, 3000);

    const handleFocus = () => {
      loadNotifications(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => {
    const isRead = n.isRead ?? n.IsRead;
    return !isRead;
  }).length;

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications(true);
    }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await loadNotifications(false);
    } catch (err) {
      console.error("Bildirim okundu yapılamadı:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      await loadNotifications(false);
    } catch (err) {
      console.error("Bildirim silinemedi:", err);
      alert("Bildirim silinirken hata oluştu.");
    }
  };

  const handleClear = async () => {
    if (notifications.length === 0) return;

    const ok = window.confirm("Tüm bildirimleri temizlemek istiyor musun?");
    if (!ok) return;

    try {
      await clearNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Bildirimler temizlenemedi:", err);
      alert("Bildirimler temizlenirken hata oluştu.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications(false);
    } catch (err) {
      console.error("Bildirimler okundu yapılamadı:", err);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-light position-relative"
        onClick={handleToggle}
        title="Bildirimler"
      >
        🔔

        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "10px" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card shadow"
          style={{
            position: "absolute",
            right: 0,
            top: "44px",
            width: "330px",
            maxHeight: "420px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <strong>Bildirimler</strong>
              <div className="text-muted small">
                {notifications.length} bildirim
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-link p-0"
                onClick={handleMarkAllAsRead}
              >
                Okundu
              </button>

              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0"
                onClick={handleClear}
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="p-3 text-muted">Bildirimler yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div className="p-3 text-muted">Bildirim bulunamadı.</div>
            ) : (
              notifications.map((notification) => {
                const id = notification.id ?? notification.Id;
                const title = notification.title ?? notification.Title;
                const message = notification.message ?? notification.Message;
                const isRead = notification.isRead ?? notification.IsRead;
                const createdAt =
                  notification.createdAt ?? notification.CreatedAt;

                return (
                  <div
                    key={id}
                    className={`p-3 border-bottom ${
                      isRead ? "bg-white" : "bg-light"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div
                        style={{ cursor: "pointer", flex: 1 }}
                        onClick={() => handleRead(id)}
                      >
                        <div className="fw-bold">{title}</div>
                        <div className="small text-muted">{message}</div>

                        {createdAt && (
                          <div className="small text-secondary mt-1">
                            {formatDateTimeTR(createdAt)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(id)}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;