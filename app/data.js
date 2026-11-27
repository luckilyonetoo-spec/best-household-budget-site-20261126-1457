// Seed data and storage for Hearth & Ledger, a household budget tracker.
// Every figure is the Marlow household's real November 2026 ledger, kept in
// localStorage under one key so the site works offline and remembers edits.

export const HOUSEHOLD = 'The Marlow Household';
export const MONTH = 'November 2026';

export const CATEGORIES = [
  { id: 'housing', label: 'Rent & Housing', color: '#7a5c3e' },
  { id: 'groceries', label: 'Groceries', color: '#2e7d4f' },
  { id: 'transport', label: 'Transport', color: '#3f6fb5' },
  { id: 'utilities', label: 'Utilities', color: '#c98a2b' },
  { id: 'dining', label: 'Dining Out', color: '#c96f4a' },
  { id: 'entertainment', label: 'Entertainment', color: '#7b5ea7' },
  { id: 'health', label: 'Health', color: '#b54a6e' },
  { id: 'clothing', label: 'Clothing', color: '#4a8a8f' },
  { id: 'savings', label: 'Savings', color: '#1f4d3a' },
  { id: 'other', label: 'Other', color: '#8a8a7a' },
];

export const SEED_BUDGETS = {
  housing: 1950,
  groceries: 650,
  transport: 260,
  utilities: 230,
  dining: 200,
  entertainment: 120,
  health: 150,
  clothing: 100,
  savings: 600,
  other: 150,
};

// type is 'income' or 'expense'; amount is always positive.
export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Rent — Maple Court Apartments', category: 'housing', type: 'expense', amount: 1850.0 },
  { id: 't02', date: '2026-11-02', description: 'Weekly shop — GreenMart', category: 'groceries', type: 'expense', amount: 148.2 },
  { id: 't03', date: '2026-11-02', description: 'Monthly bus pass — City Transit', category: 'transport', type: 'expense', amount: 86.0 },
  { id: 't04', date: '2026-11-03', description: 'Salary — Maya Marlow', category: 'other', type: 'income', amount: 3900.0 },
  { id: 't05', date: '2026-11-03', description: 'Salary — Tom Marlow', category: 'other', type: 'income', amount: 2650.0 },
  { id: 't06', date: '2026-11-03', description: 'Electricity — NorthLight Energy', category: 'utilities', type: 'expense', amount: 94.5 },
  { id: 't07', date: '2026-11-04', description: 'Coffee and pastries — Corner Café', category: 'dining', type: 'expense', amount: 18.4 },
  { id: 't08', date: '2026-11-05', description: 'Pharmacy — HealthPlus', category: 'health', type: 'expense', amount: 42.3 },
  { id: 't09', date: '2026-11-06', description: 'Movie night — Riverside Cinema', category: 'entertainment', type: 'expense', amount: 36.0 },
  { id: 't10', date: '2026-11-07', description: 'Fuel — PetroStop', category: 'transport', type: 'expense', amount: 52.1 },
  { id: 't11', date: '2026-11-08', description: 'Weekly shop — GreenMart', category: 'groceries', type: 'expense', amount: 132.75 },
  { id: 't12', date: '2026-11-09', description: 'Internet — FiberLink', category: 'utilities', type: 'expense', amount: 59.0 },
  { id: 't13', date: '2026-11-10', description: 'Lunch with colleagues — Bistro Verde', category: 'dining', type: 'expense', amount: 27.6 },
  { id: 't14', date: '2026-11-11', description: "Kids' shoes — StepUp Shoes", category: 'clothing', type: 'expense', amount: 64.99 },
  { id: 't15', date: '2026-11-12', description: 'Water bill — City Water', category: 'utilities', type: 'expense', amount: 38.2 },
  { id: 't16', date: '2026-11-13', description: 'Takeaway pizza — Napoli Pizza', category: 'dining', type: 'expense', amount: 31.5 },
  { id: 't17', date: '2026-11-14', description: 'Freelance illustration — Maya Marlow', category: 'other', type: 'income', amount: 320.0 },
  { id: 't18', date: '2026-11-14', description: 'Transfer to savings — Marlow Savings', category: 'savings', type: 'expense', amount: 500.0 },
  { id: 't19', date: '2026-11-15', description: 'Weekly shop — GreenMart', category: 'groceries', type: 'expense', amount: 156.4 },
  { id: 't20', date: '2026-11-16', description: 'Train tickets — City Transit', category: 'transport', type: 'expense', amount: 24.5 },
  { id: 't21', date: '2026-11-17', description: 'Streaming — StreamBox', category: 'entertainment', type: 'expense', amount: 14.99 },
  { id: 't22', date: '2026-11-18', description: 'Dentist check-up — BrightSmile Dental', category: 'health', type: 'expense', amount: 85.0 },
  { id: 't23', date: '2026-11-19', description: 'Birthday gift — GiftWorks', category: 'other', type: 'expense', amount: 45.0 },
  { id: 't24', date: '2026-11-20', description: 'Weekly shop — GreenMart', category: 'groceries', type: 'expense', amount: 141.85 },
  { id: 't25', date: '2026-11-21', description: 'Dinner out — Sakura Sushi', category: 'dining', type: 'expense', amount: 58.3 },
  { id: 't26', date: '2026-11-22', description: 'Fuel — PetroStop', category: 'transport', type: 'expense', amount: 48.75 },
  { id: 't27', date: '2026-11-23', description: 'Phone bill — MobileOne', category: 'utilities', type: 'expense', amount: 42.0 },
  { id: 't28', date: '2026-11-24', description: 'Book club books — PageTurner Books', category: 'entertainment', type: 'expense', amount: 22.4 },
  { id: 't29', date: '2026-11-25', description: 'Winter coat — NorthPeak Outdoors', category: 'clothing', type: 'expense', amount: 89.0 },
  { id: 't30', date: '2026-11-26', description: 'Farmers market — GreenMart', category: 'groceries', type: 'expense', amount: 67.3 },
];

// Six-month trend for the Charts page. November matches the ledger above.
export const MONTHLY_TREND = [
  { month: 'Jun 2026', income: 6540, spending: 3720 },
  { month: 'Jul 2026', income: 6540, spending: 3980 },
  { month: 'Aug 2026', income: 6870, spending: 4150 },
  { month: 'Sep 2026', income: 6870, spending: 3890 },
  { month: 'Oct 2026', income: 6870, spending: 4020 },
  { month: 'Nov 2026', income: 6870, spending: 3977.03 },
];

const STORAGE_KEY = 'hearth-and-ledger-v1';

function seedState() {
  return {
    household: HOUSEHOLD,
    month: MONTH,
    budgets: { ...SEED_BUDGETS },
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

// Totals for the current month, computed from the ledger, never hard-coded.
export function computeTotals(state) {
  let income = 0;
  let spending = 0;
  const byCategory = {};
  for (const c of CATEGORIES) byCategory[c.id] = 0;
  for (const t of state.transactions) {
    if (t.type === 'income') income += t.amount;
    else {
      spending += t.amount;
      if (byCategory[t.category] !== undefined) byCategory[t.category] += t.amount;
    }
  }
  const round = (n) => Math.round(n * 100) / 100;
  return { income: round(income), spending: round(spending), left: round(income - spending), byCategory };
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
