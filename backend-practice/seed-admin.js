const { createAdmin } = require("./database");

async function run() {
    try {
        // You can change 'admin' and your secure password here
        const username = "admin";
        const password = "SecurePassword123!";

        await createAdmin(username, password);
        console.log(`Success! Admin user "${username}" was created.`);
    } catch (error) {
        console.error("Error creating admin:", error.message);
    }
}

run();