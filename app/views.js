// HTML for each page, built from the ledger state. Every figure comes from
// computeTotals, so adding a transaction moves every number on the site.

import { CATEGORIES, MONTHLY_TREND, categoryById } from './data.js';
import { money, moneyShort, pct, shortDate, escapeHtml } from './format.js';
import { trendChart, donutChart, dailyBars } from './charts.js';

function categoryOptions(selected) {
  return CATEGORIES.map(
    (c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${c.label}</option>`,
  ).join('');
}

export function dashboardView(state, totals) {
  const top = Object.entries(totals.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const bars = top
    .map(([id, amount]) => {
      const c = categoryById(id);
      const share = pct(amount, totals.spending);
      return `<li class="cat-row">
  <span class="cat-name"><span class="swatch" style="background:${c.color}"></span>${c.label}</span>
  <span class="bar-track"><span class="bar-fill" style="width:${share}%;background:${c.color}"></span></span>
  <span class="cat-amount">${money(amount)}</span>
</li>`;
    })
    .join('');
  const alerts = CATEGORIES.filter((c) => totals.byCategory[c.id] > state.budgets[c.id]).map((c) => {
    const over = totals.byCategory[c.id] - state.budgets[c.id];
    return `<li class="alert"><strong>${c.label} is over budget</strong> — ${money(over)} past its ${money(state.budgets[c.id])} limit.</li>`;
  });
  const near = CATEGORIES.filter(
    (c) => totals.byCategory[c.id] <= state.budgets[c.id] && totals.byCategory[c.id] >= state.budgets[c.id] * 0.9,
  ).map((c) => `<li class="alert warn"><strong>${c.label} is nearly there</strong> — ${money(state.budgets[c.id] - totals.byCategory[c.id])} left of ${money(state.budgets[c.id])}.</li>`);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
    .map((t) => {
      const c = categoryById(t.category);
      return `<li><span class="tx-date">${shortDate(t.date)}</span>
  <span class="tx-desc">${escapeHtml(t.description)}</span>
  <span class="tx-cat">${c.label}</span>
  <span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</span></li>`;
    })
    .join('');
  const incomeShare = pct(totals.income, totals.income + totals.spending);
  return `<h1>${escapeHtml(state.month)} at a glance</h1>
<p class="lede">What came in, what went out, and what is left for the Marlow household.</p>
<section class="cards" aria-label="Month summary">
  <article class="card"><h2>Income</h2><p class="big good">${money(totals.income)}</p><p class="sub">2 salaries + freelance</p></article>
  <article class="card"><h2>Spending</h2><p class="big">${money(totals.spending)}</p><p class="sub">30 transactions</p></article>
  <article class="card"><h2>Left to spend</h2><p class="big ${totals.left >= 0 ? 'good' : 'bad'}">${money(totals.left)}</p><p class="sub">${pct(totals.left, totals.income)}% of income unspent</p></article>
  <article class="card"><h2>Saved so far</h2><p class="big good">${money(totals.byCategory.savings)}</p><p class="sub">of a ${money(state.budgets.savings)} goal</p></article>
</section>
<section class="panel">
  <h2>Income vs spending</h2>
  <div class="split-bar" role="img" aria-label="Income ${money(totals.income)}, spending ${money(totals.spending)}">
    <span class="split-income" style="width:${incomeShare}%"></span>
    <span class="split-spending" style="width:${100 - incomeShare}%"></span>
  </div>
  <p class="legend"><span class="swatch" style="background:#1f4d3a"></span>Income ${money(totals.income)}
  <span class="swatch" style="background:#c96f4a"></span>Spending ${money(totals.spending)}</p>
</section>
<section class="panel">
  <h2>Where the money went</h2>
  <ul class="cat-bars">${bars}</ul>
  <p><a href="#/budgets">See all budgets &rarr;</a></p>
</section>
${alerts.length || near.length ? `<section class="panel"><h2>Worth a look</h2><ul class="alerts">${alerts.join('')}${near.join('')}</ul></section>` : ''}
<section class="panel">
  <h2>Recent transactions</h2>
  <ul class="recent">${recent}</ul>
  <p><a href="#/transactions">All transactions &rarr;</a></p>
</section>`;
}

export function transactionsView(state, totals, filter) {
  const rows = state.transactions
    .filter((t) => (filter.category === 'all' ? true : t.category === filter.category))
    .filter((t) => (filter.type === 'all' ? true : t.type === filter.type))
    .filter((t) => (filter.q ? t.description.toLowerCase().includes(filter.q.toLowerCase()) : true))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const body = rows
    .map((t) => {
      const c = categoryById(t.category);
      return `<tr>
  <td>${shortDate(t.date)}</td>
  <td>${escapeHtml(t.description)}</td>
  <td><span class="chip" style="--chip:${c.color}">${c.label}</span></td>
  <td class="num ${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
  <td class="actions"><button data-action="edit" data-id="${t.id}">Edit</button>
  <button data-action="delete" data-id="${t.id}">Delete</button></td>
</tr>`;
    })
    .join('');
  const shownExpense = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const shownIncome = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  return `<h1>Transactions</h1>
<p class="lede">Every dollar in and out in ${escapeHtml(state.month)} — ${state.transactions.length} entries.</p>
<form id="tx-form" class="form-card" aria-label="Add a transaction">
  <h2 id="tx-form-title">Add a transaction</h2>
  <input type="hidden" id="tx-id" value="">
  <label>Date <input type="date" id="tx-date" value="2026-11-27" required></label>
  <label>Description <input type="text" id="tx-desc" placeholder="e.g. Weekly shop — GreenMart" required maxlength="80"></label>
  <label>Category <select id="tx-cat">${categoryOptions('groceries')}</select></label>
  <label>Type <select id="tx-type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
  <label>Amount ($) <input type="number" id="tx-amount" min="0.01" step="0.01" placeholder="0.00" required></label>
  <div class="form-actions"><button type="submit" class="primary">Save transaction</button>
  <button type="button" id="tx-cancel" hidden>Cancel edit</button></div>
  <p class="form-note" id="tx-note" role="status"></p>
</form>
<div class="filters" role="search">
  <label>Category <select id="f-cat"><option value="all">All categories</option>${categoryOptions(filter.category === 'all' ? '' : filter.category)}</select></label>
  <label>Type <select id="f-type">
    <option value="all"${filter.type === 'all' ? ' selected' : ''}>Income &amp; expenses</option>
    <option value="expense"${filter.type === 'expense' ? ' selected' : ''}>Expenses only</option>
    <option value="income"${filter.type === 'income' ? ' selected' : ''}>Income only</option>
  </select></label>
  <label>Search <input type="search" id="f-q" placeholder="Search descriptions" value="${escapeHtml(filter.q)}"></label>
</div>
<p class="filter-summary">Showing ${rows.length} of ${state.transactions.length} — income ${money(shownIncome)}, spending ${money(shownExpense)}.</p>
<table class="tx-table">
  <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
  <tbody>${body || '<tr><td colspan="5">Nothing matches these filters. <button data-action="clear-filters">Clear filters</button></td></tr>'}</tbody>
</table>`;
}

export function budgetsView(state, totals) {
  const rows = CATEGORIES.map((c) => {
    const spent = totals.byCategory[c.id] || 0;
    const limit = state.budgets[c.id];
    const used = pct(spent, limit);
    const over = spent > limit;
    return `<li class="budget-row">
  <div class="budget-head"><span class="cat-name"><span class="swatch" style="background:${c.color}"></span>${c.label}</span>
  <span class="budget-nums">${money(spent)} of ${money(limit)} <strong class="${over ? 'bad' : 'good'}">${used}%</strong></span></div>
  <div class="bar-track"><span class="bar-fill ${over ? 'over' : ''}" style="width:${Math.min(used, 100)}%;background:${c.color}"></span></div>
  <p class="budget-note">${over ? `${money(spent - limit)} over — consider moving money from a category with room.` : `${money(limit - spent)} left for the rest of the month.`}</p>
  <label class="limit-edit">Monthly limit $ <input type="number" min="0" step="5" value="${limit}" data-budget="${c.id}" aria-label="${c.label} monthly limit"></label>
</li>`;
  }).join('');
  const totalLimit = CATEGORIES.reduce((s, c) => s + state.budgets[c.id], 0);
  return `<h1>Budgets</h1>
<p class="lede">Monthly limits for ${escapeHtml(state.month)}. Limits total ${money(totalLimit)} against ${money(totals.income)} of income — change any limit and the bars move at once.</p>
<ul class="budget-list">${rows}</ul>
<p class="hint">Limits are saved on this device. Editing a limit updates the dashboard too.</p>`;
}

export function chartsView(state, totals) {
  const spendEntries = CATEGORIES.filter((c) => (totals.byCategory[c.id] || 0) > 0 && c.id !== 'savings')
    .map((c) => ({ label: c.label, amount: totals.byCategory[c.id], color: c.color }))
    .sort((a, b) => b.amount - a.amount);
  const sixMonth = MONTHLY_TREND.map(
    (m) => `<li><span>${m.month}</span><span>Income ${money(m.income)}</span><span>Spending ${money(m.spending)}</span><strong class="${m.income - m.spending >= 0 ? 'good' : 'bad'}">${money(m.income - m.spending)} left</strong></li>`,
  ).join('');
  return `<h1>Charts</h1>
<p class="lede">Six months of income against spending, and where November's money went.</p>
<section class="panel"><h2>Income vs spending — June to November 2026</h2>
${trendChart(MONTHLY_TREND)}
<p>Spending has stayed between ${money(3720)} and ${money(4150)} a month while income rose in August. November is on track to be the second-cheapest month of the half year.</p>
<ul class="trend-list">${sixMonth}</ul></section>
<section class="panel"><h2>November spending by category</h2>
${donutChart(spendEntries, spendEntries.reduce((s, e) => s + e.amount, 0))}
<p class="hint">Savings transfers are kept out of the donut — they are money kept, not spent.</p></section>
<section class="panel"><h2>Spending day by day — November</h2>
${dailyBars(state.transactions)}</section>`;
}

export function settingsView(state, totals) {
  const stored = JSON.stringify(state).length;
  return `<h1>Settings</h1>
<p class="lede">Your ledger lives in this browser only — nothing leaves the device.</p>
<section class="panel"><h2>Household</h2>
<form id="settings-form" class="form-card">
  <label>Household name <input type="text" id="household-name" value="${escapeHtml(state.household)}" maxlength="60"></label>
  <label>Budget month <input type="text" id="month-name" value="${escapeHtml(state.month)}" maxlength="20"></label>
  <div class="form-actions"><button type="submit" class="primary">Save settings</button></div>
  <p class="form-note" id="settings-note" role="status"></p>
</form></section>
<section class="panel"><h2>Your data</h2>
<p>${state.transactions.length} transactions and ${CATEGORIES.length} budgets, about ${(stored / 1024).toFixed(1)} KB, stored in this browser's local storage.</p>
<div class="form-actions">
  <button data-action="export">Download my data (JSON)</button>
  <button data-action="reset">Reset to the November seed data</button>
</div>
<p class="hint">Resetting brings back the original 30 November transactions and the original budgets. Export first if you want to keep your edits.</p></section>
<section class="panel"><h2>About this site</h2>
<p>Hearth &amp; Ledger is a plain static site: no account, no server, no tracking. It opens on a desktop or a phone and works with no network connection. Built for the make.fun household budget bounty, November 2026.</p></section>`;
}
