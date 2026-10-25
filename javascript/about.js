// ==========================================
// PAYNEST - ABOUT PAGE JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // MOBILE MENU
    // ==========================================

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelectorAll(".nav-links a");

    // Close menu when clicking a navigation link
    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (menuToggle) {
                menuToggle.checked = false;
            }

        });

    });

    // Close menu when clicking outside navbar
    document.addEventListener("click", function (event) {

        const navbar = document.querySelector(".navbar");

        if (
            menuToggle &&
            menuToggle.checked &&
            navbar &&
            !navbar.contains(event.target)
        ) {
            menuToggle.checked = false;
        }

    });

    // Close menu on Escape key
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && menuToggle) {
            menuToggle.checked = false;
        }

    });

});