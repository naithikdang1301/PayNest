// PAYNEST - EXPENSES PAGE

var userEmail = sessionStorage.getItem("loggedInUser");
var expenses = [];
var editingId = null;
var currentPage = 1;
var pageSize = 8;

var categories = [
    "Food & Dining",
    "Travel & Transport",
    "Shopping",
    "Bills & Utilities",
    "Education",
    "Entertainment",
    "Others"
];

var icons = ["🍔", "🚘", "🛍️", "📄", "📚", "🎬", "📦"];
var colors = [
    "bar-yellow", "bar-blue", "bar-green",
    "bar-purple", "bar-pink", "bar-orange", "bar-grey"
];

function $(selector) {
    return document.querySelector(selector);
}

function today() {
    var d = new Date();
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getMonth(date) {
    return date.slice(0, 7);
}

function monthName(month) {
    var parts = month.split("-");
    return new Date(parts[0], parts[1] - 1, 1)
        .toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });
}

// STORAGE

function loadExpenses() {
    var all = JSON.parse(localStorage.getItem("paynestExpenses") || "[]");

    expenses = all.filter(function (item) {
        return item.userEmail === userEmail;
    });
}

function saveExpenses() {
    var all = JSON.parse(localStorage.getItem("paynestExpenses") || "[]");

    all = all.filter(function (item) {
        return item.userEmail !== userEmail;
    });

    localStorage.setItem(
        "paynestExpenses",
        JSON.stringify(all.concat(expenses))
    );
}

function total(items) {
    return items.reduce(function (sum, item) {
        return sum + Number(item.amount);
    }, 0);
}

// MONTH FILTER

function setupMonths() {
    var select = $("#monthFilter");
    var selected = select.value || getMonth(today());
    var months = [getMonth(today())];

    expenses.forEach(function (item) {
        var month = getMonth(item.date);

        if (!months.includes(month)) {
            months.push(month);
        }
    });

    months.sort().reverse();
    select.innerHTML = "";

    months.forEach(function (month) {
        var option = document.createElement("option");
        option.value = month;
        option.textContent = monthName(month);
        select.appendChild(option);
    });

    select.value = months.includes(selected) ? selected : months[0];
}

// FILTER EXPENSES

function filteredExpenses() {
    var month = $("#monthFilter").value;
    var category = $("#categoryFilter").value;
    var search = $("#expenseSearch").value.toLowerCase().trim();

    return expenses.filter(function (item) {
        return getMonth(item.date) === month &&
            (category === "" || item.category === category) &&
            (
                item.description.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search) ||
                item.date.includes(search)
            );
    }).sort(function (a, b) {
        return b.date.localeCompare(a.date) ||
            String(b.id).localeCompare(String(a.id));
    });
}

// SUMMARY CARDS

function renderMetrics() {
    var month = $("#monthFilter").value;

    var monthly = expenses.filter(function (item) {
        return getMonth(item.date) === month;
    });

    var spent = total(monthly);
    var parts = month.split("-");
    var days = new Date(parts[0], parts[1], 0).getDate();

    var categoryTotals = categories.map(function (category) {
        return total(monthly.filter(function (item) {
            return item.category === category;
        }));
    });

    var highest = Math.max.apply(null, categoryTotals);
    var index = categoryTotals.indexOf(highest);

    var todayExpenses = expenses.filter(function (item) {
        return item.date === today();
    });

    var cards = document.querySelectorAll(".metric-card");

    cards[0].querySelector("h2").textContent = money(spent);
    cards[0].querySelector(".sub-text").textContent = monthName(month);
    cards[0].querySelector(".green-text").textContent =
        monthly.length + " Transactions";

    cards[1].querySelector("h2").textContent = money(spent / days);
    cards[1].querySelector(".sub-text").textContent = "Per Calendar Day";
    cards[1].querySelector(".green-text").textContent = monthName(month);

    cards[2].querySelector("h2").textContent =
        highest > 0 ? categories[index] : "—";
    cards[2].querySelector(".bold-val").textContent = money(highest);
    cards[2].querySelector(".sub-text").textContent =
        spent > 0 ? (highest / spent * 100).toFixed(1) + "% of total" : "0% of total";

    cards[3].querySelector("h2").textContent = money(total(todayExpenses));
    cards[3].querySelector(".sub-text").textContent =
        todayExpenses.length + " Transactions";
    cards[3].querySelector(".green-text").textContent = "Today";
}

// BAR CHART

function renderChart() {
    var period = $("#chartPeriod").value;
    var month = $("#monthFilter").value;
    var now = new Date();
    var start, end;

    if (period === "this-month" || period === "month") {
        start = month + "-01";
        end = month + "-31";
    } else if (period === "last-month" || period === "lastMonth") {
        var last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        var lastMonth = last.getFullYear() + "-" +
            String(last.getMonth() + 1).padStart(2, "0");
        start = lastMonth + "-01";
        end = lastMonth + "-31";
    } else if (period === "last-3-months" || period === "threeMonths") {
        var three = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        start = three.getFullYear() + "-" +
            String(three.getMonth() + 1).padStart(2, "0") + "-01";
        end = today();
    } else {
        start = now.getFullYear() + "-01-01";
        end = today();
    }

    var items = expenses.filter(function (item) {
        return item.date >= start && item.date <= end;
    });

    var totals = categories.map(function (category) {
        return total(items.filter(function (item) {
            return item.category === category;
        }));
    });

    var max = Math.max.apply(null, totals);
    var grandTotal = totals.reduce(function (a, b) {
        return a + b;
    }, 0);

    var chart = $("#categoryChart");
    var axis = $("#chartAxis");

    chart.innerHTML = "";
    axis.innerHTML = "";

    for (var i = 5; i >= 0; i--) {
        var label = document.createElement("span");
        label.textContent = money(max * i / 5);
        axis.appendChild(label);
    }

    categories.forEach(function (category, index) {
        var column = document.createElement("div");
        column.className = "bar-col";

        var value = document.createElement("span");
        value.className = "bar-val";
        value.textContent = money(totals[index]);

        var bar = document.createElement("div");
        bar.className = "bar " + colors[index];
        bar.style.height = (max ? totals[index] / max * 100 : 0) + "%";

        var name = document.createElement("span");
        name.className = "bar-label";
        name.textContent = category;

        var percentage = document.createElement("small");
        percentage.textContent =
            (grandTotal ? totals[index] / grandTotal * 100 : 0).toFixed(1) + "%";

        column.appendChild(value);
        column.appendChild(bar);
        column.appendChild(name);
        column.appendChild(percentage);
        chart.appendChild(column);
    });
}

// EXPENSE HISTORY

function renderTable() {
    var items = filteredExpenses();
    var tbody = $("#expenseTableBody");
    var pages = Math.ceil(items.length / pageSize);

    currentPage = Math.min(currentPage, Math.max(1, pages));
    tbody.innerHTML = "";

    var start = (currentPage - 1) * pageSize;
    var visible = items.slice(start, start + pageSize);

    if (visible.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="5" class="empty-expenses">No expenses found.</td></tr>';
    }

    visible.forEach(function (item) {
        var row = document.createElement("tr");
        var index = categories.indexOf(item.category);

        var dateCell = document.createElement("td");
        dateCell.textContent = item.date;

        var categoryCell = document.createElement("td");
        categoryCell.textContent = (icons[index] || "📦") + " " + item.category;

        var descriptionCell = document.createElement("td");
        descriptionCell.textContent = item.description;

        var amountCell = document.createElement("td");
        amountCell.textContent = money(item.amount);

        var actionsCell = document.createElement("td");

        var edit = document.createElement("button");
        edit.className = "action-edit";
        edit.textContent = "✏️";
        edit.onclick = function () {
            openModal(item.id);
        };

        var remove = document.createElement("button");
        remove.className = "action-delete";
        remove.textContent = "🗑️";
        remove.onclick = function () {
            deleteExpense(item.id);
        };

        actionsCell.appendChild(edit);
        actionsCell.appendChild(remove);

        row.appendChild(dateCell);
        row.appendChild(categoryCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });

    $("#paginationInfo").textContent = items.length
        ? "Showing " + (start + 1) + " to " +
          Math.min(start + pageSize, items.length) +
          " of " + items.length + " entries"
        : "Showing 0 entries";

    var buttons = $("#paginationButtons");
    buttons.innerHTML = "";

    for (var page = 1; page <= pages; page++) {
        var button = document.createElement("button");
        button.className = "pg-btn" + (page === currentPage ? " active" : "");
        button.textContent = page;

        button.onclick = (function (number) {
            return function () {
                currentPage = number;
                renderTable();
            };
        })(page);

        buttons.appendChild(button);
    }
}

// ADD / EDIT EXPENSE

function openModal(id) {
    $("#expenseForm").reset();
    editingId = id || null;

    $("#expenseModalTitle").textContent =
        editingId ? "Edit Expense" : "Add Expense";

    $("#saveExpense").textContent =
        editingId ? "Update Expense" : "Save Expense";

    $("#expenseDate").value = today();

    if (editingId) {
        var item = expenses.find(function (expense) {
            return expense.id === editingId;
        });

        if (!item) return;

        $("#expenseAmount").value = item.amount;
        $("#expenseCategory").value = item.category;
        $("#expenseDescription").value = item.description;
        $("#expenseDate").value = item.date;
    }

    $("#expenseModal").classList.add("show");
    $("#expenseModal").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    $("#expenseModal").classList.remove("show");
    $("#expenseModal").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    editingId = null;
}

function saveExpense(event) {
    event.preventDefault();

    var amount = Number($("#expenseAmount").value);
    var category = $("#expenseCategory").value;
    var description = $("#expenseDescription").value.trim();
    var date = $("#expenseDate").value;

    if (amount <= 0 || !categories.includes(category) || !description || !date) {
        alert("Please fill all expense details correctly.");
        return;
    }

    if (editingId) {
        var item = expenses.find(function (expense) {
            return expense.id === editingId;
        });

        if (!item) return;

        item.amount = amount;
        item.category = category;
        item.description = description;
        item.date = date;
    } else {
        expenses.push({
            id: String(Date.now()) + "-" + Math.random(),
            userEmail: userEmail,
            amount: amount,
            category: category,
            description: description,
            date: date
        });
    }

    saveExpenses();
    closeModal();
    setupMonths();
    currentPage = 1;
    renderAll();

    alert("Expense saved successfully!");
}

function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    expenses = expenses.filter(function (item) {
        return item.id !== id;
    });

    saveExpenses();
    setupMonths();
    renderAll();
}

// CSV / PDF EXPORT

function exportCSV() {
    var items = filteredExpenses();

    if (!items.length) {
        alert("No expenses to export.");
        return;
    }

    var csv = "Date,Category,Description,Amount\n";

    items.forEach(function (item) {
        var values = [
            item.date, item.category, item.description, item.amount
        ];

        csv += values.map(function (value) {
            var text = String(value).replace(/"/g, '""');

            if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;

            return '"' + text + '"';
        }).join(",") + "\n";
    });

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = "PayNest_Expenses.csv";
    link.click();

    URL.revokeObjectURL(url);
}

function exportPDF() {
    window.print();
}

// UPDATE PAGE

function renderAll() {
    renderMetrics();
    renderChart();
    renderTable();
}

// EVENTS

document.addEventListener("DOMContentLoaded", function () {
    if (!userEmail) {
        window.location.href = "login.html";
        return;
    }

    loadExpenses();
    setupMonths();
    renderAll();

    $(".btn-add").addEventListener("click", function () {
        openModal();
    });

    $("#expenseForm").addEventListener("submit", saveExpense);
    $("#closeExpenseModal").addEventListener("click", closeModal);
    $("#cancelExpense").addEventListener("click", closeModal);

    $("#expenseModal").addEventListener("click", function (event) {
        if (event.target === this) closeModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeModal();
    });

    $("#monthFilter").addEventListener("change", function () {
        currentPage = 1;
        renderAll();
    });

    $("#categoryFilter").addEventListener("change", function () {
        currentPage = 1;
        renderTable();
    });

    $("#expenseSearch").addEventListener("input", function () {
        currentPage = 1;
        renderTable();
    });

    $("#chartPeriod").addEventListener("change", renderChart);

    $("#historyExport").addEventListener("click", exportCSV);
    $("#downloadCsv").addEventListener("click", exportCSV);
    $("#downloadPdf").addEventListener("click", exportPDF);
});