// PAYNEST - SAVINGS

const email = sessionStorage.getItem("loggedInUser");

if (!email) {
    location.href = "login.html";
}

const GOAL_KEY = "paynestSavings";
const ACTIVITY_KEY = "paynestSavingsActivity";

let goals = [];
let activity = [];

// ---------- STORAGE ----------

function read(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function loadSavings() {
    goals = read(GOAL_KEY).filter(item => item.userEmail === email);
    activity = read(ACTIVITY_KEY).filter(item => item.userEmail === email);
}

function saveSavings() {
    const otherGoals = read(GOAL_KEY).filter(item => item.userEmail !== email);
    const otherActivity = read(ACTIVITY_KEY).filter(item => item.userEmail !== email);

    localStorage.setItem(
        GOAL_KEY,
        JSON.stringify([...otherGoals, ...goals])
    );

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify([...otherActivity, ...activity])
    );
}

// ---------- HELPERS ----------

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function validAmount(value) {
    return value !== null &&
        value.trim() !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0;
}

function addActivity(name, action, amount) {
    activity.unshift({
        userEmail: email,
        date: new Date().toLocaleDateString("en-IN"),
        name,
        action,
        amount
    });

    activity = activity.slice(0, 30);
}

// ---------- NEW GOAL ----------

function newGoal() {
    let name = prompt("Goal name:");
    if (name === null) return;

    name = name.trim();

    if (!name) {
        alert("Enter a goal name.");
        return;
    }

    const description = prompt("Goal description:");
    if (description === null) return;

    const target = prompt("Target amount (₹):");

    if (!validAmount(target)) {
        alert("Enter a valid target amount.");
        return;
    }

    goals.push({
        id: Date.now() + "-" + Math.random(),
        userEmail: email,
        name,
        description,
        target: Number(target),
        saved: 0,
        icon: "🎯"
    });

    saveSavings();
    showGoals();
    alert("Savings goal created successfully!");
}

// ---------- GOAL OPTIONS ----------

function goalOptions(index) {
    const choice = prompt(
        "1. Add Money\n" +
        "2. Withdraw Money\n" +
        "3. Edit Goal\n" +
        "4. Delete Goal"
    );

    if (choice === "1") addMoney(index);
    else if (choice === "2") withdrawMoney(index);
    else if (choice === "3") editGoal(index);
    else if (choice === "4") deleteGoal(index);
    else if (choice !== null) alert("Choose 1, 2, 3 or 4.");
}

// ---------- ADD MONEY ----------

function addMoney(index) {
    const amount = prompt("Amount to add (₹):");

    if (amount === null) return;

    if (!validAmount(amount)) {
        alert("Enter a valid amount.");
        return;
    }

    goals[index].saved += Number(amount);

    addActivity(goals[index].name, "Added", Number(amount));

    saveSavings();
    showGoals();

    alert("Money added successfully!");
}

// ---------- WITHDRAW MONEY ----------

function withdrawMoney(index) {
    const amount = prompt("Amount to withdraw (₹):");

    if (amount === null) return;

    if (!validAmount(amount)) {
        alert("Enter a valid amount.");
        return;
    }

    if (Number(amount) > goals[index].saved) {
        alert("Insufficient savings.");
        return;
    }

    goals[index].saved -= Number(amount);

    addActivity(goals[index].name, "Withdrawn", Number(amount));

    saveSavings();
    showGoals();

    alert("Money withdrawn successfully!");
}

// ---------- EDIT GOAL ----------

function editGoal(index) {
    const goal = goals[index];

    let name = prompt("Goal name:", goal.name);
    if (name === null) return;

    name = name.trim();

    if (!name) {
        alert("Goal name cannot be empty.");
        return;
    }

    const description = prompt("Description:", goal.description);
    if (description === null) return;

    const target = prompt("Target amount (₹):", goal.target);
    if (target === null) return;

    if (!validAmount(target)) {
        alert("Enter a valid target amount.");
        return;
    }

    goal.name = name;
    goal.description = description;
    goal.target = Number(target);

    saveSavings();
    showGoals();

    alert("Goal updated successfully!");
}

// ---------- DELETE GOAL ----------

function deleteGoal(index) {
    if (!confirm("Delete " + goals[index].name + "?")) return;

    goals.splice(index, 1);

    saveSavings();
    showGoals();

    alert("Goal deleted successfully!");
}

// ---------- DISPLAY GOALS ----------

function showGoals() {
    const list = document.getElementById("goalsList");
    list.innerHTML = "";

    const colors = [
        "fill-yellow",
        "fill-blue",
        "fill-purple",
        "fill-orange"
    ];

    const backgrounds = [
        "yellow-bg",
        "blue-bg",
        "purple-bg",
        "orange-bg"
    ];

    const icons = [
        "fa-piggy-bank",
        "fa-laptop",
        "fa-graduation-cap",
        "fa-wallet"
    ];

    let totalSaved = 0;
    let totalTarget = 0;

    goals.forEach((goal, index) => {
        totalSaved += Number(goal.saved);
        totalTarget += Number(goal.target);

        const percent = goal.target > 0
            ? Math.min(100, goal.saved / goal.target * 100)
            : 0;

        const remaining = Math.max(0, goal.target - goal.saved);

        const card = document.createElement("div");
        card.className = "goal-item";

        card.innerHTML = `
            <div class="goal-left">
                <div class="goal-icon ${backgrounds[index % 4]}">
                    <i class="fa-solid ${icons[index % 4]}"></i>
                </div>

                <div class="goal-info">
                    <div class="title-wrap">
                        <h3></h3>
                        <span class="tag-badge">
                            ${goal.saved >= goal.target ? "Completed" : "On Track"}
                        </span>
                    </div>
                    <p></p>
                </div>
            </div>

            <div class="goal-middle">
                <div class="amount-wrap">
                    <strong>${money(goal.saved)}</strong>
                    <span class="muted-text">
                        / ${money(goal.target)}
                    </span>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar ${colors[index % 4]}"
                         style="width:${percent}%"></div>
                </div>

                <small class="progress-percent">
                    ${Math.round(percent)}% completed
                </small>
            </div>

            <div class="goal-right">
                <div class="remaining-box">
                    <strong>${money(remaining)}</strong>
                    <small>Remaining</small>
                </div>

                <button class="more-btn"
                        type="button"
                        data-index="${index}">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>
        `;

        card.querySelector(".goal-info h3").textContent = goal.name;
        card.querySelector(".goal-info p").textContent = goal.description;

        list.appendChild(card);
    });

    if (!goals.length) {
        list.textContent = "No goals yet. Click + New Goal to get started.";
    }

    // Summary cards

    document.getElementById("totalSaved").textContent = money(totalSaved);
    document.getElementById("totalTarget").textContent = money(totalTarget);
    document.getElementById("totalGoals").textContent = goals.length;

    // Overall progress

    document.getElementById("overallSaved").textContent = money(totalSaved);
    document.getElementById("overallTarget").textContent = money(totalTarget);

    const percent = totalTarget > 0
        ? Math.min(100, totalSaved / totalTarget * 100)
        : 0;

    document.getElementById("overallProgress").style.width = percent + "%";

    document.getElementById("overallPercent").textContent =
        Math.round(percent) + "% completed";

    showActivity();
}

// ---------- RECENT ACTIVITY ----------

function showActivity() {
    const box = document.getElementById("savingsActivity");
    box.innerHTML = "";

    if (!activity.length) {
        box.textContent = "No savings activity yet.";
        return;
    }

    activity.slice(0, 8).forEach(item => {
        const row = document.createElement("div");

        row.style.cssText = `
            padding:12px 0;
            border-bottom:1px solid #252b32;
            display:flex;
            justify-content:space-between;
            gap:12px;
            flex-wrap:wrap;
        `;

        const details = document.createElement("span");

        details.textContent =
            `${item.date} • ${item.name} • ${item.action}`;

        const amount = document.createElement("strong");

        amount.textContent =
            (item.action === "Added" ? "+" : "-") + money(item.amount);

        amount.style.color =
            item.action === "Added" ? "#2ed573" : "#ff793f";

        row.append(details, amount);
        box.appendChild(row);
    });
}

// ---------- BUTTON EVENTS ----------

document.getElementById("goalsList").addEventListener("click", event => {
    const button = event.target.closest(".more-btn");
    if (!button) return;

    goalOptions(Number(button.dataset.index));
});

// ---------- NAVIGATION ----------

window.goToProfile = () => location.href = "profile.html";
window.goToLogin = () => location.href = "login.html";
window.goToSignup = () => location.href = "signup.html";

// ---------- INITIAL LOAD ----------

loadSavings();
showGoals();

// Update when data changes in another tab

window.addEventListener("storage", event => {
    if ([GOAL_KEY, ACTIVITY_KEY].includes(event.key)) {
        loadSavings();
        showGoals();
    }
});