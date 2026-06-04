import React, { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState({ role: "guest", id: 0, name: "Misafir" });
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [stats, setStats] = useState({ total_items: 0, pending_approvals: 0 });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // İlan Formu State
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemCat, setItemCat] = useState("");
  const [itemLoc, setItemLoc] = useState("");
  const [itemType, setItemType] = useState("lost");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("user");

  // 💬 Yeni Mesajlaşma State'leri
  const [activeMessageField, setActiveMessageField] = useState(null);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (screen === "home") loadItems();
    if (screen === "security") loadSecurityPanel();
    if (screen === "profile") loadProfileData();
  }, [screen]);

  const loadMeta = async () => {
    try {
      const resCat = await fetch(`${API}/items/meta/categories`);
      const cats = await resCat.json();
      setCategories(cats);
      if (cats.length > 0) setItemCat(cats[0].id);
    } catch (e) {
      console.log(e);
    }
  };

  const loadItems = async () => {
    try {
      const res = await fetch(`${API}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.log("İlanlar yüklenirken hata oluştu:", e);
    }
  };

  const handleClaimItem = async (itemId) => {
    if (user.id === 0 || user.role === "guest") {
      return alert(
        "Bu işlemi yapabilmek için lütfen önce sisteme giriş yapın!",
      );
    }
    setActiveMessageField(itemId);
  };

  const sendDirectMessage = async (itemId) => {
    if (!customMessage.trim()) return alert("Lütfen bir mesaj yazın!");

    try {
      const res = await fetch(`${API}/items/claim/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimerId: user.id,
          claimerName: user.name,
          claimerEmail: `${user.email} ||  Mesaj: ${customMessage}`,
        }),
      });

      if (res.ok) {
        alert(
          "Mesajınız ilan sahibine başarıyla iletildi! Profil kutusuna düşecektir.",
        );
        setCustomMessage("");
        setActiveMessageField(null);
      } else {
        alert("Mesaj iletilirken bir sorun oluştu.");
      }
    } catch (e) {
      console.log("Hata:", e);
    }
  };

  const loadSecurityPanel = async () => {
    const res = await fetch(`${API}/admin/all-items`);
    const data = await res.json();
    setAllItems(data);

    const resStats = await fetch(`${API}/admin/stats`);
    const s = await resStats.json();
    setStats(s);
  };

  const loadProfileData = async () => {
    const resNotif = await fetch(`${API}/notifications/${user.id}`);
    const notifs = await resNotif.json();
    setNotifications(notifs);

    const resHist = await fetch(`${API}/items/history/${user.id}`);
    const hist = await resHist.json();
    setHistory(hist);
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return alert("Giriş bilgileri hatalı!");
    const data = await res.json();
    setUser(data);
    setScreen("home");
  };

  const register = async () => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      }),
    });
    if (res.ok) {
      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      setScreen("auth");
    } else {
      const err = await res.json();
      alert("Hata: " + err.detail);
    }
  };

  const submitItem = async () => {
    if (!itemTitle.trim() || !itemDesc.trim() || !itemLoc.trim()) {
      return alert("Lütfen tüm alanları doldurun!");
    }

    const res = await fetch(`${API}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: itemTitle,
        description: itemDesc,
        category_id: parseInt(itemCat) || categories[0]?.id,
        location_text: itemLoc,
        type: itemType,
        user_id: user.id,
      }),
    });
    if (res.ok) {
      alert("İlan başarıyla oluşturuldu!");
      setItemTitle("");
      setItemDesc("");
      setItemLoc("");
      setScreen("home");
    } else {
      alert("İlan gönderilirken sunucu hatası oluştu.");
    }
  };

  const approveItem = async (id) => {
    const res = await fetch(
      `${API}/admin/items/${id}/approve?admin_id=${user.id}`,
      { method: "PUT" },
    );
    if (res.ok) {
      alert("İlan onaylandı!");
      setScreen("home");
    }
  };

  const deleteItem = async (id) => {
    if (
      !window.confirm(
        "Bu ilanı sistemden tamamen kaldırmak istediğinize emin misiniz?",
      )
    )
      return;

    try {
      const res = await fetch(`${API}/items/delete-item/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("İşlem başarılı! İlan kaldırıldı.");
        loadItems();
        loadSecurityPanel();
      } else {
        alert("İlan silinirken bir hata oluştu.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span
            className="navbar-brand pointer"
            onClick={() => setScreen("home")}
          >
            🎓 Kampüs Eşya Portal
          </span>
          {screen !== "auth" && screen !== "register" && (
            <div className="navbar-nav ms-auto">
              <div className="d-flex align-items-center">
                <span
                  className="nav-link pointer me-3"
                  onClick={() => setScreen("home")}
                >
                  Ana Sayfa
                </span>
                {user.role !== "guest" && (
                  <span
                    className="nav-link pointer me-3"
                    onClick={() => setScreen("createItem")}
                  >
                    İlan Oluştur
                  </span>
                )}
                {user.role !== "guest" && (
                  <span
                    className="nav-link pointer me-3"
                    onClick={() => setScreen("profile")}
                  >
                    Profilim ({notifications.length})
                  </span>
                )}
                {["admin", "security"].includes(user.role) && (
                  <span
                    className="nav-link pointer me-3 text-warning"
                    onClick={() => setScreen("security")}
                  >
                    Yetkili Paneli
                  </span>
                )}
                <button
                  className="btn btn-sm btn-danger ms-2"
                  onClick={() => window.location.reload()}
                >
                  Çıkış
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="hero">
        <h2>
          {screen === "auth" || screen === "register"
            ? "Kampüs Kayıp & Bulunan Eşya Portalı"
            : `Hoş Geldiniz, ${user.name}`}
        </h2>
        <p>
          {screen === "auth" || screen === "register"
            ? "Güvenli ve Hızlı Kampüs Dayanışma Sistemi"
            : `Sistem Rol Yetkiniz: [${user.role.toUpperCase()}]`}
        </p>
      </div>

      <div className="container">
        {screen === "auth" && (
          <div className="row justify-content-center">
            <div className="col-md-4 card p-4 shadow-sm text-center">
              <h4>Sisteme Giriş</h4>
              <input
                type="email"
                id="emailInput"
                className="form-control mb-2"
                placeholder="Lütfen e-posta adresinizi giriniz"
              />
              <input
                type="password"
                id="passInput"
                className="form-control mb-3"
                placeholder="Lütfen şifrenizi giriniz"
              />
              <button
                className="btn btn-primary w-100 mb-2"
                onClick={() =>
                  login(
                    document.getElementById("emailInput").value,
                    document.getElementById("passInput").value,
                  )
                }
              >
                Giriş Yap
              </button>
              <button
                className="btn btn-outline-secondary w-100 mb-3"
                onClick={() => {
                  setUser({ role: "guest", id: 0, name: "Misafir" });
                  setScreen("home");
                }}
              >
                🏃 Misafir Devam Et
              </button>
              <span
                className="text-muted small pointer text-primary"
                onClick={() => setScreen("register")}
              >
                Hesabınız yok mu? Kayıt Ol
              </span>
            </div>
          </div>
        )}

        {screen === "register" && (
          <div className="row justify-content-center">
            <div className="col-md-4 card p-4 shadow-sm">
              <h4 className="text-center mb-3">Yeni Hesap Oluştur</h4>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Ad Soyad"
                onChange={(e) => setRegName(e.target.value)}
              />
              <input
                type="email"
                className="form-control mb-2"
                placeholder="E-posta Adresi"
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Şifre"
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <select
                className="form-select mb-3"
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="user">Öğrenci / Personel</option>
                <option value="security">Kampüs Güvenliği</option>
                <option value="admin">Kampüs Yönetimi / Admin</option>
              </select>
              <button className="btn btn-success w-100 mb-2" onClick={register}>
                Kayıt Ol
              </button>
              <center>
                <span
                  className="text-primary pointer small"
                  onClick={() => setScreen("auth")}
                >
                  Giriş Yapın
                </span>
              </center>
            </div>
          </div>
        )}

        {screen === "home" && (
          <div className="row">
            <div className="col-md-3 bg-white p-3 rounded shadow-sm mb-3">
              <h5> Filtreleme</h5>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kelime ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select mb-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tüm Türler</option>
                <option value="lost">Kayıp Eşyalar</option>
                <option value="found">Bulunan Eşyalar</option>
              </select>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-9">
              <h4 className="mb-3">📢 Aktif Kampüs İlanları</h4>
              <div className="row">
                {(() => {
                  const filteredItems = items.filter((i) => {
                    const matchesSearch =
                      i.title.toLowerCase().includes(search.toLowerCase()) ||
                      i.description
                        .toLowerCase()
                        .includes(search.toLowerCase());
                    const matchesType =
                      filterType === "" || i.type === filterType;
                    const matchesCategory =
                      filterCategory === "" ||
                      i.category_id === parseInt(filterCategory);

                    return matchesSearch && matchesType && matchesCategory;
                  });

                  if (filteredItems.length === 0) {
                    return (
                      <p className="text-muted text-center mt-4">
                        Aranan kriterlere uygun aktif ilan bulunmuyor.
                      </p>
                    );
                  }

                  return filteredItems.map((i) => (
                    <div className="col-md-6 mb-3" key={i.id}>
                      <div
                        className={`card p-3 border-start border-4 ${i.type === "lost" ? "border-danger" : "border-success"}`}
                      >
                        <h5>
                          {i.title}{" "}
                          <span
                            className={`badge ${i.type === "lost" ? "bg-danger" : "bg-success"}`}
                          >
                            {i.type === "lost" ? "KAYIP" : "BULUNDU"}
                          </span>
                        </h5>
                        <p className="small text-secondary mb-1">
                          {i.description}
                        </p>
                        <p className="text-muted small mb-0">
                          Konum: {i.image_url || "Belirtilmedi"}
                        </p>

                        <div className="mt-2">
                          {user.id === i.user_id ? (
                            <button
                              className="btn btn-sm btn-success w-100 fw-bold"
                              onClick={() => deleteItem(i.id)}
                            >
                              Eşya Bulundu! İlanı Kaldır
                            </button>
                          ) : (
                            user.id !== i.user_id &&
                            (activeMessageField === i.id ? (
                              <div className="bg-light p-2 rounded border mt-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm mb-2"
                                  placeholder="İlan sahibine mesajınız..."
                                  value={customMessage}
                                  onChange={(e) =>
                                    setCustomMessage(e.target.value)
                                  }
                                />
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-success flex-grow-1"
                                    onClick={() => sendDirectMessage(i.id)}
                                  >
                                    💬 Gönder
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setActiveMessageField(null)}
                                  >
                                    İptal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className={`btn btn-sm w-100 ${i.type === "lost" ? "btn-outline-danger" : "btn-outline-success"}`}
                                onClick={() => handleClaimItem(i.id)}
                              >
                                {i.type === "lost"
                                  ? "🔍 Bu Eşyayı Ben Buldum!"
                                  : "🙋 Bu Eşya Benim!"}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {screen === "createItem" && (
          <div className="row justify-content-center">
            <div className="col-md-6 card p-4 shadow-sm">
              <h4>🆕 Yeni İlan Bildir</h4>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Eşya Başlığı"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
              />
              <textarea
                className="form-control mb-2"
                placeholder="Açıklama..."
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
              ></textarea>
              <label className="small text-muted">Kategori</label>
              <select
                className="form-select mb-2"
                value={itemCat}
                onChange={(e) => setItemCat(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="small text-muted">
                Eşyanın Bulunduğu / Kaybolduğu Yer (Serbest Metin)
              </label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Örn: Yemekhane arkasındaki çimler"
                value={itemLoc}
                onChange={(e) => setItemLoc(e.target.value)}
              />
              <label className="small text-muted">İlan Amacı</label>
              <select
                className="form-select mb-3"
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="lost">Eşyamı Kaybettim</option>
                <option value="found">Eşya Buldum</option>
              </select>
              <button className="btn btn-success w-100" onClick={submitItem}>
                İlanı Gönder
              </button>
            </div>
          </div>
        )}

        {screen === "profile" && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card p-3 shadow-sm bg-warning bg-opacity-10">
                <h5>🔔 Akıllı Eşleşme Bildirimleri</h5>
                {(() => {
                  const chats = {};

                  notifications.forEach((n) => {
                    const parts = n.message.split("||");
                    const text = parts[0] || "";
                    const email = parts[1] ? parts[1].trim() : null;

                    if (email) {
                      if (!chats[email]) {
                        chats[email] = {
                          messages: [],
                          lastNotificationId: n.id,
                        };
                      }
                      chats[email].messages.push({ id: n.id, text: text });
                    }
                  });

                  const chatEmails = Object.keys(chats);

                  if (chatEmails.length === 0) {
                    return (
                      <p className="text-muted text-center small">
                        Henüz bir sohbet veya talep bulunmuyor.
                      </p>
                    );
                  }

                  return chatEmails.map((email) => {
                    const chatData = chats[email];

                    return (
                      <div
                        className="card mb-4 shadow-sm border-0 bg-light"
                        key={email}
                        style={{ borderRadius: "12px", overflow: "hidden" }}
                      >
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-2">
                          <span className="fw-bold">
                            👤 {email.split("@")[0].toUpperCase()}
                          </span>
                          <span
                            className="badge bg-primary small"
                            style={{ fontSize: "10px" }}
                          >
                            {email}
                          </span>
                        </div>

                        <div
                          className="card-body p-3 d-flex flex-column"
                          style={{
                            height: "300px",
                            overflowY: "auto",
                            backgroundColor: "#efeae2",
                          }}
                        >
                          {chatData.messages.reverse().map((msg, index) => {
                            const isMyMessage =
                              msg.text.startsWith("📤 Giden:");
                            const cleanText = msg.text
                              .replace("📤 Giden:", "")
                              .replace("💬 ", "");

                            return (
                              <div
                                key={index}
                                className="p-2 rounded mb-2 small shadow-sm d-inline-block"
                                style={{
                                  maxWidth: "75%",
                                  alignSelf: isMyMessage
                                    ? "flex-end"
                                    : "flex-start",
                                  backgroundColor: isMyMessage
                                    ? "#d9fdd3"
                                    : "#ffffff",
                                  color: "#000000",
                                  borderRadius: isMyMessage
                                    ? "8px 8px 0px 8px"
                                    : "8px 8px 8px 0px",
                                  marginLeft: isMyMessage ? "40px" : "0px",
                                  marginRight: isMyMessage ? "0px" : "40px",
                                }}
                              >
                                {cleanText}
                              </div>
                            );
                          })}
                        </div>

                        <div className="card-footer bg-white p-2">
                          <div className="input-group">
                            <input
                              type="text"
                              id={`chatInput_${chatData.lastNotificationId}`}
                              className="form-control form-control-sm rounded-pill px-3 me-2"
                              placeholder="Mesajınızı yazın..."
                            />
                            <button
                              className="btn btn-sm btn-success rounded-circle px-3 fw-bold"
                              onClick={async () => {
                                const messageText = document.getElementById(
                                  `chatInput_${chatData.lastNotificationId}`,
                                ).value;
                                if (!messageText.trim())
                                  return alert("Lütfen boş mesaj göndermeyin!");

                                try {
                                  const res = await fetch(
                                    `${API}/items/direct-message`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        targetEmail: email,
                                        replyMessage: messageText,
                                        senderName: user.name,
                                        senderEmail: user.email,
                                      }),
                                    },
                                  );

                                  if (res.ok) {
                                    document.getElementById(
                                      `chatInput_${chatData.lastNotificationId}`,
                                    ).value = "";
                                    await loadProfileData();
                                  } else {
                                    alert(
                                      "Mesaj iletilirken bir sorun oluştu.",
                                    );
                                  }
                                } catch (e) {
                                  console.log(e);
                                }
                              }}
                            ></button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3 shadow-sm">
                <h5> İlanlarım</h5>
                {history.map((h) => (
                  <div
                    className="list-group-item small d-flex justify-content-between align-items-center mb-1"
                    key={h.id}
                  >
                    <span>
                      <strong>{h.title}</strong>
                    </span>
                    <span
                      className={`badge ${h.status === "approved" ? "bg-success" : "bg-secondary"}`}
                    >
                      {h.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === "security" && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card p-3 bg-primary text-white text-center">
                <h6>Toplam İlan</h6>
                <h2>{stats.total_items}</h2>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card p-3 bg-danger text-white text-center">
                <h6>Onay Bekleyenler</h6>
                <h2>{stats.pending_approvals}</h2>
              </div>
            </div>
            <div className="col-12 card p-4 mt-2">
              <h4> Güvenlik Onay & İlan Yönetimi</h4>

              <h5 className="text-warning mt-3">
                ⏳ Onay Bekleyen Yeni İlanlar
              </h5>
              <table className="table table-bordered table-striped mt-2">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Eşya Adı</th>
                    <th>Açıklama</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems
                    .filter((i) => i.status === "pending")
                    .map((i) => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.title}</td>
                        <td>{i.description}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => approveItem(i.id)}
                            >
                              Onayla ve Yayınla
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteItem(i.id)}
                            >
                              🗑️ Reddet & Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <h5 className="text-success mt-4">
                📢 Yayındaki Tüm Aktif İlanlar (Admin Silme Yetkisi)
              </h5>
              <table className="table table-bordered table-striped mt-2">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Eşya Adı</th>
                    <th>Tür</th>
                    <th>Açıklama</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems
                    .filter((i) => i.status === "approved")
                    .map((i) => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.title}</td>
                        <td>
                          <span
                            className={`badge ${i.type === "lost" ? "bg-danger" : "bg-success"}`}
                          >
                            {i.type === "lost" ? "KAYIP" : "BULUNDU"}
                          </span>
                        </td>
                        <td>{i.description}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger fw-bold"
                            onClick={() => deleteItem(i.id)}
                          >
                            Sistemden Kaldır / Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
