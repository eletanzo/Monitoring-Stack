const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Put DB in a data folder
const dbPath = path.resolve(__dirname, "data", "ips.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS ips (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT UNIQUE)"
  );
});

module.exports = db;
