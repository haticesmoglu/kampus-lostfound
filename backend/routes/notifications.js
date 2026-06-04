const express = require("express");
const router = express.Router();
const pool = require("../db/database");

router.get("/:userId", async (req, res) => {
  try {
    const notifs = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC",
      [req.params.userId],
    );
    res.json(notifs.rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
