import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api/authApi";
import { setToken } from "../services/storage/tokenStorage";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔥 SCROLL ANİMASYON (tek dosya içinde)
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await login(username, password);
      const payload = response?.data ?? response;

      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.jwt ||
        payload?.data?.token;

      if (!token) {
        alert("Token bulunamadı");
        return;
      }

      setToken(token);
      localStorage.setItem("userName", username);

      navigate("/dashboard");
    } catch (err) {
      alert("Login başarısız");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* 🔥 STYLE (tek dosyada) */}
      <style>
        {`
        .fade-section {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.6s ease;
        }

        .fade-section.show {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-title {
          font-weight: 800;
        }
        `}
      </style>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4 py-3">
        <span className="navbar-brand fw-bold fs-4 text-primary">
          ScopiaCRM
        </span>

        <div className="ms-auto d-flex gap-4 fw-semibold fs-6">
          <a href="#home" className="text-dark text-decoration-none">Ana Sayfa</a>
          <a href="#about" className="text-dark text-decoration-none">Hakkımızda</a>
          <a href="#features" className="text-dark text-decoration-none">Özellikler</a>
          <a href="#contact" className="text-dark text-decoration-none">İletişim</a>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="container py-5 fade-section">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <h1 className="hero-title display-4 mb-3">
              CRM + İş Takip Sistemi
            </h1>

            <p className="lead text-muted">
              Müşteri süreçlerini, görevleri ve dosyaları tek panelden yönetin.
            </p>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Giriş Yap</h4>

                <form onSubmit={handleLogin}>
                  <input
                    className="form-control mb-3"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button className="btn btn-primary w-100">
                    Giriş Yap
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="container py-5 fade-section">
        <h2 className="fw-bold fs-2 mb-3">Hakkımızda</h2>
        <p className="text-muted">
          ScopiaCRM, müşteri ilişkilerini, iş süreçlerini ve görevleri tek
          platformda birleştiren web tabanlı bir kurumsal yazılımdır.
        </p>
      </section>

      {/* FEATURES */}
      <section id="features" className="container py-5 fade-section">
        <h2 className="fw-bold fs-2 mb-4">Özellikler</h2>

        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>Müşteri Yönetimi</h5>
              <p className="text-muted">Tüm müşteri verileri tek yerde</p>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>Görev Takibi</h5>
              <p className="text-muted">İşleri kolayca yönet</p>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>Ticket Sistemi</h5>
              <p className="text-muted">Destek süreçlerini takip et</p>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>Dosya Yönetimi</h5>
              <p className="text-muted">Dosyaları merkezi yönet</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="container py-5 fade-section">
        <div className="bg-primary text-white p-4 rounded">
          <h2 className="fw-bold">İletişim</h2>
          <p>info@scopiacrm.com</p>
        </div>
      </section>

      <footer className="text-center py-3 text-muted">
        © 2026 ScopiaCRM
      </footer>
    </div>
  );
}

export default LoginPage;