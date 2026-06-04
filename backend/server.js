const express = require("express");
const cors = require("cors");
const pool = require("./db/database");

const app = express();
app.use(cors());
app.use(express.json());

// API Rotaları
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(
    `Node.js Express sunucusu ${PORT} portunda başarıyla ayağa kalktı!`,
  );
});
