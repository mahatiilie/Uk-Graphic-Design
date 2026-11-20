require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const path = require("path");
const session = require("express-session");
const {
    saveContact,
    getContacts,
    loginAdmin,
    saveReply,
    getContactById
} = require("./database");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
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
    res.setHeader("Access-Control-Allow-Credentials", "true");
     // Crucial for sessions!

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
app.post("/admin/reply", async (req, res) => {
    try {
        // Check admin session
        if (!req.session || !req.session.admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const contactId = Number(req.body.contactId);
        const replyMessage = req.body.replyMessage;

        // Validate input
        if (
            !Number.isInteger(contactId) ||
            contactId <= 0 ||
            typeof replyMessage !== "string" ||
            !replyMessage.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid reply information."
            });
        }

        if (replyMessage.trim().length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Reply is too long."
            });
        }

        // Find customer
        const contact = getContactById(contactId);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        // Check Gmail configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(503).json({
                success: false,
                message: "Email service is not configured."
            });
        }

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: contact.email,
            replyTo: process.env.EMAIL_USER,
            subject: "Re: Your enquiry to UK Graphic Design",
            text: replyMessage.trim()
        });

        // Save successful reply
        saveReply(
            contactId,
            req.session.admin.id,
            replyMessage.trim()
        );

        return res.json({
            success: true,
            message: "Reply sent successfully."
        });

    } catch (error) {
        console.error("Reply error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send email."
        });
    }
});

// Admin Login Route
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

// Serve Admin Dashboard (Protected Route)
app.get("/admin-dashboard.html", (req, res) => {
    console.log(
    "Dashboard access check:",
    Boolean(req.session && req.session.admin)
);

    if (!req.session || !req.session.admin) {
        return res.status(401).send("Unauthorized. Please login first.");
    }

    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));

});
//serve frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));


// 5. Start Server (Must be at the very bottom)
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});