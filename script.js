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

  console.log(name, email, message);
  alert("Form submitted!");
  form.reset();
});
