// ================= CAPTCHA =================

let signupCaptcha = "";

function refreshSignupCaptcha() {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    signupCaptcha = "";

    for (let i = 0; i < 6; i++) {
        let number = Math.floor(Math.random() * characters.length);
        signupCaptcha += characters.charAt(number);
    }

    document.getElementById("captchaText").innerText = signupCaptcha;
    document.getElementById("signupCaptcha").value = "";
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

// ================= SIGNUP =================

function signupUser() {

    let name = document.getElementById("fullName").value.trim();
    let email = document.getElementById("signupEmail").value.trim().toLowerCase();
    let password = document.getElementById("signupPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let currency = document.getElementById("currency").value;
    let enteredCaptcha = document.getElementById("signupCaptcha").value.trim();

    // Check empty fields
    if (
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === "" ||
        currency === "" ||
        enteredCaptcha === ""
    ) {
        alert("Please fill all fields.");
        return false;
    }

    // Check name
    if (name.length < 2) {
        alert("Please enter your full name.");
        return false;
    }

    // Check password length
    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return false;
    }

    // Check password strength
    if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        alert("Password must contain uppercase, lowercase and a number.");
        return false;
    }

    // Confirm password
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    // CAPTCHA verification
    if (enteredCaptcha.toUpperCase() !== signupCaptcha) {
        alert("Incorrect CAPTCHA. Please try again.");
        refreshSignupCaptcha();
        return false;
    }

    // Read registered users
    let users = JSON.parse(localStorage.getItem("paynestUsers")) || [];

    // Check duplicate email
    for (let i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === email) {
            alert("An account with this email already exists.");
            return false;
        }
    }

    // Create new user
    let user = {
        name: name,
        email: email,
        password: password,
        currency: currency
    };

    // Add user to array
    users.push(user);

    // Save all users
    try {
        localStorage.setItem("paynestUsers", JSON.stringify(users));
    } catch (error) {
        alert("Unable to save account. Check browser storage.");
        return false;
    }

    alert("Account created successfully! Please login.");

    window.location.href = "login.html";

    return false;
}

// ================= PAGE LOAD =================

window.addEventListener("DOMContentLoaded", function () {
    refreshSignupCaptcha();
});