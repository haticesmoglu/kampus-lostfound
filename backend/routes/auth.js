const express = require("express");
const router = express.Router();
const pool = require("../db/database");

//  RESMİ PERSONEL BEYAZ LİSTESİ (Sadece bu mailler güvenlik/admin olabilir)
const AUTHORIZED_PERSONNEL_EMAILS = [
  "guvenlik@edu.tr",
  "security_ahmet@edu.tr",
  "security_mehmet@edu.tr",
  "admin@edu.tr",
  "rektorluk@edu.tr",
];

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const lowerEmail = email.toLowerCase().trim();
  const lowerRole = role ? role.toLowerCase().trim() : "user";

  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [
      lowerEmail,
    ]);
    if (userExist.rows.length > 0)
      return res.status(400).json({ detail: "Bu e-posta zaten kayıtlı." });

    if (
      (lowerRole === "admin" || lowerRole === "security") &&
      lowerEmail.includes("ogrenci")
    ) {
      return res
        .status(403)
        .json({ detail: "Öğrenci e-postasıyla yetkili rolü seçilemez!" });
    }

    if (lowerRole === "security" || lowerRole === "admin") {
      if (!AUTHORIZED_PERSONNEL_EMAILS.includes(lowerEmail)) {
        return res.status(403).json({
          detail:
            "Geçersiz personel e-postası! Yetkili kaydı için kurumsal listede olmalısınız.",
        });
      }
    }

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, lowerEmail, password, lowerRole],
    );

    res.json({ message: "Kayıt başarılı" });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase().trim();
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [lowerEmail, password],
    );
    if (user.rows.length === 0)
      return res.status(401).json({ detail: "Hatalı e-posta veya şifre." });
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
