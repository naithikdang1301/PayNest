// ================= PAYNEST COMMON JS =================
// Theme, Navbar, Login/Logout, Navigation

(function () {
    "use strict";

    const THEME_KEY = "payNestTheme";
    const SESSION_KEY = "loggedInUser";
    const USER_KEY = "paynestUsers";

    const privatePages = [
        "dashboard.html",
        "expenses.html",
        "budget.html",
        "savings.html",
        "profile.html"
    ];

    // ================= USER =================

    function currentUser() {
        const email = sessionStorage.getItem(SESSION_KEY);

        if (!email) return null;

        try {
            const users = JSON.parse(
                localStorage.getItem(USER_KEY) || "[]"
            );

            return users.find(user => user.email === email) || null;

        } catch {
            return null;
        }
    }

    function isLoggedIn() {
        return currentUser() !== null;
    }

    // ================= PAGE PROTECTION =================

    function protectPage() {
        const page = location.pathname.split("/").pop().toLowerCase();

        if (privatePages.includes(page) && !isLoggedIn()) {
            sessionStorage.removeItem(SESSION_KEY);
            location.replace("login.html");
            return false;
        }

        return true;
    }

    // ================= THEME =================

    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY) || "dark";

        if (saved === "system") {
            return window.matchMedia("(prefers-color-scheme: light)").matches
                ? "light"
                : "dark";
        }

        return saved === "light" ? "light" : "dark";
    }

    function applyTheme() {
        const light = getTheme() === "light";

        document.documentElement.classList.toggle("light-theme", light);
        document.body.classList.toggle("light-theme", light);

        document.querySelectorAll(".btn-theme, #themeButton").forEach(button => {
            button.textContent = light ? "🌙" : "☀️";
            button.title = light
                ? "Switch to Dark Mode"
                : "Switch to Light Mode";
        });
    }

    function setTheme(theme) {
        if (!["light", "dark", "system"].includes(theme)) return;

        localStorage.setItem(THEME_KEY, theme);
        applyTheme();
    }

    function toggleTheme() {
        setTheme(getTheme() === "light" ? "dark" : "light");
    }

    // ================= NAVBAR =================

    function updateNavbar() {
        const navbar = document.querySelector(".nav-buttons");

        if (!navbar) return;

        const loggedIn = isLoggedIn();

        const profile = navbar.querySelector(".btn-profile");
        const login = navbar.querySelector(".btn-outline");
        const signup = navbar.querySelector(".btn-yellow");

        if (profile) profile.style.display = loggedIn ? "" : "none";
        if (login) login.style.display = loggedIn ? "none" : "";
        if (signup) signup.style.display = loggedIn ? "none" : "";

        let logoutButton = navbar.querySelector(".btn-logout");

        if (!logoutButton) {
            logoutButton = document.createElement("button");
            logoutButton.className = "btn-logout";
            logoutButton.textContent = "🚪 Logout";
            logoutButton.type = "button";

            logoutButton.addEventListener("click", logout);
            navbar.appendChild(logoutButton);
        }

        logoutButton.style.display = loggedIn ? "" : "none";
    }

    // ================= LOGOUT =================

    function logout() {
        if (!confirm("Are you sure you want to logout?")) return;

        sessionStorage.removeItem(SESSION_KEY);
        location.href = "home.html";
    }

    // ================= NAVIGATION =================

    function goToProfile() {
        location.href = isLoggedIn() ? "profile.html" : "login.html";
    }

    function goToLogin() {
        location.href = "login.html";
    }

    function goToSignup() {
        location.href = "signup.html";
    }

    function goToDashboard() {
        location.href = isLoggedIn() ? "dashboard.html" : "login.html";
    }

    function goToExpenses() {
        location.href = isLoggedIn() ? "expenses.html" : "login.html";
    }

    function goToBudget() {
        location.href = isLoggedIn() ? "budget.html" : "login.html";
    }

    function goToSavings() {
        location.href = isLoggedIn() ? "savings.html" : "login.html";
    }

    function goToAbout() {
        location.href = "about.html";
    }

    // ================= MOBILE MENU =================

    function setupMobileMenu() {
        const menu = document.getElementById("menu-toggle");

        if (!menu) return;

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                menu.checked = false;
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") menu.checked = false;
        });
    }

    // ================= GLOBAL FUNCTIONS =================

    window.goToProfile = goToProfile;
    window.goToLogin = goToLogin;
    window.goToSignup = goToSignup;
    window.goToDashboard = goToDashboard;
    window.goToExpenses = goToExpenses;
    window.goToBudget = goToBudget;
    window.goToSavings = goToSavings;
    window.goToAbout = goToAbout;

    window.logout = logout;
    window.logoutUser = logout;

    window.PayNest = {
        currentUser,
        isLoggedIn,
        applyTheme,
        setTheme,
        toggleTheme,
        updateNavbar,
        logout
    };

    // ================= INITIALIZE =================

    function init() {
        if (!protectPage()) return;

        applyTheme();
        updateNavbar();
        setupMobileMenu();

        document.querySelectorAll(".btn-theme, #themeButton").forEach(button => {

            // Remove inline theme handler to prevent double toggle
            button.removeAttribute("onclick");

            button.addEventListener("click", toggleTheme);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // ================= THEME SYNC =================

    window.addEventListener("storage", event => {
        if (event.key === THEME_KEY) {
            applyTheme();
        }

        if (event.key === USER_KEY) {
            updateNavbar();
        }
    });

    const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

    if (systemTheme.addEventListener) {
        systemTheme.addEventListener("change", () => {
            if (localStorage.getItem(THEME_KEY) === "system") {
                applyTheme();
            }
        });
    }

})();