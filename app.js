// Grab DOM elements
const balanceEl = document.getElementById("Balance");
const incomeAmountEl = document.getElementById("Income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transactions-list");
const transactionFormEl = document.getElementById("Transaction-form");
const descriptionEl = document.getElementById("Description");
const amountEl = document.getElementById("Amount");

// Load transactions from localStorage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Helper: shrink text to fit its parent width
function fitTextToWidth(element, maxFontSize, minFontSize) {
  if (!element) return;
  const parent = element.parentElement;
  if (!parent) return;

  let size = maxFontSize;
  element.style.fontSize = size + "px";

  const maxWidth = parent.clientWidth;

  // Decrease font size until text fits or we hit minFontSize
  while (element.scrollWidth > maxWidth && size > minFontSize) {
    size -= 1;
    element.style.fontSize = size + "px";
  }
}

// Handle form submit
transactionFormEl.addEventListener("submit", addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  if (!description || isNaN(amount)) {
    alert("Please enter a description and a valid number amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();

  transactionFormEl.reset();
}

// Render transaction list
function updateTransactionList() {
  transactionListEl.innerHTML = "";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);

    // Shrink amount text if necessary
    const amountSpan = transactionEl.querySelector(".transaction-amount");
    fitTextToWidth(amountSpan, 16, 10);
  });
}

// Create one transaction <li>
function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  li.innerHTML = `
    <span class="transaction-desc">${transaction.description}</span>
    <span class="transaction-right">
      <span class="transaction-amount">${formatCurrency(transaction.amount)}</span>
      <i class="fa-solid fa-xmark delete-btn" onclick="removeTransaction(${transaction.id})"></i>
    </span>
  `;

  return li;
}

// Update balance / income / expense summary
function updateSummary() {
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expense);

  // Shrink big numbers so they always fit
  fitTextToWidth(balanceEl, 46, 16);
  fitTextToWidth(incomeAmountEl, 36, 12);
  fitTextToWidth(expenseAmountEl, 36, 12);
}

// Currency formatting
function formatCurrency(number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(number);
}

// Delete a transaction
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactionList();
  updateSummary();
}

// Initial render
updateTransactionList();
updateSummary();
