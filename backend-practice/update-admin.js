require("dotenv").config();
const { DatabaseSync } = require("node:sqlite");
const argon2 = require("argon2");
const path = require("node:path");

const dbPath = path.join(__dirname, "contacts.db");
const db = new DatabaseSync(dbPath);

async function run() {
    try {
        const username = "Ayub Ciilley";
        const password = process.env.ADMIN_NEW_PASSWORD;

        if (!password || password.length < 12) {
            throw new Error("A password of at least 12 characters is required.");
        }

        const admin = db.prepare(
            "SELECT id FROM admins WHERE username = ?"
        ).get(username);

        if (!admin) {
            throw new Error("Admin account not found.");
        }

        const passwordHash = await argon2.hash(password);

        db.prepare(`
            UPDATE admins
            SET password_hash = ?
            WHERE id = ?
        `).run(passwordHash, admin.id);

        console.log("Admin password updated successfully.");
        console.log("Username:", username);

    } catch (error) {
        console.error("Error:", error.message);
        process.exitCode = 1;
    } finally {
        db.close();
    }
}

run();
