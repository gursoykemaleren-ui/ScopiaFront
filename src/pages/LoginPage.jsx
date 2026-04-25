import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api/authApi";
import { setToken } from "../services/storage/tokenStorage";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  console.log("1 - HANDLE LOGIN ÇALIŞTI");

  try {
    console.log("2 - login fonksiyonu çağrılacak");
    const response = await login(username, password);
    console.log("3 - LOGIN RESPONSE:", response);
    console.log("3.1 - LOGIN RESPONSE JSON:", JSON.stringify(response, null, 2));

    const payload = response?.data ?? response;

    const token =
      payload?.token ||
      payload?.accessToken ||
      payload?.jwt ||
      payload?.data?.token ||
      payload?.data?.accessToken ||
      payload?.data?.jwt;

    if (!token) {
      console.log("4 - Token bulunamadı. Payload:", payload);
      alert("Token bulunamadı. Console'daki 3.1 - LOGIN RESPONSE JSON çıktısını kontrol et.");
      return;
    }
console.log("5 - Token bulundu, kaydediliyor");
setToken(token);

/* 👇 Kullanıcı bilgilerini kaydet */
localStorage.setItem("userName", payload?.userName || payload?.username || username);

if (payload?.roles) {
  localStorage.setItem("roles", JSON.stringify(payload.roles));
}

if (payload?.perms) {
  localStorage.setItem("perms", JSON.stringify(payload.perms));
}

console.log("6 - Dashboard'a gidiliyor");
navigate("/dashboard");
    
  } catch (error) {
    console.log("X - LOGIN ERROR:", error);
    console.log("X - LOGIN ERROR RESPONSE:", error?.response);
    console.log("X - LOGIN ERROR DATA:", error?.response?.data);

    const errorMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Login başarısız";

    alert(errorMessage);
  }
};
 
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h3 className="mb-3">Login</h3>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;