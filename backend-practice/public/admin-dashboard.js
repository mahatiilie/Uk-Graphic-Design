
const contactsList = document.getElementById("contacts-list");
const messageStatus = document.getElementById("message-status");
const totalMessages = document.getElementById("total-messages");
const refreshButton = document.getElementById("refresh-button");
const logoutButton = document.getElementById("logout-button");

async function loadContacts() {
    try {
        const response = await fetch("/contacts");

        console.log("Server response:", response.status);

        if (!response.ok) {
            throw new Error("Failed to load contacts");
        }

        const contacts = await response.json();
        totalMessages.textContent = contacts.length;

        console.log("Contacts received:", contacts);

        contactsList.innerHTML = "";

        contacts.forEach(function(contact) {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = contact.name;

            const emailCell = document.createElement("td");
            emailCell.textContent = contact.email;

            const messageCell = document.createElement("td");
            messageCell.textContent = contact.message;

            const dateCell = document.createElement("td");
            dateCell.textContent = contact.created_at;

            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(messageCell);
            row.appendChild(dateCell);

            contactsList.appendChild(row);
        });

        messageStatus.textContent = contacts.length + " messages loaded successfully.";

    } catch (error) {
        console.error("Error loading contacts:", error);
        messageStatus.textContent = "Unable to load customer messages.";
    }
}
refreshButton.addEventListener("click", loadContacts);
loadContacts();
logoutButton.addEventListener("click", async function() {
    try {
        const response = await fetch("/admin/logout", {
            method: "POST"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Logout failed");
        }

        window.location.href = "/admin-login.html";

    } catch (error) {
        console.error("Logout error:", error);
        messageStatus.textContent = "Unable to log out. Please try again.";
    }
});
