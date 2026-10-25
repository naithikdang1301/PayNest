// =====================================
// PayNest - Contact Page JavaScript
// =====================================




function saveContactMessage(contactMessage) {

    return new Promise(function (resolve, reject) {

        // Simulate asynchronous processing
        setTimeout(function () {

            try {

                var messages = JSON.parse(
                    localStorage.getItem("payNestContactMessages") || "[]"
                );

                if (!Array.isArray(messages)) {
                    throw new Error("Invalid contact message data.");
                }

                messages.push(contactMessage);

                localStorage.setItem(
                    "payNestContactMessages",
                    JSON.stringify(messages)
                );

                // Promise fulfilled
                resolve("Message saved successfully!");

            } catch (error) {

                // Promise rejected
                reject(error);

            }

        }, 1000);

    });

}


// =====================================
// 2. CONTACT FORM
// =====================================

function setupContactForm() {

    var form = document.querySelector(".contact-form form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Get form values

        var name = form.querySelector('input[type="text"]').value.trim();

        var email = form.querySelector('input[type="email"]').value.trim();

        var subject = form.querySelector("select").value;

        var message = form.querySelector("textarea").value.trim();

        var terms = form.querySelector('input[type="checkbox"]').checked;


        // =====================================
        // VALIDATION 1 - EMPTY FIELDS
        // =====================================

        if (
            name === "" ||
            email === "" ||
            subject === "" ||
            message === ""
        ) {

            alert("Please fill in all required fields.");

            return;
        }


        // =====================================
        // VALIDATION 2 - FULL NAME
        // =====================================

        var namePattern = /^[a-zA-Z\s]+$/;

        if (!namePattern.test(name)) {

            alert("Please enter a valid name using letters only.");

            return;
        }


        // =====================================
        // VALIDATION 3 - EMAIL
        // =====================================

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");

            return;
        }


        // =====================================
        // VALIDATION 4 - MESSAGE LENGTH
        // =====================================

        if (message.length < 10) {

            alert("Message must contain at least 10 characters.");

            return;
        }


        // =====================================
        // VALIDATION 5 - TERMS & CONDITIONS
        // =====================================

        if (!terms) {

            alert(
                "Please accept the Terms & Conditions and Privacy Policy."
            );

            return;
        }


        // =====================================
        // 3. CREATE CONTACT MESSAGE OBJECT
        // =====================================

        var contactMessage = {

            name: name,

            email: email,

            subject: subject,

            message: message,

            date: new Date().toLocaleString()

        };


        // =====================================
        // 4. PROMISE + ASYNC/AWAIT
        // =====================================

        var submitButton = form.querySelector(
            'button[type="submit"]'
        );
        var originalButtonText = "";

        if (submitButton) {
            if (submitButton.disabled) {
                return;
            }

            originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }

        try {
            var result = await saveContactMessage(contactMessage);
            console.log(result);
            var successMessage = document.getElementById(
                "successMessage"
            );
            if (successMessage) {
                successMessage.textContent =
                    "✓ Thank you, " + name +
                    "! Your message has been saved successfully.";
                successMessage.style.display = "block";
            } 
            else {
                alert(
                    "Thank you, " + name +
                    "! Your message has been saved successfully."
                );

            }


            // =====================================
            // 6. RESET FORM
            // =====================================

            form.reset();

        } catch (error) {

            // Promise rejected
            console.error("Contact form error:", error);

            alert(
                "Unable to save your message. Please try again."
            );

        } finally {

            // Restore submit button
            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent = originalButtonText;

            }

        }

    });

}


// =====================================
// 7. MOBILE NAVBAR
// =====================================

function setupMobileNavbar() {

    var menuToggle = document.getElementById("menu-toggle");

    var navLinks = document.querySelectorAll(".nav-links a");

    for (var i = 0; i < navLinks.length; i++) {

        navLinks[i].addEventListener("click", function () {

            if (menuToggle) {
                menuToggle.checked = false;
            }

        });
    }
}


// =====================================
// 8. INITIALISE PAGE
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    setupContactForm();

    setupMobileNavbar();

});