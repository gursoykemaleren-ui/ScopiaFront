import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api/authApi";
import { setToken } from "../services/storage/tokenStorage";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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
    <div className="login-page">
      <style>
        {`
          :root {
            --scopia-dark: #061b36;
            --scopia-navy: #0b2545;
            --scopia-blue: #1167e8;
            --scopia-cyan: #20c7d9;
            --scopia-soft: #f4f8fc;
            --scopia-text: #162033;
            --scopia-muted: #6b7280;
          }

          .login-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at 20% 20%, rgba(32, 199, 217, 0.14), transparent 30%),
              radial-gradient(circle at 85% 35%, rgba(17, 103, 232, 0.14), transparent 28%),
              #f5f8fc;
            color: var(--scopia-text);
            overflow: hidden;
          }

          .login-navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(11, 37, 69, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 34px;
            box-shadow: 0 10px 30px rgba(6, 27, 54, 0.06);
          }

          .brand-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .brand-mark {
            width: 130px;
            height: 130px;
            border-radius: 14px;
            object-fit: contain;
            background: white;
            padding: 4px;
            box-shadow: 0 10px 24px rgba(17, 103, 232, 0.25);
           }

          .brand-title {
            font-weight: 900;
            font-size: 30px;
            color: var(--scopia-blue);
            letter-spacing: 0.2px;
            line-height: 1;
          }

          .brand-subtitle {
            font-size: 18px;
            color: var(--scopia-muted);
            margin-top: 4px;
          }

          .nav-links {
            display: flex;
            align-items: center;
            gap: 28px;
          }

          .nav-links button {
            border: none;
            background: transparent;
            color: var(--scopia-navy);
            font-weight: 700;
            font-size: 20px;
            cursor: pointer;
            transition: color 0.2s ease;
          }

          .nav-links button:hover {
            color: var(--scopia-blue);
          }

          .login-main {
            height: calc(100vh - 76px);
            margin-top: 76px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 720px;
          }

          .login-left-scroll {
            height: calc(100vh - 76px);
            overflow-y: auto;
            padding: 64px 72px 80px;
            scroll-behavior: smooth;
          }

          .login-left-scroll::-webkit-scrollbar {
            width: 9px;
          }

          .login-left-scroll::-webkit-scrollbar-track {
            background: rgba(11, 37, 69, 0.06);
          }

          .login-left-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, var(--scopia-blue), var(--scopia-cyan));
            border-radius: 20px;
          }

          .login-right-fixed {
            height: calc(100vh - 76px);
            border-left: 1px solid rgba(11, 37, 69, 0.08);
            background:
              linear-gradient(160deg, rgba(6, 27, 54, 0.95), rgba(11, 37, 69, 0.92)),
              radial-gradient(circle at top right, rgba(32, 199, 217, 0.35), transparent 35%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 42px;
            position: relative;
            overflow: hidden;
          }

          .login-right-fixed::before {
            content: "";
            position: absolute;
            width: 330px;
            height: 330px;
            border-radius: 999px;
            background: rgba(32, 199, 217, 0.16);
            top: -120px;
            right: -120px;
          }

          .login-right-fixed::after {
            content: "";
            position: absolute;
            width: 240px;
            height: 240px;
            border-radius: 999px;
            background: rgba(17, 103, 232, 0.22);
            bottom: -90px;
            left: -90px;
          }

          .hero-section {
            min-height: calc(100vh - 160px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding-bottom: 60px;
          }

          .hero-badge {
            width: fit-content;
            padding: 9px 15px;
            border-radius: 999px;
            background: rgba(17, 103, 232, 0.1);
            color: var(--scopia-blue);
            font-weight: 800;
            font-size: 13px;
            margin-bottom: 20px;
          }

          .hero-title {
            font-size: clamp(44px, 5vw, 76px);
            line-height: 1.02;
            letter-spacing: -2px;
            font-weight: 900;
            color: var(--scopia-dark);
            margin-bottom: 20px;
          }

          .hero-title span {
            background: linear-gradient(90deg, var(--scopia-blue), var(--scopia-cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-text {
            max-width: 680px;
            font-size: 18px;
            line-height: 1.7;
            color: var(--scopia-muted);
            margin-bottom: 30px;
          }

          .hero-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            max-width: 760px;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(11, 37, 69, 0.08);
            border-radius: 22px;
            padding: 20px;
            box-shadow: 0 14px 32px rgba(6, 27, 54, 0.06);
          }

          .stat-card strong {
            display: block;
            font-size: 28px;
            color: var(--scopia-blue);
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-card span {
            color: var(--scopia-muted);
            font-size: 14px;
          }

          .content-section {
            padding: 80px 0;
            border-top: 1px solid rgba(11, 37, 69, 0.08);
          }

          .section-kicker {
            color: var(--scopia-blue);
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 12px;
          }

          .section-title {
            color: var(--scopia-dark);
            font-weight: 900;
            font-size: 36px;
            margin-bottom: 16px;
            letter-spacing: -0.7px;
          }

          .section-text {
            max-width: 780px;
            color: var(--scopia-muted);
            line-height: 1.8;
            font-size: 18px;
            margin-bottom: 28px;
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            max-width: 860px;
          }

          .feature-card {
            background: rgba(255, 255, 255, 0.86);
            border: 1px solid rgba(11, 37, 69, 0.08);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 16px 36px rgba(6, 27, 54, 0.07);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 22px 44px rgba(6, 27, 54, 0.11);
          }

          .feature-icon {
            width: 46px;
            height: 46px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(17, 103, 232, 0.14), rgba(32, 199, 217, 0.18));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            margin-bottom: 16px;
          }

          .feature-card h4 {
            font-size: 18px;
            font-weight: 900;
            color: var(--scopia-dark);
            margin-bottom: 8px;
          }

          .feature-card p {
            color: var(--scopia-muted);
            margin: 0;
            line-height: 1.6;
          }

          .contact-card {
            max-width: 860px;
            background: linear-gradient(135deg, var(--scopia-dark), var(--scopia-blue));
            color: white;
            border-radius: 28px;
            padding: 34px;
            box-shadow: 0 22px 52px rgba(17, 103, 232, 0.24);
          }

          .contact-card h3 {
            font-weight: 900;
            margin-bottom: 10px;
          }

          .contact-card p {
            color: rgba(255, 255, 255, 0.78);
            margin-bottom: 18px;
          }

          .contact-row {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
          }

          .contact-pill {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 999px;
            padding: 10px 14px;
            font-weight: 700;
          }

          .login-card {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 410px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.55);
            border-radius: 30px;
            padding: 34px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          }

          .login-card-logo {
           width: 80px;
           height: 80px;
           border-radius: 22px;
           object-fit: contain;
           background: white;
           padding: 6px;
           margin-bottom: 18px;
           box-shadow: 0 16px 32px rgba(17, 103, 232, 0.28);
           }

          .login-card h3 {
            font-weight: 900;
            color: var(--scopia-dark);
            margin-bottom: 8px;
          }

          .login-card .login-desc {
            color: var(--scopia-muted);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
          }

          .form-label {
            font-weight: 800;
            color: var(--scopia-navy);
            font-size: 13px;
            margin-bottom: 8px;
          }

          .scopia-input {
            height: 48px;
            border-radius: 14px;
            border: 1px solid rgba(11, 37, 69, 0.14);
            background: #f8fbff;
            font-weight: 600;
          }

          .scopia-input:focus {
            border-color: var(--scopia-blue);
            box-shadow: 0 0 0 4px rgba(17, 103, 232, 0.12);
            background: white;
          }

          .login-button {
            height: 50px;
            border: none;
            border-radius: 16px;
            background: linear-gradient(90deg, var(--scopia-blue), var(--scopia-cyan));
            color: white;
            font-weight: 900;
            box-shadow: 0 16px 32px rgba(17, 103, 232, 0.28);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 38px rgba(17, 103, 232, 0.36);
          }

          .login-note {
            margin-top: 18px;
            color: var(--scopia-muted);
            font-size: 12px;
            text-align: center;
          }

          .fade-section {
            opacity: 0;
            transform: translateY(34px);
            transition: all 0.65s ease;
          }

          .fade-section.show {
            opacity: 1;
            transform: translateY(0);
          }

          @media (max-width: 992px) {
            .login-page {
              overflow: auto;
            }

            .login-main {
              height: auto;
              min-height: calc(100vh - 76px);
              grid-template-columns: 1fr;
            }

            .login-left-scroll {
              height: auto;
              overflow: visible;
              padding: 42px 24px;
            }

            .login-right-fixed {
              height: auto;
              min-height: 520px;
              border-left: none;
              border-top: 1px solid rgba(11, 37, 69, 0.08);
            }

            .nav-links {
              gap: 14px;
            }

            .hero-stats,
            .feature-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .login-navbar {
              padding: 0 18px;
            }

            .brand-subtitle {
              display: none;
            }

            .nav-links {
              display: none;
            }

            .login-card {
              padding: 26px;
            }

            .hero-title {
              font-size: 42px;
            }
          }
        `}
      </style>

      <nav className="login-navbar">
        <div className="brand-area">
          <img
          src="/icon1.png"
          alt="ScopiaCRM Logo"
          className="brand-mark"
         />

          <div>
            <div className="brand-title">ScopiaCRM</div>
            <div className="brand-subtitle">CRM & İş Takibi</div>
          </div>
        </div>

        <div className="nav-links">
          <button type="button" onClick={() => scrollToSection("home")}>
            Ana Sayfa
          </button>
          <button type="button" onClick={() => scrollToSection("about")}>
            Hakkımızda
          </button>
          <button type="button" onClick={() => scrollToSection("features")}>
            Özellikler
          </button>
          <button type="button" onClick={() => scrollToSection("contact")}>
            İletişim
          </button>
        </div>
      </nav>

      <main className="login-main">
        <section className="login-left-scroll">
          <div id="home" className="hero-section fade-section">
            <div className="hero-badge">Web Tabanlı Yönetim Platformu</div>

            <h1 className="hero-title">
              CRM + İş Takip Sistemi
            </h1>

            <p className="hero-text">
              ScopiaCRM; müşteri kayıtlarını, destek taleplerini, iş süreçlerini,
              dosyaları ve raporlama işlemlerini tek panelde birleştiren modern
              bir CRM ve iş takip çözümüdür.
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <strong>360°</strong>
                <span>Müşteri süreç görünürlüğü</span>
              </div>

              <div className="stat-card">
                <strong>Tek</strong>
                <span>Merkezi yönetim paneli</span>
              </div>

              <div className="stat-card">
                <strong>Hızlı</strong>
                <span>İş ve talep takibi</span>
              </div>
            </div>
          </div>

          <section id="about" className="content-section fade-section">
            <div className="section-kicker">Hakkımızda</div>

            <h2 className="section-title">Kurumsal süreçleri sadeleştiren yapı</h2>

            <p className="section-text">
              ScopiaCRM, müşteri ilişkileri yönetimi ile iş takibi süreçlerini
              aynı sistem üzerinde toplayarak işletmelerin daha düzenli,
              ölçülebilir ve takip edilebilir bir çalışma yapısına sahip olmasını
              amaçlar. Kullanıcılar müşteri bilgilerine, iş kayıtlarına, destek
              taleplerine ve dosyalara merkezi bir panel üzerinden erişebilir.
            </p>

            <p className="section-text">
              Sistem; küçük ve orta ölçekli işletmelerin operasyonel takibini
              kolaylaştırmak, manuel süreçleri azaltmak ve ekip içi koordinasyonu
              güçlendirmek için geliştirilmiştir.
            </p>
          </section>

          <section id="features" className="content-section fade-section">
            <div className="section-kicker">Özellikler</div>

            <h2 className="section-title">ScopiaCRM ile yönetilebilen modüller</h2>

            <p className="section-text">
              Platform; müşteri yönetimi, iş takibi, destek talepleri, dosya
              yönetimi, raporlama ve analiz bileşenlerini bütünleşik bir yapıda
              sunar.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h4>Müşteri Yönetimi</h4>
                <p>
                  Müşteri kayıtlarını görüntüleyebilir, detaylarını inceleyebilir
                  ve müşteri bilgilerini merkezi olarak yönetebilirsiniz.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h4>İş Takibi</h4>
                <p>
                  İşleri oluşturabilir, kullanıcılara atayabilir, öncelik ve
                  durum bilgilerine göre takip edebilirsiniz.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎫</div>
                <h4>Destek Talepleri</h4>
                <p>
                  Müşterilerden gelen talepleri kayıt altına alabilir, durumlarını
                  güncelleyebilir ve destek sürecini izleyebilirsiniz.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📁</div>
                <h4>Dosya Yönetimi</h4>
                <p>
                  İşlere bağlı dosyaları yükleyebilir, listeleyebilir ve belge
                  takibini daha düzenli hale getirebilirsiniz.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Raporlama</h4>
                <p>
                  Sistem üzerindeki iş yoğunluğu, destek talepleri ve müşteri
                  hareketlerini raporlar üzerinden değerlendirebilirsiniz.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h4>Yetkilendirme</h4>
                <p>
                  Kullanıcı, rol ve yetki kontrolleri ile sistem erişimini daha
                  güvenli ve kontrollü hale getirebilirsiniz.
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="content-section fade-section">
            <div className="section-kicker">İletişim</div>

            <div className="contact-card">
              <h3>ScopiaCRM ile süreçlerinizi tek panelden yönetin</h3>

              <p>
                CRM, iş takibi, destek talepleri ve raporlama süreçleri için
                modern, sade ve kullanışlı bir yönetim deneyimi.
              </p>

              <div className="contact-row">
                <div className="contact-pill">info@scopiacrm.com</div>
                <div className="contact-pill">www.scopiacrm.com</div>
                <div className="contact-pill">CRM & İş Takibi</div>
              </div>
            </div>
          </section>
        </section>

        <aside className="login-right-fixed">
          <div className="login-card">
            <img
            src="/icon1.png"
            alt="ScopiaCRM Logo"
            className="login-card-logo"
           />

            <h3>Giriş Yap</h3>

            

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Kullanıcı Adı</label>
                <input
                  className="form-control scopia-input"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Şifre</label>
                <input
                  type="password"
                  className="form-control scopia-input"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="login-button w-100">
                Giriş Yap
              </button>
            </form>

            
          </div>
        </aside>
      </main>
    </div>
  );
}

export default LoginPage;