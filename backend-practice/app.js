
const http = require("http");
const { saveContact } = require("./database");
const server = http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    const pathname = new URL(req.url, "http://localhost:3000").pathname;

    if (pathname === "/contact" && req.method === "POST") {
       let body = "";
let tooLarge = false;

req.on("data", (chunk) => {
    if (tooLarge) {
        return;
    }

    body += chunk;

    if (Buffer.byteLength(body, "utf8") > 10000) {
        tooLarge = true;

        res.writeHead(413, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: false,
            message: "Request is too large."
        }));

        
    }
});

        req.on("end", () => {
            if (tooLarge) return;

             let data;

try {
    data = JSON.parse(body);
} catch (error) {
    res.writeHead(400, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        success: false,
        message: "Invalid JSON data."
    }));

    return;
}

try {
                if (
    typeof data.name !== "string" ||
    typeof data.email !== "string" ||
    typeof data.message !== "string" ||
    !data.name.trim() ||
    !data.email.trim() ||
    !data.message.trim()
) {
    res.writeHead(400, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        success: false,
        message: "Please provide your name, email, and message."
    }));

    return;
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


if (
    !emailPattern.test(data.email.trim()) ||
    data.name.trim().length > 100 ||
    data.email.trim().length > 254 ||
    data.message.trim().length > 5000
) {
    res.writeHead(400, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        success: false,
        message: "Please check your email and message length."
    }));

    return;
}

saveContact(
    data.name.trim(),
    data.email.trim(),
    data.message.trim()
);

console.log("Contact message saved to database.");
   

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    message: "Your message was received!"
                }));
            } catch (error) {
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Unable to save your message. Please try again."
                }));
            }
        });

    } else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("Route not found");
    }
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
