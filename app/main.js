// Router, state and event handling for Hearth & Ledger.
//
//   #/                Dashboard
//   #/transactions    Transactions (add, edit, delete, filter)
//   #/budgets         Budgets (edit limits, progress bars move at once)
//   #/charts          Charts
//   #/settings        Settings and persistence
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { loadState, saveState, resetState, computeTotals } from './data.js';
import { money } from './format.js';
import { dashboardView, transactionsView, budgetsView, chartsView, settingsView } from './views.js';

const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('nav a')];

let state = loadState();
let filter = { category: 'all', type: 'all', q: '' };

function currentRoute() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/transactions')) return 'transactions';
  if (hash.startsWith('#/budgets')) return 'budgets';
  if (hash.startsWith('#/charts')) return 'charts';
  if (hash.startsWith('#/settings')) return 'settings';
  return 'dashboard';
}

function render() {
  window.__shotReady = false;
  const route = currentRoute();
  const totals = computeTotals(state);
  const titles = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    charts: 'Charts',
    settings: 'Settings',
  };
  document.title = `${titles[route]} | Hearth & Ledger`;
  if (route === 'transactions') app.innerHTML = transactionsView(state, totals, filter);
  else if (route === 'budgets') app.innerHTML = budgetsView(state, totals);
  else if (route === 'charts') app.innerHTML = chartsView(state, totals);
  else if (route === 'settings') app.innerHTML = settingsView(state, totals);
  else app.innerHTML = dashboardView(state, totals);
  for (const link of navLinks) {
    const href = link.getAttribute('href');
    const on = (route === 'dashboard' && href === '#/') || href === `#/${route}`;
    link.classList.toggle('active', on);
    if (on) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  // render() rebuilds the page, so the page's own handlers are bound here,
  // after every render, not just the first one.
  bindTransactions();
  bindBudgets();
  bindSettings();
  window.__shotReady = true;
}

function note(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function nextId() {
  return `t${Date.now().toString(36)}`;
}

// ---- Transactions: the add/edit form, filters and row buttons ----

function bindTransactions() {
  const form = document.getElementById('tx-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tx-id').value;
    const tx = {
      id: id || nextId(),
      date: document.getElementById('tx-date').value,
      description: document.getElementById('tx-desc').value.trim(),
      category: document.getElementById('tx-cat').value,
      type: document.getElementById('tx-type').value,
      amount: Math.round(Number(document.getElementById('tx-amount').value) * 100) / 100,
    };
    if (!tx.date || !tx.description || !(tx.amount > 0)) {
      note('tx-note', 'Please fill in the date, a description and an amount over $0.');
      return;
    }
    if (id) {
      const i = state.transactions.findIndex((t) => t.id === id);
      if (i >= 0) state.transactions[i] = tx;
      note('tx-note', `Updated “${tx.description}” — totals and charts moved with it.`);
    } else {
      state.transactions.push(tx);
      note('tx-note', `Added ${tx.type === 'income' ? 'income' : 'spending'} of ${money(tx.amount)} — totals and charts moved with it.`);
    }
    saveState(state);
    render();
    note('tx-note', id ? `Updated “${tx.description}”.` : `Added ${money(tx.amount)} — ${tx.description}.`);
  });
  document.getElementById('tx-cancel')?.addEventListener('click', () => render());

  const refilter = () => {
    filter.category = document.getElementById('f-cat').value;
    filter.type = document.getElementById('f-type').value;
    filter.q = document.getElementById('f-q').value;
    render();
    const q = document.getElementById('f-q');
    if (q) {
      q.focus();
      q.setSelectionRange(q.value.length, q.value.length);
    }
  };
  document.getElementById('f-cat').addEventListener('change', refilter);
  document.getElementById('f-type').addEventListener('change', refilter);
  document.getElementById('f-q').addEventListener('input', refilter);
}

// ---- Budgets: limits are number inputs; changing one re-renders ----

function bindBudgets() {
  for (const input of document.querySelectorAll('[data-budget]')) {
    input.addEventListener('change', () => {
      const value = Math.max(0, Math.round(Number(input.value) || 0));
      state.budgets[input.dataset.budget] = value;
      saveState(state);
      render();
    });
  }
}

// ---- Settings: household name, export, reset ----

function bindSettings() {
  const form = document.getElementById('settings-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.household = document.getElementById('household-name').value.trim() || 'My Household';
    state.month = document.getElementById('month-name').value.trim() || state.month;
    saveState(state);
    render();
    note('settings-note', 'Saved — the new name shows on every page.');
  });
}

// ---- Row buttons and settings actions, handled by delegation ----

document.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') {
    const t = state.transactions.find((x) => x.id === id);
    if (!t) return;
    document.getElementById('tx-id').value = t.id;
    document.getElementById('tx-date').value = t.date;
    document.getElementById('tx-desc').value = t.description;
    document.getElementById('tx-cat').value = t.category;
    document.getElementById('tx-type').value = t.type;
    document.getElementById('tx-amount').value = t.amount;
    document.getElementById('tx-form-title').textContent = 'Edit transaction';
    document.getElementById('tx-cancel').hidden = false;
    document.getElementById('tx-desc').focus();
  } else if (action === 'delete') {
    const t = state.transactions.find((x) => x.id === id);
    if (!t) return;
    if (!window.confirm(`Delete “${t.description}” (${money(t.amount)})?`)) return;
    state.transactions = state.transactions.filter((x) => x.id !== id);
    saveState(state);
    render();
  } else if (action === 'clear-filters') {
    filter = { category: 'all', type: 'all', q: '' };
    render();
  } else if (action === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hearth-and-ledger-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  } else if (action === 'reset') {
    if (!window.confirm('Reset to the original November seed data? Your edits will be lost.')) return;
    state = resetState();
    filter = { category: 'all', type: 'all', q: '' };
    render();
  }
});

window.addEventListener('hashchange', render);

render();
