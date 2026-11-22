const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const argon2 = require('argon2');
const dbPath = path.join(__dirname, 'contacts.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    is_published INTEGER NOT NULL DEFAULT 0
      CHECK (is_published IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id)
      REFERENCES portfolio_projects(id)
      ON DELETE CASCADE
  )
`);
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
db.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    reply_message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
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
const insertReply = db.prepare(`
  INSERT INTO replies (contact_id, admin_id, reply_message)
  VALUES (?, ?, ?)
`);

function saveReply(contactId, adminId, replyMessage) {
  return insertReply.run(contactId, adminId, replyMessage);
}
const findContactById = db.prepare(`
    SELECT id, name, email, message
    FROM contacts
    WHERE id = ?
`);

function getContactById(contactId) {
    return findContactById.get(contactId);
}
function getContacts() {
  return db.prepare(`
    SELECT id, name, email, message, created_at
    FROM contacts
    ORDER BY id DESC
  `).all();
}
const insertPortfolioProject = db.prepare(`
  INSERT INTO portfolio_projects (title, description, category)
  VALUES (?, ?, ?)
`);
function createPortfolioProject(title, description, category) {
  return insertPortfolioProject.run(title, description, category);
}
const insertPortfolioImage = db.prepare(`
  INSERT INTO portfolio_images (project_id, image_path)
  VALUES (?, ?)
`);
function addPortfolioImage(projectId, imagePath) {
  return insertPortfolioImage.run(projectId, imagePath);
}
const getAllPortfolioProjects = db.prepare(`
  SELECT *
  FROM portfolio_projects
  ORDER BY id DESC
`);
function getPortfolioProjects() {
  return getAllPortfolioProjects.all();
}
const getPublishedPortfolioProjects = db.prepare(`
  SELECT *
  FROM portfolio_projects
  WHERE is_published = 1
  ORDER BY id DESC
`);
function getPublishedProjects() {
  return getPublishedPortfolioProjects.all();
}
const getPortfolioImages = db.prepare(`
  SELECT *
  FROM portfolio_images
  WHERE project_id = ?
  ORDER BY id ASC
`);
function getPortfolioImagesByProject(projectId) {
  return getPortfolioImages.all(projectId);
}
module.exports = {
  saveContact,
  getContacts,
  createAdmin,
  loginAdmin,
  saveReply,
  getContactById,
  createPortfolioProject,
  addPortfolioImage,
  getPortfolioProjects,
  getPublishedProjects,
  getPortfolioImagesByProject
};
