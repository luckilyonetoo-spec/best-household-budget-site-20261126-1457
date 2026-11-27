// SVG charts, drawn by hand from the ledger. No library: each function takes
// plain data and returns an SVG string, so the Charts page works offline.

import { moneyShort } from './format.js';

// Income vs spending over six months: two lines with labelled points.
export function trendChart(months) {
  const W = 720;
  const H = 260;
  const padL = 52;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const max = 8000;
  const x = (i) => padL + (i * (W - padL - padR)) / (months.length - 1);
  const y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const line = (key) => months.map((m, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(m[key]).toFixed(1)}`).join(' ');
  const grid = [0, 2000, 4000, 6000, 8000]
    .map(
      (v) => `<line x1="${padL}" y1="${y(v)}" x2="${W - padR}" y2="${y(v)}" stroke="#e8e0d2" />
<text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#8a8378">$${(v / 1000).toFixed(0)}k</text>`,
    )
    .join('');
  const dots = (key, color) =>
    months
      .map((m, i) => `<circle cx="${x(i)}" cy="${y(m[key])}" r="4" fill="${color}" />`)
      .join('');
  const labels = months
    .map(
      (m, i) =>
        `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === months.length - 1 ? 'end' : 'middle'}" font-size="11" fill="#6b655a">${m.month}</text>`,
    )
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Income versus spending, June to November 2026" class="chart-svg">
${grid}
<path d="${line('income')}" fill="none" stroke="#1f4d3a" stroke-width="3" stroke-linejoin="round" />
<path d="${line('spending')}" fill="none" stroke="#c96f4a" stroke-width="3" stroke-linejoin="round" />
${dots('income', '#1f4d3a')}${dots('spending', '#c96f4a')}
${labels}
</svg>
<p class="legend"><span class="swatch" style="background:#1f4d3a"></span>Income
<span class="swatch" style="background:#c96f4a"></span>Spending</p>`;
}

// Donut of November spending by category, with a centre total.
export function donutChart(entries, total) {
  const R = 90;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segments = entries
    .map((e) => {
      const frac = total ? e.amount / total : 0;
      const dash = `${(frac * C).toFixed(1)} ${(C - frac * C).toFixed(1)}`;
      const seg = `<circle cx="110" cy="110" r="${R}" fill="none" stroke="${e.color}" stroke-width="34"
  stroke-dasharray="${dash}" stroke-dashoffset="${(-offset * C).toFixed(1)}" />`;
      offset += frac;
      return seg;
    })
    .join('');
  const legend = entries
    .map(
      (e) => `<li><span class="swatch" style="background:${e.color}"></span>${e.label}
  <strong>${moneyShort(e.amount)}</strong></li>`,
    )
    .join('');
  return `<div class="donut-wrap">
<svg viewBox="0 0 220 220" role="img" aria-label="Spending by category" class="donut-svg">
<circle cx="110" cy="110" r="${R}" fill="none" stroke="#f0eadd" stroke-width="34" />
${segments}
<text x="110" y="104" text-anchor="middle" font-size="13" fill="#6b655a">November</text>
<text x="110" y="126" text-anchor="middle" font-size="17" font-weight="700" fill="#22281f">${moneyShort(total)}</text>
</svg>
<ul class="donut-legend">${legend}</ul>
</div>`;
}

// Daily spending bars for November, one bar per day that had an expense.
export function dailyBars(transactions) {
  const days = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const day = Number(t.date.slice(8, 10));
    days[day] = (days[day] || 0) + t.amount;
  }
  const entries = Object.entries(days).sort((a, b) => Number(a[0]) - Number(b[0]));
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const bars = entries
    .map(([day, amount]) => {
      const h = Math.max(3, Math.round((amount / max) * 120));
      return `<div class="day-bar" style="height:${h}px" title="Nov ${day}: ${moneyShort(amount)}"></div>`;
    })
    .join('');
  const labels = entries
    .map(([day]) => `<span>${day}</span>`)
    .join('');
  return `<div class="bars" aria-label="Daily spending in November">${bars}</div>
<div class="bar-labels">${labels}</div>
<p class="hint">Tallest bar: rent on Nov 1. Hover a bar for the day's total.</p>`;
}
