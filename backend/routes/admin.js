const express = require("express");
const router = express.Router();
const pool = require("../db/database");

router.get("/all-items", async (req, res) => {
  const all = await pool.query("SELECT * FROM items ORDER BY id DESC");
  res.json(all.rows);
});

router.get("/stats", async (req, res) => {
  const total = await pool.query("SELECT COUNT(*) FROM items");
  const pending = await pool.query(
    "SELECT COUNT(*) FROM items WHERE status = 'pending'",
  );
  res.json({
    total_items: total.rows[0].count,
    pending_approvals: pending.rows[0].count,
  });
});

// Canlı onaylama sistemi
router.put("/items/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { admin_id } = req.query;
  try {
    const admin = await pool.query("SELECT role FROM users WHERE id = $1", [
      admin_id,
    ]);
    if (!admin.rows[0] || !["admin", "security"].includes(admin.rows[0].role)) {
      return res.status(403).json({ detail: "Bu işlem için yetkiniz yok." });
    }

    await pool.query("UPDATE items SET status = 'approved' WHERE id = $1", [
      id,
    ]);

    const item = await pool.query(
      "SELECT user_id, title FROM items WHERE id = $1",
      [id],
    );
    if (item.rows[0]) {
      await pool.query(
        "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
        [
          item.rows[0].user_id,
          `İlanınız güvenlik tarafından onaylandı ve yayına alındı: ${item.rows[0].title}`,
        ],
      );
    }

    res.json({ message: "İlan başarıyla onaylandı." });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
