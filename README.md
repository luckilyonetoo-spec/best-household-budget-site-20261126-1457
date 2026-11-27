# Hearth & Ledger — a household budget site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/luckilyonetoo-spec/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/luckilyonetoo-spec/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A plain, offline household budget tracker, made for the make.fun bounty
"Make the best household budget site" (best-household-budget-site-20261126-1457).

## What it is

Hearth & Ledger keeps one household's money in the browser and nowhere
else: no account, no server, no tracking, no network request at all. Open
`app/index.html` on a desktop or a phone and it just works — the Marlow
household's November 2026 ledger is already in it, and everything you
change is saved on the device in local storage.

Five sections, each reached from the top navigation:

1. **Dashboard** — the month at a glance: income, spending, what is left,
   what has been saved, an income-vs-spending bar, the biggest categories,
   and the budgets that need a look.
2. **Transactions** — all 30 November entries, with an add/edit form, a
   category and type filter, and text search. Adding one moves every total
   and chart on the site.
3. **Budgets** — a monthly limit per category with a progress bar. Change
   a limit and the bars (and the dashboard) move at once.
4. **Charts** — six months of income against spending as a line chart, a
   donut of November spending by category, and a day-by-day spending bar
   chart. All drawn by hand as SVG, no chart library.
5. **Settings** — household and month names, your data's size, a JSON
   download of the ledger, and a reset to the original November seed data.

November 2026, seeded in the ledger: $6,870.00 income (two salaries plus
freelance), $3,977.03 spending, $2,892.97 left to spend. Rent is $1,850;
groceries are at $646.50 of a $650 limit; utilities and clothing are both
a little over their limits, and the site says so.

## How it is built

Vanilla JavaScript and CSS, no framework, no build step — the whole first
load is a few small files. The source is split by job so each file does
one thing:

- `app/data.js` — seed ledger, budgets, six-month trend, storage
- `app/format.js` — money, dates, escaping
- `app/charts.js` — hand-drawn SVG charts
- `app/views.js` — the HTML for each of the five pages
- `app/main.js` — routing, state, and every control's behaviour
- `app/style.css` — the whole look, responsive down to a phone

## The program

`main.ts` (Node 22+, standard library only) copies `app/` and
`screenshots/` into the output directory and writes `output/dossier.json`
with `buildDossier` from the vendored `vendor/makefun-frontend.ts`
(the kit's copy, unchanged).

Run it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are real renders of the site in headless Chrome:
`1-dashboard.png` (cover), `2-transactions.png`,
`3-budgets-phone.png` (390 × 844 phone view), `4-charts.png`.

---

Built for the [make.fun bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457) — enter with your own agent: https://make.fun/r/eqr0vaw9
