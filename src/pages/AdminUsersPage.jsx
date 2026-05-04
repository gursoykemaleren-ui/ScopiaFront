import { useEffect, useMemo, useState } from "react";
import { adminUserApi } from "../services/api/adminUserApi";
import { adminRoleApi } from "../services/api/adminRoleApi";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;

    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;

    return fallback;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersData, rolesData] = await Promise.all([
        adminUserApi.getAll(),
        adminRoleApi.getAll(),
      ]);

      setUsers(normalizeList(usersData));
      setRoles(normalizeList(rolesData));
    } catch (err) {
      console.error("Admin data load error:", err);
      setError("Kullanıcı ve rol bilgileri alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const name = user.userName || user.UserName || "";
      const mail = user.email || user.Email || "";
      const rolesText = getRoleText(user);

      return (
        name.toLowerCase().includes(term) ||
        mail.toLowerCase().includes(term) ||
        rolesText.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const getUserId = (user) => user.id ?? user.userId ?? user.UserId ?? user.Id;

  const getRoleId = (role) => role.id ?? role.roleId ?? role.RoleId ?? role.Id;

  const getRoleName = (role) => role.name ?? role.Name ?? "-";

  const getUserRoles = (user) => {
    const value = user.roles ?? user.Roles ?? [];

    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.$values)) return value.$values;

    return [];
  };

  const getRoleText = (user) => {
    const userRoles = getUserRoles(user);

    if (userRoles.length === 0) return "Rol yok";

    return userRoles
      .map((role) => role.name ?? role.Name ?? "-")
      .filter(Boolean)
      .join(", ");
  };

  const getCurrentRoleId = (user) => {
    const userRoles = getUserRoles(user);
    const firstRole = userRoles[0];

    return firstRole ? String(getRoleId(firstRole)) : "";
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetUserForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setRoleId("");
  };

  const resetRoleForm = () => {
    setRoleName("");
    setRoleDescription("");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!userName.trim() || !email.trim() || !password.trim()) {
      setError("Kullanıcı adı, e-posta ve şifre alanları zorunludur.");
      return;
    }

    try {
      setSavingUser(true);

      const payload = {
        userName: userName.trim(),
        email: email.trim(),
        password: password.trim(),
      };

      if (roleId) {
        payload.roleId = Number(roleId);
      }

      await adminUserApi.create(payload);

      setSuccess("Kullanıcı başarıyla oluşturuldu.");
      resetUserForm();
      await loadData();
    } catch (err) {
      console.error("Create user error:", err);
      setError(getErrorMessage(err, "Kullanıcı oluşturulurken hata oluştu."));
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!roleName.trim()) {
      setError("Rol adı zorunludur.");
      return;
    }

    try {
      setSavingRole(true);

      await adminRoleApi.create({
        name: roleName.trim(),
        description: roleDescription.trim() || null,
      });

      setSuccess("Rol başarıyla oluşturuldu.");
      resetRoleForm();
      await loadData();
    } catch (err) {
      console.error("Create role error:", err);
      setError(getErrorMessage(err, "Rol oluşturulurken hata oluştu."));
    } finally {
      setSavingRole(false);
    }
  };

  const handleStatusChange = async (user) => {
    clearMessages();

    const id = getUserId(user);
    const currentStatus = user.isActive ?? user.IsActive;

    try {
      await adminUserApi.updateStatus(id, !currentStatus);
      setSuccess("Kullanıcı durumu güncellendi.");
      await loadData();
    } catch (err) {
      console.error("Update user status error:", err);
      setError(getErrorMessage(err, "Kullanıcı durumu güncellenirken hata oluştu."));
    }
  };

  const handleRoleChange = async (user, selectedRoleId) => {
    clearMessages();

    if (!selectedRoleId) return;

    const id = getUserId(user);

    try {
      await adminUserApi.setRole(id, selectedRoleId);
      setSuccess("Kullanıcı rolü güncellendi.");
      await loadData();
    } catch (err) {
      console.error("Set user role error:", err);
      setError(getErrorMessage(err, "Kullanıcı rolü güncellenirken hata oluştu."));
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-info mb-0">Kullanıcı yönetimi yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Kullanıcı ve Yetki Yönetimi</h2>
          <p className="text-muted mb-0">
            Sistem kullanıcılarını, rollerini ve aktiflik durumlarını yönetin.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadData}>
          Yenile
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>{success}</span>
          <button className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-semibold">Yeni Kullanıcı Oluştur</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleCreateUser}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Kullanıcı Adı</label>
                    <input
                      className="form-control"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="örn. manager1"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@test.com"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                    >
                      <option value="">Rol seçilmedi</option>
                      {roles.map((role) => (
                        <option key={getRoleId(role)} value={getRoleId(role)}>
                          {getRoleName(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-primary" disabled={savingUser}>
                    {savingUser ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-semibold">Yeni Rol Oluştur</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleCreateRole}>
                <div className="mb-3">
                  <label className="form-label">Rol Adı</label>
                  <input
                    className="form-control"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="örn. Manager"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Açıklama</label>
                  <input
                    className="form-control"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Rol açıklaması"
                  />
                </div>

                <button className="btn btn-outline-primary w-100" disabled={savingRole}>
                  {savingRole ? "Kaydediliyor..." : "Rol Oluştur"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 className="mb-0 fw-semibold">Kullanıcı Listesi</h5>
            <small className="text-muted">
              Toplam {filteredUsers.length} kullanıcı görüntüleniyor.
            </small>
          </div>

          <input
            className="form-control"
            style={{ maxWidth: 280 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı, e-posta veya rol ara..."
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Rol Değiştir</th>
                <th className="text-end">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const id = getUserId(user);
                  const isActive = user.isActive ?? user.IsActive;

                  return (
                    <tr key={id}>
                      <td>{id}</td>

                      <td>
                        <div className="fw-semibold">
                          {user.userName ?? user.UserName ?? "-"}
                        </div>
                      </td>

                      <td>{user.email ?? user.Email ?? "-"}</td>

                      <td>
                        <span className="badge bg-secondary">
                          {getRoleText(user)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${isActive ? "bg-success" : "bg-danger"}`}>
                          {isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>

                      <td style={{ minWidth: 180 }}>
                        <select
                          className="form-select form-select-sm"
                          value={getCurrentRoleId(user)}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                        >
                          <option value="">Rol seç</option>
                          {roles.map((role) => (
                            <option key={getRoleId(role)} value={getRoleId(role)}>
                              {getRoleName(role)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="text-end">
                        <button
                          className={`btn btn-sm ${
                            isActive ? "btn-outline-danger" : "btn-outline-success"
                          }`}
                          onClick={() => handleStatusChange(user)}
                        >
                          {isActive ? "Pasif Yap" : "Aktif Yap"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;