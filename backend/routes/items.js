const express = require("express");
const router = express.Router();
const pool = require("../db/database");

router.get("/", async (req, res) => {
  try {
    const items = await pool.query(
      "SELECT * FROM items WHERE status = 'approved' ORDER BY id DESC",
    );
    res.json(items.rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

router.get("/meta/categories", async (req, res) => {
  try {
    const cats = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(cats.rows);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.get("/history/:userId", async (req, res) => {
  try {
    const history = await pool.query(
      "SELECT * FROM items WHERE user_id = $1 ORDER BY id DESC",
      [req.params.userId],
    );
    res.json(history.rows);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.post("/", async (req, res) => {
  const { title, description, category_id, type, user_id } = req.body;

  try {
    let safeUserId = parseInt(user_id) || 1;
    let safeCategoryId = parseInt(category_id) || 1;

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      safeUserId,
    ]);
    if (userCheck.rows.length === 0) {
      const firstUser = await pool.query(
        "SELECT id FROM users ORDER BY id ASC LIMIT 1",
      );
      safeUserId = firstUser.rows[0]?.id || 1;
    }

    const catCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [safeCategoryId],
    );
    if (catCheck.rows.length === 0) {
      const firstCat = await pool.query(
        "SELECT id FROM categories ORDER BY id ASC LIMIT 1",
      );
      safeCategoryId = firstCat.rows[0]?.id || 1;
    }

    const newItem = await pool.query(
      "INSERT INTO items (title, description, type, status, user_id, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        title || "İsimsiz Eşya",
        description || "Açıklama yok",
        type || "lost",
        "pending",
        safeUserId,
        safeCategoryId,
      ],
    );

    res.status(201).json(newItem.rows[0]);
  } catch (err) {
    console.error("VERİTABANI KESİN HATASI:", err.message);
    res.status(500).json({ detail: err.message });
  }
});

router.post("/claim/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const { claimerName, claimerEmail } = req.body;

  try {
    const itemQuery = await pool.query(
      "SELECT user_id, title FROM items WHERE id = $1",
      [itemId],
    );

    if (itemQuery.rows.length === 0) {
      return res.status(404).json({ detail: "İlan bulunamadı." });
    }

    const item = itemQuery.rows[0];
    const itemOwnerId = item.user_id;
    const itemTitle = item.title;

    const message = `🤝 İletişim Talebi: '${itemTitle}' ilanınız için ${claimerName} bildirimde bulundu.||${claimerEmail}`;

    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
      [itemOwnerId, message],
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ detail: err.message });
  }
});

router.post("/direct-message", async (req, res) => {
  const { targetEmail, replyMessage, senderName, senderEmail } = req.body;

  try {
    const userQuery = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [targetEmail.trim()],
    );

    let targetUserId;
    if (userQuery.rows.length > 0) {
      targetUserId = userQuery.rows[0].id;
    } else {
      const firstUser = await pool.query(
        "SELECT id FROM users ORDER BY id ASC LIMIT 1",
      );
      targetUserId = firstUser.rows[0]?.id || 1;
    }

    const incomingMsg = `💬 ${senderName} kullanıcısından mesaj: "${replyMessage}"||${senderEmail}`;
    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
      [targetUserId, incomingMsg],
    );

    const senderQuery = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [senderEmail.trim()],
    );
    if (senderQuery.rows.length > 0) {
      const myId = senderQuery.rows[0].id;
      const outgoingMsg = `📤 Giden: "${replyMessage}"||${targetEmail}`;
      await pool.query(
        "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
        [myId, outgoingMsg],
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mesajlaşma hatası:", err.message);
    res.status(500).json({ detail: err.message });
  }
});

router.delete("/delete-item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await pool.query("DELETE FROM notifications WHERE item_id = $1", [id]);
    } catch (e) {
      console.log("Bildirim temizleme adımı atlandı:", e.message);
    }

    const deleteResult = await pool.query("DELETE FROM items WHERE id = $1", [
      id,
    ]);

    if (deleteResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Silinecek ilan bulunamadı." });
    }

    res.status(200).json({ success: true, message: "İlan başarıyla silindi." });
  } catch (err) {
    console.error("🔴 VERİTABANI SİLME HATASI:", err.message);
    res.status(500).json({ detail: err.message });
  }
});
module.exports = router;
