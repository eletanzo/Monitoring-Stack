const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Get all targets in Prometheus format
app.get("/api/targets", (req, res) => {
  db.all("SELECT ip FROM ips", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const targets = rows.map((row) => row.ip);
    res.json([{ targets: targets, labels: {} }]); // Single object in array for now, add labels later
  });
});

// Get all IPs
app.get("/api/ips", (req, res) => {
  db.all("SELECT * FROM ips", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new IP
app.post("/api/ips", (req, res) => {
  console.log("POST /api/ips:" + req.body.toSource()); // Debugging line
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP is required" });

  db.run("INSERT INTO ips (ip) VALUES (?)", [ip], function (err) {
    if (err) return res.status(400).json({ error: "IP must be unique" });
    res.json({ id: this.lastID, ip });
  });
});

// Delete IP
app.delete("/api/ips/:id", (req, res) => {
  db.run("DELETE FROM ips WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
