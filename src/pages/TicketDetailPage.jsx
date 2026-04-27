import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketApi } from "../services/api/ticketApi";

function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      const data = await ticketApi.getById(id);
      setTicket(data);
    } catch (err) {
      console.error("Ticket alınamadı", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  if (loading) return <p>Yükleniyor...</p>;

  if (!ticket) return <p>Ticket bulunamadı</p>;

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Ticket Detayı</h3>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/tickets")}
        >
          Geri
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-6">
              <strong>ID</strong>
              <div>{ticket.id}</div>
            </div>

            <div className="col-md-6">
              <strong>Müşteri</strong>
              <div>{ticket.customerName}</div>
            </div>

            <div className="col-md-6">
              <strong>Başlık</strong>
              <div>{ticket.title}</div>
            </div>

            <div className="col-md-6">
              <strong>Durum</strong>
              <div>{ticket.status}</div>
            </div>

            <div className="col-md-6">
              <strong>Öncelik</strong>
              <div>{ticket.priority}</div>
            </div>

            <div className="col-md-6">
              <strong>Atanan</strong>
              <div>{ticket.assignedToUserName || "-"}</div>
            </div>

            <div className="col-md-12">
              <strong>Açıklama</strong>
              <div>{ticket.description}</div>
            </div>

            <div className="col-md-6">
              <strong>Oluşturulma</strong>
              <div>{new Date(ticket.createdAt).toLocaleString()}</div>
            </div>

            <div className="col-md-6">
              <strong>Güncellenme</strong>
              <div>
                {ticket.updatedAt
                  ? new Date(ticket.updatedAt).toLocaleString()
                  : "-"}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;