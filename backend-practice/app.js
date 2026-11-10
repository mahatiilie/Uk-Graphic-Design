const express = require("express");
const app = express();
const session = require("express-session");
const { saveContact, getContacts, loginAdmin } = require("./database");

// 1. Session Middleware
app.use(
    session({
        secret: "uk-graphic-design-super-secret-key-2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// 2. Body Parser Middleware (Must be BEFORE routes)
app.use(express.json({ limit: "10kb" }));

// 3. CORS Middleware (Allow credentials so cookies/sessions can be sent back and forth)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // Crucial for sessions!

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// 4. Routes
app.post("/contact", (req, res) => {
    if (
        !req.body ||
        typeof req.body.name !== "string" ||
        typeof req.body.email !== "string" ||
        typeof req.body.message !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid input."
        });
    }
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const message = req.body.message.trim();

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address."
        });
    }
    try {
        saveContact(name, email, message);
        return res.status(201).json({
            success: true,
            message: "Your message was received!"
        });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
});

app.get("/contacts", (req, res) => {
    if (!req.session || !req.session.admin) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const contacts = getContacts();
    res.json(contacts);
});
app.post("/admin/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ success: true });
});

// Admin Login Route (Placed BEFORE app.listen)
app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password || typeof username !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const admin = await loginAdmin(username.trim(), password);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // Save admin info in session
        req.session.admin = {
            id: admin.id,
            username: admin.username
        };

        return res.status(200).json({
            success: true,
            message: "Login successful!"
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login."
        });
    }
});

// 5. Start Server (Must be at the very bottom)
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});