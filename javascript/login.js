
// ================= CAPTCHA =================

let captcha = "";

function refreshCaptcha() {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    captcha = "";

    for (let i = 0; i < 6; i++) {
        let number = Math.floor(Math.random() * characters.length);
        captcha += characters.charAt(number);
    }

    document.getElementById("captchaText").innerText = captcha;
    document.getElementById("captchaInput").value = "";
}

// ================= SHOW / HIDE PASSWORD =================

function togglePassword(id, eye) {
    let password = document.getElementById(id);

    if (password.type === "password") {
        password.type = "text";
        eye.innerText = "🙈";
    } else {
        password.type = "password";
        eye.innerText = "👁";
    }
}

// ================= LOGIN =================

function loginUser() {
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("password").value;
    let enteredCaptcha = document.getElementById("captchaInput").value.trim();

    // Empty fields
    if (email === "" || password === "" || enteredCaptcha === "") {
        alert("Please fill all fields.");
        return false;
    }

    // CAPTCHA verification
    if (enteredCaptcha.toUpperCase() !== captcha) {
        alert("Incorrect CAPTCHA. Please try again.");
        refreshCaptcha();
        return false;
    }

    // Get registered users
    let users = JSON.parse(localStorage.getItem("paynestUsers")) || [];

    let matchedUser = null;

    for (let i = 0; i < users.length; i++) {
        if (
            users[i].email.toLowerCase() === email &&
            users[i].password === password
        ) {
            matchedUser = users[i];
            break;
        }
    }

    // Check login credentials
    if (matchedUser === null) {
        alert("Invalid email or password.");
        refreshCaptcha();
        return false;
    }

    // Remember Me
    let remember = document.querySelector(".remember input").checked;

    if (remember) {
        localStorage.setItem("rememberedEmail", email);
    } else {
        localStorage.removeItem("rememberedEmail");
    }

    // Save login session
    sessionStorage.setItem("loggedInUser", email);

    alert("Login successful! Welcome to PayNest.");

    window.location.href = "index.html";

    return false;
}

function forgotPassword() {

    let email = document.getElementById("email").value.trim().toLowerCase();

    // Check email
    if (email === "") {
        alert("Please enter your registered email first.");
        return;
    }

    // Get registered users
    let users = JSON.parse(localStorage.getItem("paynestUsers")) || [];

    // Find user
    let userIndex = -1;

    for (let i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email) {
            userIndex = i;
            break;
        }
    }

    // Check if account exists
    if (userIndex === -1) {
        alert("No account found with this email.");
        return;
    }

    // Ask for new password
    let newPassword = prompt("Enter your new password:");

    if (newPassword === null) {
        return;
    }

    // Password validation
    if (newPassword.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    if (
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword)
    ) {
        alert("Password must contain uppercase, lowercase and a number.");
        return;
    }

    // Confirm new password
    let confirmPassword = prompt("Confirm your new password:");

    if (confirmPassword === null) {
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Update saved password
    users[userIndex].password = newPassword;

    try {
        localStorage.setItem("paynestUsers", JSON.stringify(users));
        alert("Password reset successfully! You can now login.");
    } catch (error) {
        alert("Unable to update password. Please try again.");
    }
}

// ================= PAGE LOAD =================

window.onload = function () {

    // Generate new CAPTCHA
    refreshCaptcha();

    // Remember saved email
    let savedEmail = localStorage.getItem("rememberedEmail");

    if (savedEmail) {
        document.getElementById("email").value = savedEmail;
        document.querySelector(".remember input").checked = true;
    }
};

