// PAYNEST - DASHBOARD

document.addEventListener("DOMContentLoaded", function () {

    const $ = id => document.getElementById(id);
    const email = sessionStorage.getItem("loggedInUser");

    if (!email) {
        location.href = "login.html";
        return;
    }

    const KEYS = {
        expenses: "paynestExpenses",
        budgets: "paynestBudgets",
        income: "paynestIncome",
        savings: "paynestSavings",
        users: "paynestUsers"
    };

    const icons = {
        "Food & Dining": "🍔",
        "Travel & Transport": "🚗",
        "Shopping": "🛍️",
        "Bills & Utilities": "📄",
        "Education": "📚",
        "Entertainment": "🎬",
        "Others": "📦"
    };

    const classes = {
        "Food & Dining": "food",
        "Travel & Transport": "travel",
        "Education": "education",
        "Bills & Utilities": "bills",
        "Entertainment": "entertainment"
    };

    // ---------- HELPERS ----------

    function read(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function userData(key) {
        return read(key).filter(item => item.userEmail === email);
    }

    function currentUser() {
        return read(KEYS.users).find(user => user.email === email) || {};
    }

    function money(amount) {
        const currency = currentUser().currency || "INR";

        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
                maximumFractionDigits: 2
            }).format(Number(amount) || 0);
        } catch {
            return "₹" + Number(amount || 0).toFixed(2);
        }
    }

    function sum(items, field = "amount") {
        return items.reduce((total, item) =>
            total + (Number(item[field]) || 0), 0
        );
    }

    function today() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function thisMonth() {
        return today().slice(0, 7);
    }

    function monthItems(items, month) {
        return items.filter(item =>
            typeof item.date === "string" &&
            item.date.startsWith(month)
        );
    }

    function make(tag, className = "", text = "") {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        return element;
    }

    // ---------- SHARED DATA ----------

    function expenses() {
        return userData(KEYS.expenses).filter(item =>
            item.date && Number(item.amount) > 0
        );
    }

    function incomes() {
        return userData(KEYS.income).filter(item =>
            item.date && Number(item.amount) > 0
        );
    }

    function budgetFor(month) {
        const item = userData(KEYS.budgets).find(item =>
            item.month === month
        );

        return item ? Number(item.amount) || 0 : 0;
    }

    function budgetLimits(month) {
        const item = userData(KEYS.budgets).find(item =>
            item.month === month
        );

        return item && item.limits ? item.limits : {};
    }

    function savingsGoals() {
        return userData(KEYS.savings);
    }

    // ---------- MONTH SELECTOR ----------

    function setupMonths() {
        const select = $("dashboardMonth");
        const previous = select.value;
        const months = new Set([thisMonth()]);

        [...expenses(), ...incomes()].forEach(item => {
            if (item.date) months.add(item.date.slice(0, 7));
        });

        userData(KEYS.budgets).forEach(item => {
            if (item.month) months.add(item.month);
        });

        select.innerHTML = "";

        [...months].sort().reverse().forEach(month => {
            const [year, number] = month.split("-").map(Number);

            const title = new Date(year, number - 1, 1)
                .toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                });

            const option = document.createElement("option");
            option.value = month;
            option.textContent = "📅 " + title;

            select.append(option);
        });

        select.value = months.has(previous) ? previous : thisMonth();
    }

    // ---------- WELCOME ----------

    function renderWelcome() {
        const hour = new Date().getHours();

        $("greetingTime").textContent =
            hour < 12 ? "Morning" :
            hour < 17 ? "Afternoon" : "Evening";

        $("dashboardUser").textContent =
            currentUser().name || email.split("@")[0];
    }

    // ---------- SUMMARY ----------

    function renderSummary(month) {
        const spent = sum(monthItems(expenses(), month));
        const budget = budgetFor(month);

        const balance = sum(incomes()) - sum(expenses());
        const goals = savingsGoals();
        const saved = sum(goals, "saved");

        $("totalBalance").textContent = money(balance);
        $("monthlyBudget").textContent = money(budget);
        $("monthlySpent").textContent = money(spent);
        $("totalSavings").textContent = money(saved);

        const percentage = budget > 0 ? spent / budget * 100 : 0;
        const progress = Math.min(100, percentage);

        $("budgetAmounts").textContent =
            `${money(spent)} / ${money(budget)} spent`;

        $("budgetPercent").textContent =
            budget ? Math.round(percentage) + "%" : "—";

        $("budgetFill").style.width = progress + "%";

        $("budgetFill").style.background =
            percentage >= 100 ? "#ff4757" :
            percentage >= 80 ? "#ffa502" : "#f5b700";

        $("budgetRemaining").textContent =
            !budget ? "Set a monthly budget to start tracking." :
            spent > budget
                ? money(spent - budget) + " over budget"
                : money(budget - spent) + " remaining";

        renderAlerts(month, budget, spent, percentage);
        renderGoals(goals);
        renderTransactions(monthItems(expenses(), month));
    }

    // ---------- SAVINGS GOALS ----------

    function renderGoals(goals) {
        const root = $("dashboardGoals");
        root.replaceChildren();

        if (!goals.length) {
            root.append(make(
                "p",
                "dashboard-empty",
                "No savings goals yet. Add one from the Savings page."
            ));
            return;
        }

        goals.slice(0, 3).forEach(goal => {
            const target = Number(goal.target) || 0;
            const saved = Number(goal.saved) || 0;
            const percent = target > 0 ? saved / target * 100 : 0;

            const row = make("div", "goal");
            const icon = make("div", "goal-icon", goal.icon || "🎯");
            const info = make("div", "goal-info");

            info.append(
                make("h3", "", goal.name || "Savings Goal"),
                make("strong", "", `${money(saved)} / ${money(target)}`)
            );

            const bar = make("div", "goal-bar");
            const fill = make("span");

            fill.style.width = Math.min(100, percent) + "%";
            bar.append(fill);

            info.append(
                bar,
                make("p", "", money(Math.max(0, target - saved)) + " remaining")
            );

            row.append(
                icon,
                info,
                make("b", "percentage", Math.round(percent) + "%")
            );

            root.append(row);
        });
    }

    // ---------- ALERTS ----------

    function addAlert(root, type, symbol, title, description) {
        const box = make("div", "alert " + type);
        const details = make("div");

        details.append(
            make("strong", "", title),
            make("p", "", description)
        );

        box.append(make("span", "", symbol), details);
        root.append(box);
    }

    function renderAlerts(month, budget, spent, percent) {
        const root = $("dashboardAlerts");
        root.replaceChildren();

        if (!budget) {
            addAlert(
                root, "info", "●",
                "No monthly budget set",
                "Set your budget from the Budget page."
            );
        } else if (spent > budget) {
            addAlert(
                root, "warning", "⚠",
                "Monthly budget exceeded!",
                money(spent - budget) + " over budget."
            );
        } else if (percent >= 80) {
            addAlert(
                root, "warning", "⚠",
                "Budget almost used",
                Math.round(percent) + "% of your budget spent."
            );
        } else {
            addAlert(
                root, "success", "✓",
                "Budget is on track",
                money(budget - spent) + " remaining."
            );
        }

        const items = monthItems(expenses(), month);
        const limits = budgetLimits(month);

        Object.keys(limits).forEach(category => {
            const limit = Number(limits[category]);

            if (limit <= 0) return;

            const categoryTotal = sum(
                items.filter(item => item.category === category)
            );

            if (categoryTotal >= limit) {
                addAlert(
                    root, "warning", "⚠",
                    category + " limit reached",
                    `${money(categoryTotal)} spent / ${money(limit)} limit`
                );
            } else if (categoryTotal >= limit * 0.8) {
                addAlert(
                    root, "warning", "⚠",
                    category + " near its limit",
                    `${money(categoryTotal)} spent / ${money(limit)} limit`
                );
            }
        });

        if (!items.length) {
            addAlert(
                root, "info", "●",
                "No expenses this month",
                "Add an expense to start tracking."
            );
        } else {
            const daily = {};

            items.forEach(item => {
                daily[item.date] =
                    (daily[item.date] || 0) + Number(item.amount);
            });

            const [date, amount] = Object.entries(daily)
                .sort((a, b) => b[1] - a[1])[0];

            addAlert(
                root, "info", "●",
                "Highest spending: " + date,
                "Total spent: " + money(amount)
            );
        }
    }

    // ---------- RECENT TRANSACTIONS ----------

    function renderTransactions(items) {
        const root = $("dashboardTransactions");
        root.replaceChildren();

        if (!items.length) {
            root.append(make(
                "p",
                "dashboard-empty",
                "No transactions in this month. Add your first expense!"
            ));
            return;
        }

        items.sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .forEach(item => {
                const row = make("div", "transaction");
                const description = make("div", "description");

                description.append(
                    make("i", "", icons[item.category] || "💸"),
                    make("span", "",
                        item.description || item.category || "Expense")
                );

                const category = make(
                    "span",
                    "category " + (classes[item.category] || "food"),
                    item.category || "Others"
                );

                const date = make("span", "", item.date);
                const amount = make(
                    "strong",
                    "amount",
                    "- " + money(item.amount)
                );

                row.append(description, category, date, amount);
                root.append(row);
            });
    }

    // ---------- ADD INCOME ----------

    function openIncome() {
        $("incomeForm").reset();
        $("incomeDate").value = today();

        $("incomeModal").classList.add("show");
        $("incomeModal").setAttribute("aria-hidden", "false");
        $("incomeAmount").focus();
    }

    function closeIncome() {
        $("incomeModal").classList.remove("show");
        $("incomeModal").setAttribute("aria-hidden", "true");
    }

    $("incomeForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const amount = Number($("incomeAmount").value);
        const source = $("incomeSource").value.trim();
        const date = $("incomeDate").value;

        if (!Number.isFinite(amount) || amount <= 0 || !source || !date) {
            alert("Enter valid income details.");
            return;
        }

        const all = read(KEYS.income);

        all.push({
            id: Date.now() + "-" + Math.random(),
            userEmail: email,
            amount,
            source,
            date
        });

        localStorage.setItem(KEYS.income, JSON.stringify(all));

        closeIncome();
        render();

        $("dashboardMonth").value = date.slice(0, 7);
        renderSummary($("dashboardMonth").value);

        alert("Income added successfully!");
    });

    // ---------- QUICK ACTIONS ----------

    function action(id, callback) {
        const element = $(id);

        element.addEventListener("click", callback);

        element.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                callback();
            }
        });
    }

    action("quickAddExpense", () => location.href = "expenses.html");
    action("quickAddIncome", openIncome);
    action("quickSetBudget", () => location.href = "budget.html");

    $("closeIncomeModal").onclick = closeIncome;
    $("cancelIncome").onclick = closeIncome;

    $("incomeModal").onclick = event => {
        if (event.target === $("incomeModal")) closeIncome();
    };

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeIncome();
    });

    // ---------- NAVIGATION ----------

    window.goToProfile = () => location.href = "profile.html";
    window.goToLogin = () => location.href = "login.html";
    window.goToSignup = () => location.href = "signup.html";

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.onclick = () => {
            const menu = $("menu-toggle");
            if (menu) menu.checked = false;
        };
    });

    // ---------- RENDER ----------

    function render() {
        renderWelcome();
        setupMonths();
        renderSummary($("dashboardMonth").value);
    }

    $("dashboardMonth").onchange = function () {
        renderSummary(this.value);
    };

    window.addEventListener("storage", event => {
        if (Object.values(KEYS).includes(event.key)) render();
    });

    window.addEventListener("focus", render);

    render();
});