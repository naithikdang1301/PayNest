// PAYNEST - BUDGET PLANNER

document.addEventListener("DOMContentLoaded", function () {

    const $ = id => document.getElementById(id);
    const email = sessionStorage.getItem("loggedInUser");

    const BUDGET_KEY = "paynestBudgets";
    const EXPENSE_KEY = "paynestExpenses";

    const categories = [
        "Food & Dining",
        "Travel & Transport",
        "Shopping",
        "Bills & Utilities",
        "Education",
        "Entertainment",
        "Others"
    ];

    const icons = ["🍔", "🚗", "🛍️", "📄", "📚", "🎬", "📦"];

    let month = new Date().toLocaleDateString("en-CA").slice(0, 7);
    let budgets = [];
    let expenses = [];

    if (!email) {
        location.href = "login.html";
        return;
    }

    // ---------- HELPERS ----------

    function read(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
            return [];
        }
    }

    function money(value) {
        return "₹" + Number(value).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    function total(items) {
        return items.reduce((sum, item) => sum + Number(item.amount), 0);
    }

    function safe(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function notify(message) {
        $("toast").textContent = message;
        $("toast").className = "budget-toast show";

        setTimeout(() => {
            $("toast").className = "budget-toast";
        }, 2500);
    }

    function load() {
        budgets = read(BUDGET_KEY).filter(item => item.userEmail === email);
        expenses = read(EXPENSE_KEY).filter(item => item.userEmail === email);
    }

    function save(key, userData) {
        const others = read(key).filter(item => item.userEmail !== email);
        localStorage.setItem(key, JSON.stringify([...others, ...userData]));
        render();
    }

    function currentBudget() {
        let item = budgets.find(item => item.month === month);

        if (!item) {
            item = {
                userEmail: email,
                month: month,
                amount: 0,
                limits: {}
            };

            budgets.push(item);
        }

        return item;
    }

    function monthlyExpenses() {
        return expenses.filter(item => item.date.startsWith(month));
    }

    function categorySpent(category) {
        return total(monthlyExpenses().filter(item => item.category === category));
    }

    function daysLeft() {
        const [year, selectedMonth] = month.split("-").map(Number);
        const last = new Date(year, selectedMonth, 0);
        const now = new Date();
        const first = new Date(year, selectedMonth - 1, 1);

        if (now < first) return last.getDate();
        if (now > last) return 0;

        return last.getDate() - now.getDate();
    }

    // ---------- SUMMARY ----------

    function renderSummary() {
        const budget = currentBudget().amount;
        const spent = total(monthlyExpenses());
        const remaining = budget - spent;
        const percent = budget ? Math.round(spent / budget * 100) : 0;
        const progress = Math.min(100, percent);
        const days = daysLeft();

        $("monthlyBudget").textContent = money(budget);
        $("spentAmount").textContent = money(spent);
        $("remainingAmount").textContent = money(remaining);

        $("spentPercent").textContent =
            budget ? percent + "% of budget" : "No budget set";

        $("remainingPercent").textContent =
            budget ? (remaining >= 0 ? money(remaining) + " left" : "Budget exceeded")
                   : "No budget set";

        $("daysLeft").textContent = days + " Days";
        $("monthEnd").textContent = "Until month end";

        $("donutPercent").textContent = budget ? percent + "%" : "—";
        $("budgetDonut").style.setProperty("--donut-progress", progress + "%");

        $("progressSpent").textContent = money(spent);
        $("progressBudget").textContent = money(budget);
        $("progressFill").style.setProperty("--value", progress + "%");
        $("budgetProgressBar").setAttribute("aria-valuenow", progress);

        let status = "Set your monthly budget";
        let message = "Add a budget to start tracking expenses.";

        if (budget && spent > budget) {
            status = "⚠ Budget exceeded";
            message = "You are " + money(spent - budget) + " over budget.";
        } else if (budget && percent >= 80) {
            status = "⚠ Budget almost used";
            message = "You have used " + percent + "% of your budget.";
        } else if (budget) {
            status = "✓ Within your budget";
            message = "You are managing your expenses well.";
        }

        $("budgetStatus").textContent = status;
        $("budgetMessage").textContent = message;

        $("dailyAllowance").textContent =
            budget && days > 0
                ? "Daily spending allowance: " + money(Math.max(0, remaining) / days)
                : "";
    }

    // ---------- CATEGORY CARDS ----------

    function renderCategories() {
        const limits = currentBudget().limits;
        const active = Object.keys(limits);

        $("categoryGrid").innerHTML = active.length
            ? active.map(category => {
                const spent = categorySpent(category);
                const limit = limits[category];
                const percent = limit > 0 ? Math.min(100, spent / limit * 100) : 0;
                const index = categories.indexOf(category);

                return `
                    <article class="budget-rule-card">
                        <div class="category-top">
                            <div class="rule-icon rule-yellow">
                                ${icons[index] || "💳"}
                            </div>

                            <div class="category-actions">
                                <button class="tiny-btn"
                                    data-action="edit-category"
                                    data-name="${safe(category)}">Edit</button>

                                <button class="tiny-btn danger"
                                    data-action="delete-category"
                                    data-name="${safe(category)}">Delete</button>
                            </div>
                        </div>

                        <h4>${safe(category)}</h4>

                        <div class="category-metrics">
                            <span>Spent: ${money(spent)}</span>
                            <span>Limit: ${money(limit)}</span>
                        </div>

                        <div class="category-meter">
                            <span style="width:${percent}%"></span>
                        </div>
                    </article>
                `;
            }).join("")
            : '<div class="empty-card">No categories added yet.</div>';
    }

    // ---------- EXPENSE HISTORY ----------

    function renderExpenses() {
        const search = $("expenseSearch").value.toLowerCase();

        const items = monthlyExpenses()
            .filter(item =>
                (item.description + " " + item.category).toLowerCase().includes(search)
            )
            .sort((a, b) => b.date.localeCompare(a.date));

        $("expenseRows").innerHTML = items.map(item => `
            <tr>
                <td>${safe(item.date)}</td>
                <td>${safe(item.description)}</td>
                <td>${safe(item.category)}</td>
                <td>${money(item.amount)}</td>
                <td>
                    <div class="row-actions">
                        <button class="tiny-btn"
                            data-action="edit-expense"
                            data-id="${safe(item.id)}">Edit</button>

                        <button class="tiny-btn danger"
                            data-action="delete-expense"
                            data-id="${safe(item.id)}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        $("expenseEmpty").hidden = items.length > 0;
    }

    // ---------- ALERTS ----------

    function renderAlerts() {
        const budget = currentBudget();
        const spent = total(monthlyExpenses());
        const alerts = [];

        if (!budget.amount) {
            alerts.push("Set your monthly budget.");
        } else if (spent > budget.amount) {
            alerts.push("Monthly budget exceeded!");
        } else if (spent >= budget.amount * 0.8) {
            alerts.push("You have used 80% or more of your budget.");
        } else {
            alerts.push("Your monthly budget is on track.");
        }

        Object.keys(budget.limits).forEach(category => {
            const limit = budget.limits[category];
            const spent = categorySpent(category);

            if (spent > limit) {
                alerts.push(category + " category limit exceeded!");
            } else if (limit > 0 && spent >= limit * 0.8) {
                alerts.push(category + " is close to its limit.");
            }
        });

        $("alertCount").textContent = alerts.length + " updates";

        $("alertsList").innerHTML = alerts.map(message => `
            <div class="alert warning">
                <i>!</i>
                <div><b>${safe(message)}</b></div>
            </div>
        `).join("");
    }

    // ---------- TIPS ----------

    function renderTips() {
        const budget = currentBudget().amount;
        const spent = total(monthlyExpenses());

        const tips = [
            budget
                ? "Remaining monthly balance: " + money(budget - spent)
                : "Set a monthly budget to manage your money.",

            budget && spent > budget
                ? "Try reducing unnecessary expenses."
                : "Keep tracking expenses regularly.",

            "Review category limits every month."
        ];

        $("tipsGrid").innerHTML = tips.map((tip, index) => `
            <div class="budget-tip">
                <div class="tip-number">0${index + 1}</div>
                <div>
                    <b>Budget Tip</b>
                    <p>${safe(tip)}</p>
                </div>
            </div>
        `).join("");
    }

    function render() {
        renderSummary();
        renderCategories();
        renderExpenses();
        renderAlerts();
        renderTips();
    }

    // ---------- MONTHLY BUDGET ----------

    function openBudget() {
        $("budgetInput").value = currentBudget().amount;
        $("budgetDialogMonth").textContent = month;
        $("budgetDialog").showModal();
    }

    $("setBudgetBtn").onclick = openBudget;
    $("editBudgetBtn").onclick = openBudget;

    $("budgetForm").onsubmit = function (event) {
        event.preventDefault();

        const amount = Number($("budgetInput").value);

        if (!Number.isFinite(amount) || amount < 0) {
            notify("Enter a valid budget.");
            return;
        }

        currentBudget().amount = amount;
        save(BUDGET_KEY, budgets);
        $("budgetDialog").close();
        notify("Budget saved successfully.");
    };

    // ---------- ADD / EDIT CATEGORY ----------

    function openCategory(category = "") {
        $("categoryForm").reset();
        $("categoryId").value = category;
        $("categoryName").value = category;
        $("categoryLimit").value =
            category ? currentBudget().limits[category] : "";

        $("categoryDialogTitle").textContent =
            category ? "Edit Category" : "Add Category";

        $("categoryDialog").showModal();
    }

    $("addCategoryBtn").onclick = () => openCategory();

    $("categoryForm").onsubmit = function (event) {
        event.preventDefault();

        const oldName = $("categoryId").value;
        const name = $("categoryName").value;
        const limit = Number($("categoryLimit").value);

        if (!categories.includes(name) || !Number.isFinite(limit) || limit < 0) {
            notify("Select a valid category and limit.");
            return;
        }

        const limits = currentBudget().limits;

        if (oldName && oldName !== name) delete limits[oldName];

        limits[name] = limit;

        save(BUDGET_KEY, budgets);
        $("categoryDialog").close();
        notify("Category saved.");
    };

    $("categoryGrid").onclick = function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const category = button.dataset.name;

        if (button.dataset.action === "edit-category") {
            openCategory(category);
        } else if (confirm("Delete this category limit?")) {
            delete currentBudget().limits[category];
            save(BUDGET_KEY, budgets);
            notify("Category deleted.");
        }
    };

    // ---------- ADD / EDIT EXPENSE ----------

    function openExpense(id = "") {
        const item = expenses.find(expense => expense.id === id);

        $("expenseForm").reset();
        $("expenseId").value = item ? item.id : "";
        $("expenseDialogTitle").textContent =
            item ? "Edit Expense" : "Add Expense";

        $("expenseCategory").innerHTML = categories.map(category =>
            `<option value="${safe(category)}">${safe(category)}</option>`
        ).join("");

        $("expenseDate").value = item ? item.date : month + "-01";
        $("expenseDescription").value = item ? item.description : "";
        $("expenseCategory").value = item ? item.category : categories[0];
        $("expenseAmount").value = item ? item.amount : "";

        $("expenseDialog").showModal();
    }

    $("addExpenseBtn").onclick = () => openExpense();

    $("expenseForm").onsubmit = function (event) {
        event.preventDefault();

        const id = $("expenseId").value;
        const date = $("expenseDate").value;
        const description = $("expenseDescription").value.trim();
        const category = $("expenseCategory").value;
        const amount = Number($("expenseAmount").value);

        if (
            !date.startsWith(month) ||
            !description ||
            !categories.includes(category) ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            notify("Enter valid expense details for the selected month.");
            return;
        }

        const item = {
            id: id || String(Date.now()) + "-" + Math.random(),
            userEmail: email,
            date,
            description,
            category,
            amount
        };

        if (id) {
            const index = expenses.findIndex(expense => expense.id === id);
            if (index !== -1) expenses[index] = item;
        } else {
            expenses.push(item);
        }

        save(EXPENSE_KEY, expenses);
        $("expenseDialog").close();
        notify("Expense saved successfully.");
    };

    $("expenseRows").onclick = function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.action === "edit-expense") {
            openExpense(id);
        } else if (confirm("Delete this expense?")) {
            expenses = expenses.filter(item => item.id !== id);
            save(EXPENSE_KEY, expenses);
            notify("Expense deleted.");
        }
    };

    // ---------- EXPORT / BACKUP ----------

    function download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    $("exportCsvBtn").onclick = function () {
        let csv = "Date,Description,Category,Amount\n";

        monthlyExpenses().forEach(item => {
            csv += [item.date, item.description, item.category, item.amount]
                .map(value => {
                    let text = String(value).replace(/"/g, '""');
                    if (/^\s*[=+\-@]/.test(text)) text = "'" + text;
                    return '"' + text + '"';
                }).join(",") + "\n";
        });

        download(csv, "paynest-" + month + ".csv", "text/csv");
    };

    $("exportJsonBtn").onclick = function () {
        const backup = {
            budgets,
            expenses
        };

        download(
            JSON.stringify(backup, null, 2),
            "paynest-backup.json",
            "application/json"
        );
    };

    $("importBtn").onclick = () => $("importFile").click();

    $("importFile").onchange = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function () {
            try {
                const backup = JSON.parse(reader.result);

                if (!Array.isArray(backup.budgets) ||
                    !Array.isArray(backup.expenses)) {
                    notify("Invalid backup file.");
                    return;
                }

                if (confirm("Replace your saved budgets and expenses?")) {
                    budgets = backup.budgets.map(item => ({
                        ...item,
                        userEmail: email
                    }));

                    expenses = backup.expenses.map(item => ({
                        ...item,
                        userEmail: email
                    }));

                    save(BUDGET_KEY, budgets);
                    save(EXPENSE_KEY, expenses);
                    notify("Backup restored.");
                }
            } catch {
                notify("Could not read backup file.");
            }
        };

        reader.readAsText(file);
        event.target.value = "";
    };

    $("clearBtn").onclick = function () {
        if (!confirm("Delete your budgets and expenses?")) return;

        budgets = [];
        expenses = [];

        save(BUDGET_KEY, budgets);
        save(EXPENSE_KEY, expenses);
        notify("Your financial data has been cleared.");
    };

    // ---------- OTHER EVENTS ----------

    $("monthPicker").value = month;

    $("monthPicker").onchange = function () {
        month = this.value;
        $("expenseSearch").value = "";
        render();
    };

    $("expenseSearch").oninput = renderExpenses;

    document.querySelectorAll("[data-close]").forEach(button => {
        button.onclick = () => button.closest("dialog").close();
    });

    $("confirmCancel").onclick = () => $("confirmDialog").close();

    $("copyrightYear").textContent = new Date().getFullYear();

    window.addEventListener("storage", function (event) {
        if ([BUDGET_KEY, EXPENSE_KEY].includes(event.key)) {
            load();
            render();
        }
    });

    load();
    render();
});