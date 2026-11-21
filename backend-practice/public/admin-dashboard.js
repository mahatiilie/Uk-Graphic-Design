
const contactsList = document.getElementById("contacts-list");
const messageStatus = document.getElementById("message-status");
const replyForm = document.getElementById("reply-form");
const replyCustomerEmail = document.getElementById("reply-customer-email");
const replyMessage = document.getElementById("reply-message");
const sendReplyButton = document.getElementById("send-reply-button");

const cancelReplyButton = document.getElementById("cancel-reply-button");
const replyStatus = document.getElementById("reply-status");
const totalMessages = document.getElementById("total-messages");
const refreshButton = document.getElementById("refresh-button");
const logoutButton = document.getElementById("logout-button");
let selectedContactId = null;

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
            const actionCell = document.createElement("td");
            

            const replyButton = document.createElement("button");
            replyButton.textContent = "Reply";
            replyButton.addEventListener("click", function() {
                selectedContactId = contact.id;
                    console.log("REPLY BUTTON CLICKED");
                    console.log("Reply form element:", replyForm);
console.log("Reply form before:", replyForm.style.display);

    replyForm.style.display = "block";
   
    
    replyCustomerEmail.textContent = "Replying to: " + contact.email;

    replyMessage.value = "";

    replyStatus.textContent = "";
});



            actionCell.appendChild(replyButton);


            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(messageCell);
            row.appendChild(dateCell);
            row.appendChild(actionCell);

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
cancelReplyButton.addEventListener("click", function() {
    replyForm.style.display = "none";
    replyMessage.value = "";
    replyStatus.textContent = "";
});
sendReplyButton.addEventListener("click", async function() {

    const message = replyMessage.value.trim();

    if (!selectedContactId) {
        replyStatus.textContent = "Please select a customer first.";
        return;
    }

    if (!message) {
        replyStatus.textContent = "Please write a reply message.";
        return;
    }

    try {
        sendReplyButton.disabled = true;
        replyStatus.textContent = "Sending reply...";

        const response = await fetch("/admin/reply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contactId: selectedContactId,
                replyMessage: message
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || result.message || "Failed to send reply.");
        }

        replyStatus.textContent = "Reply sent successfully!";
        replyMessage.value = "";

    } catch (error) {
        console.error("Reply error:", error);
        replyStatus.textContent = error.message;

    } finally {
        sendReplyButton.disabled = false;
    }
});
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
