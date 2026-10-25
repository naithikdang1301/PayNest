// ==========================================
// PAYNEST - PROFILE PAGE JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const email = sessionStorage.getItem("loggedInUser");

    if (!email) {
        location.href = "login.html";
        return;
    }

    const USER_KEY = "paynestUsers";

    const DATA_KEYS = [
        "paynestExpenses",
        "paynestBudgets",
        "paynestIncome",
        "paynestSavings",
        "paynestSavingsActivity"
    ];

    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);


    // ==========================================
    // 1. STORAGE FUNCTIONS
    // ==========================================

    function read(key) {
        try {
            const data = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch {
            return [];
        }
    }

    function currentUser() {
        return read(USER_KEY).find(
            user => user.email === email
        );
    }

    function saveUser(changes) {

        const users = read(USER_KEY);

        const index = users.findIndex(
            user => user.email === email
        );

        if (index === -1) return false;

        users[index] = {
            ...users[index],
            ...changes
        };

        try {

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(users)
            );

            return true;

        } catch {

            alert("Unable to save profile data.");

            return false;
        }
    }

    function currencySymbol(currency) {

        return {
            INR: "₹",
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥"
        }[currency] || "₹";
    }


    // ==========================================
    // 2. DISPLAY PROFILE
    // ==========================================

    function displayProfile() {

        const user = currentUser();

        if (!user) return;

        const name = $(".name-row h2");

        if (name) {
            name.textContent = user.name || "PayNest User";
        }

        const contactValues = [
            user.email || "Not provided",
            user.phone || "Not provided",
            user.college || "Not provided",
            user.course || "Not provided"
        ];

        $$(".profile-info .contact-info p").forEach(
            (element, index) => {

                const icon = element.querySelector("i");

                element.textContent = "";

                if (icon) {
                    element.append(icon);
                }

                element.append(
                    document.createTextNode(
                        " " + (
                            contactValues[index] ||
                            "Not provided"
                        )
                    )
                );
            }
        );

        const fieldValues = [
            user.name || "Not provided",
            user.email || "Not provided",
            user.phone || "Not provided",
            user.college || "Not provided",
            user.course || "Not provided",
            user.studentId || "Not provided",

            (user.currency || "INR") +
            " (" +
            currencySymbol(user.currency || "INR") +
            ")",

            user.memberSince || "Not available"
        ];

        $$(".personal-grid .field .input-box span").forEach(
            (element, index) => {

                element.textContent =
                    fieldValues[index] || "";

            }
        );

        const avatar = $(".avatar");

        if (avatar) {

            avatar.replaceChildren();

            if (user.profileImage) {

                const image = document.createElement("img");

                image.src = user.profileImage;
                image.alt = "Profile Picture";

                avatar.append(image);

            } else {

                avatar.textContent =
                    (user.name || "P")
                        .charAt(0)
                        .toUpperCase();

            }
        }
    }


    // ==========================================
    // 3. EDIT PROFILE
    // ==========================================

    function editProfile() {

        const user = currentUser();

        if (!user) return;

        let name = prompt(
            "Full name:",
            user.name || ""
        );

        if (name === null) return;

        name = name.trim();

        if (name.length < 2) {

            alert(
                "Name must contain at least 2 characters."
            );

            return;
        }

        let phone = prompt(
            "Phone number:",
            user.phone || ""
        );

        if (phone === null) return;

        phone = phone.trim();

        if (
            phone &&
            !/^[0-9+\s()-]{7,20}$/.test(phone)
        ) {

            alert("Enter a valid phone number.");

            return;
        }

        const college = prompt(
            "College:",
            user.college || ""
        );

        if (college === null) return;

        const course = prompt(
            "Course:",
            user.course || ""
        );

        if (course === null) return;

        const studentId = prompt(
            "Student ID:",
            user.studentId || ""
        );

        if (studentId === null) return;

        if (
            saveUser({
                name,
                phone,
                college: college.trim(),
                course: course.trim(),
                studentId: studentId.trim()
            })
        ) {

            displayProfile();

            alert("Profile updated successfully!");
        }
    }

    $$(".edit-btn, .small-edit").forEach(button => {

        button.addEventListener(
            "click",
            editProfile
        );

    });


    // ==========================================
    // 4. PROFILE PICTURE
    // ==========================================

    const cameraButton = $(".camera-btn");

    if (cameraButton) {

        const fileInput = document.createElement("input");

        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.hidden = true;

        document.body.append(fileInput);

        cameraButton.addEventListener("click", () => {

            fileInput.click();

        });

        fileInput.addEventListener("change", () => {

            const file = fileInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {

                alert("Select a valid image.");

                return;
            }

            if (file.size > 1024 * 1024) {

                alert("Image must be smaller than 1 MB.");

                return;
            }

            const reader = new FileReader();

            reader.onload = () => {

                if (
                    saveUser({
                        profileImage: reader.result
                    })
                ) {

                    displayProfile();

                    alert("Profile picture updated!");
                }
            };

            reader.readAsDataURL(file);

            fileInput.value = "";

        });
    }


    // ==========================================
    // 5. PREFERENCES
    // ==========================================

    function loadPreferences() {

        const user = currentUser();

        if (!user) return;

        const selects = $$(
            ".preferences-grid .preference-select"
        );

        const notifications = $(
            ".notification-setting input[type='checkbox']"
        );

        if (selects.length >= 2) {

            selects[0].value =
                user.currency || "INR";

            selects[1].value =
                localStorage.getItem("payNestTheme") ||
                "dark";
        }

        if (notifications) {

            notifications.checked =
                user.notifications !== false;
        }
    }


    function savePreferences() {

        const selects = $$(
            ".preferences-grid .preference-select"
        );

        const notifications = $(
            ".notification-setting input[type='checkbox']"
        );

        if (selects.length < 2) return;

        const currency = selects[0].value;

        const theme = selects[1].value;

        if (
            saveUser({
                currency,
                notifications: notifications
                    ? notifications.checked
                    : true
            })
        ) {

            // Theme is managed by common.js
            if (
                window.PayNest &&
                typeof window.PayNest.setTheme === "function"
            ) {

                window.PayNest.setTheme(theme);

            } else {

                console.error(
                    "PayNest.setTheme() not found. Check common.js."
                );

            }

            displayProfile();

            loadPreferences();

            alert("Preferences saved successfully!");
        }
    }


    const saveButton = $(".save-btn");

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            savePreferences
        );
    }


    // ==========================================
    // 6. SYNC THEME DROPDOWN
    // ==========================================

    // common.js handles theme button clicks.
    // This only updates the Preferences dropdown.

    const themeButton = $(".btn-theme");

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            setTimeout(loadPreferences, 0);

        });
    }


    // ==========================================
    // 7. CHANGE PASSWORD
    // ==========================================

    const passwordButton = $(".update-password-btn");

    if (passwordButton) {

        passwordButton.addEventListener("click", () => {

            const inputs = $$(".password-grid input");

            if (inputs.length < 3) return;

            const user = currentUser();

            if (!user) return;

            const oldPassword = inputs[0].value;
            const newPassword = inputs[1].value;
            const confirmPassword = inputs[2].value;

            if (
                !oldPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                alert("Fill all password fields.");

                return;
            }

            if (oldPassword !== user.password) {

                alert("Current password is incorrect.");

                return;
            }

            if (
                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
                    .test(newPassword)
            ) {

                alert(
                    "Password needs 8 characters, uppercase, lowercase and number."
                );

                return;
            }

            if (newPassword !== confirmPassword) {

                alert("Passwords do not match.");

                return;
            }

            if (newPassword === oldPassword) {

                alert("Choose a different password.");

                return;
            }

            if (
                saveUser({
                    password: newPassword
                })
            ) {

                inputs.forEach(input => {

                    input.value = "";

                });

                alert("Password updated successfully!");
            }
        });
    }


    // ==========================================
    // 8. SHOW / HIDE PASSWORD
    // ==========================================

    $$(".password-input .fa-eye").forEach(icon => {

        icon.addEventListener("click", () => {

            const input =
                icon.parentElement.querySelector("input");

            if (!input) return;

            const visible =
                input.type === "password";

            input.type =
                visible ? "text" : "password";

            icon.classList.toggle(
                "fa-eye",
                !visible
            );

            icon.classList.toggle(
                "fa-eye-slash",
                visible
            );

        });
    });


    // ==========================================
    // 9. EXPORT ALL USER DATA
    // ==========================================

    const exportButton = $(".export-btn");

    if (exportButton) {

        exportButton.addEventListener("click", () => {

            const user = currentUser();

            if (!user) return;

            const exportObject = {

                profile: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    college: user.college,
                    course: user.course,
                    studentId: user.studentId,
                    currency: user.currency,
                    memberSince: user.memberSince
                },

                expenses: read("paynestExpenses").filter(
                    item => item.userEmail === email
                ),

                budgets: read("paynestBudgets").filter(
                    item => item.userEmail === email
                ),

                income: read("paynestIncome").filter(
                    item => item.userEmail === email
                ),

                savings: read("paynestSavings").filter(
                    item => item.userEmail === email
                ),

                savingsActivity: read(
                    "paynestSavingsActivity"
                ).filter(
                    item => item.userEmail === email
                )
            };

            const blob = new Blob(
                [
                    JSON.stringify(
                        exportObject,
                        null,
                        2
                    )
                ],
                {
                    type: "application/json"
                }
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                "PayNest_My_Data.json";

            link.click();

            URL.revokeObjectURL(url);

        });
    }


    // ==========================================
    // 10. RESET ALL FINANCIAL DATA
    // ==========================================

    const resetButton = $(".reset-btn");

    if (resetButton) {

        resetButton.addEventListener("click", () => {

            const confirmation = confirm(
                "Delete ALL your Expenses, Budget, Income and Savings data?\n\n" +
                "This cannot be undone."
            );

            if (!confirmation) return;

            try {

                DATA_KEYS.forEach(key => {

                    const others = read(key).filter(
                        item => item.userEmail !== email
                    );

                    localStorage.setItem(
                        key,
                        JSON.stringify(others)
                    );

                });

                alert(
                    "Your financial data has been reset successfully!"
                );

            } catch {

                alert("Unable to reset all data.");

            }
        });
    }


    // ==========================================
    // 11. LOGOUT
    // ==========================================

    const logoutButton = $(".logout-btn");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            if (
                !confirm(
                    "Are you sure you want to logout?"
                )
            ) {
                return;
            }

            sessionStorage.removeItem(
                "loggedInUser"
            );

            location.href = "login.html";

        });
    }


    // ==========================================
    // 12. MOBILE NAVIGATION
    // ==========================================

    const menu =
        document.getElementById("menu-toggle");

    $$(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            if (menu) {
                menu.checked = false;
            }

        });
    });


    // ==========================================
    // 13. INITIAL LOAD
    // ==========================================

    if (!currentUser()) {

        alert(
            "Please login to view your profile."
        );

        location.href = "login.html";

        return;
    }

    displayProfile();

    loadPreferences();


    // ==========================================
    // 14. STORAGE SYNC
    // ==========================================

    window.addEventListener("storage", event => {

        if (
            event.key === USER_KEY ||
            event.key === "payNestTheme"
        ) {

            displayProfile();

            loadPreferences();

        }
    });

});