const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("contact-form");

form.addEventListener("submit", function(event){
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  
  if (name === "") {
    alert("please enter your name.");
    return;
  }
  if (email === "") {
    alert("please enter your email.");
    return;
    
  }
  if (!emailPattern.test(email)) {
      alert("please enter a valid email address.");
      return;
    }
  if (message === "") {
    alert("please enter your message.");
    return;
  }

  console.log(name, email, message);
  alert("Form submitted!");
  form.reset();
});