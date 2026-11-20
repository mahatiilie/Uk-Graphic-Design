
const { loginAdmin } = require("./database");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function test() {
    try {
        const username = "Ayub Ciilley";

        const password = await rl.question(
            "Enter your new admin password: "
        );

        const result = await loginAdmin(username, password);

        if (result) {
            console.log("SUCCESS! Admin authentication works.");
            console.log("Username:", result.username);
        } else {
            console.log("FAILED! Password verification did not match.");
        }
    } catch (error) {
        console.error("Login test error:", error.message);
    } finally {
        rl.close();
    }
}

test();
