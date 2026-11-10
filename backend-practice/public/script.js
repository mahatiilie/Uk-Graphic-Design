const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("contact-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (name === "") {
    alert("Please enter your name.");
    return;
  }
  if (email === "") {
    alert("Please enter your email.");
    return;
  }
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  if (message === "") {
    alert("Please enter your message.");
    return;
  }

 fetch("http://localhost:3000/contact", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: name,
        email: email,
        message: message
    })
})
.then(function (response) {
    return response.json();
})
.then(function (data) {
    if (data.success) {
        alert("Your message was received!");
        form.reset();
    } else {
        alert("Sorry, your message could not be sent.");
    }
})
.catch(function (error) {
    console.error("Error:", error);
    alert("Could not connect to the server. Please try again.");
});
});
const buttons = document.querySelectorAll(".faq-question");

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
  console.log("FAQ clicked");

  const answer = button.parentElement.querySelector(".faq-answer");


  answer.classList.toggle("active");
  });
});

