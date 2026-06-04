#  Kampüs Kayıp & Bulunan Eşya Portalı

Bu proje; üniversite kampüsü içerisindeki öğrencilerin, akademik ve idari personelin kaybettikleri veya buldukları eşyaları dijital bir ortamda güvenli, hızlı ve koordineli bir şekilde yönetebilmelerini sağlayan **Ayrık Mimari)** prensibiyle geliştirilmiş bir web uygulamasıdır.

Sistem; kayıp süreçlerindeki kaosu azaltmayı, kampüs içi dayanışmayı artırmayı ve güvenliği üst seviyede tutmayı amaçlamaktadır.

---

##  Teknolojik Altyapı 

* **Frontend (İstemci Katmanı):** React, JavaScript, Bootstrap (Responsive / Mobil Uyumlu Tasarım)
* **Backend (Sunucu Katmanı):** Node.js, Express.js (RESTful API standartlarında rotalandırma)
* **Database (Veri Katmanı):** PostgreSQL (İlişkisel Veritabanı Yönetim Sistemi - RDBMS)

---

##  Temel Özellikler & İşlevsellik

*  **Güvenli Kimlik Doğrulama:** Kullanıcı kayıt ve giriş sistemi.
*  **Akıllı İlan Akışı:** Kampüs genelinde onaylanmış tüm aktif kayıp ve bulunan ilanlarının listelenmesi.
*  **Anlık Canlı Filtreleme:** Sayfa yenilenmeden kelime, ilan türü (Kayıp/Bulundu) ve kategorilere göre anlık süzme algoritması.
*  **Yetkili (Security/Admin) Yönetim Paneli:** Yeni ilanlar için "Pending" (Onay Bekliyor) mekanizması, ilan onaylama/reddetme ve yayındaki tüm aktif ilanları sistemden kaldırma yetkisi.
*  **WhatsApp Tarzı Canlı İletişim:** Eşyayı bulan ve kaybeden kullanıcılar arasında profil paneline anlık yansıyan asimetrik (sağa/sola yaslı) sohbet modülü.
*  **Durum Takibi:** İlan sahibinin, eşyası teslim edildiğinde tek tıkla ilanı "Eşya Bulundu" diyerek yayından kaldırabilme fonksiyonu.

---

##  Kurulum ve Çalıştırma Talimatları

### 1. Veritabanı Kurulumu
PostgreSQL üzerinde projenize ait bir veritabanı oluşturun ve gerekli tablo şemalarını (Users, Items, Notifications) içeri aktarın.

### 2. Backend Sunucusunu Başlatma
```bash
cd backend
npm install
node server.js
```

### 3. Frontend İstemcisini Başlatma
cd frontend
npm install
npm start

Rol Tabanlı Yetkilendirme Hiyerarşisi (RBAC)
1.Misafir (Guest): İlanları ve filtreleri görüntüleyebilir; ilan açamaz veya mesaj atamaz.

2.Öğrenci / Personel (User): İlan oluşturabilir, kendi ilanını "Bulundu" olarak kaldırabilir ve diğer kullanıcılarla anlık mesajlaşabilir.

3.Kampüs Güvenliği / Yönetim (Admin/Security): Tüm onay bekleyen talepleri denetler, onaylar/reddeder ve sistemdeki tüm aktif ilanları global olarak silebilir.
