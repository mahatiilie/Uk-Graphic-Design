const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const dbPath = path.join(__dirname, 'contacts.db');
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
const insertContact = db.prepare(`
  INSERT INTO contacts (name, email, message)
  VALUES (?, ?, ?)
`);
function saveContact(name, email, message) {
  return insertContact.run(name, email, message);
}
module.exports = { saveContact };