const { loginAdmin } = require("./database");

async function test() {
    // Let's test the credentials we created
    const username = "admin";
    const password = "SecurePassword123!";

    console.log(`Testing login for username: "${username}"...`);
    const result = await loginAdmin(username, password);
    
    if (result) {
        console.log("SUCCESS! Login function returned admin object:", result);
    } else {
        console.log("FAILED! loginAdmin returned null (username not found or password incorrect).");
    }
}

test();