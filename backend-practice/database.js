const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const argon2 = require('argon2');
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
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
const insertContact = db.prepare(`
  INSERT INTO contacts (name, email, message)
  VALUES (?, ?, ?)
`);
const insertAdmin = db.prepare(`
  INSERT INTO admins (username, password_hash)
  VALUES (?, ?)
`);
const findAdmin = db.prepare(`
  SELECT id, username, password_hash FROM admins
  WHERE username = ?
`);
function saveContact(name, email, message) {
  return insertContact.run(name, email, message);
}
  async function createAdmin(username, password) {
    const existingAdmin = findAdmin.get(username);

    if (existingAdmin) {
    throw new Error("Username already exists");
}
    const passwordHash = await argon2.hash(password);

    return insertAdmin.run(username, passwordHash);
}
async function loginAdmin(username, password) {
const admin = findAdmin.get(username);
if (!admin) {
    return null;
}
const passwordMatch = await argon2.verify(
    admin.password_hash,
    password
);
if (!passwordMatch) {
    return null;
}
return {
    id: admin.id,
    username: admin.username
};
}

function getContacts() {
  return db.prepare(`
    SELECT id, name, email, message, created_at
    FROM contacts
    ORDER BY id DESC
  `).all();
}
module.exports = {
  saveContact,
  getContacts,
  createAdmin,
  loginAdmin
};