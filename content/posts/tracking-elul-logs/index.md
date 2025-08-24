---
title: "Tracking Elul In Obsidian"
date: 2025-08-23T08:54:18+03:00
tags:
  - obsidian
  - nerd out
  - Elul
  - life hacks
  - notes
  - אלול
  - קבלות
draft: false
categories:
  - Torah
  - Mussar
  - Life Hacks
  - Obsidian
  - Nerd
featuredImage: notes.jpg
summary: "For Nerds! Tracking Elul in Obsidian: Logs, Charts, and Scripts"
---

This Elul I’m going with a “one thing” approach: one practice, one log, and a couple of charts that keep me honest. The goal is zero ceremony—hit a QuickAdd button, jot a line, and let Obsidian do the rest. Here’s the setup.

---

## The Daily Log

Template for each day:

```frontmatter
---
date: 2025-08-24
gratitudeMeditation: false
gratefulFor:
  - life
lieCounter: 0
type: Elul Log
---
```

## Meditation Notes

Started meditation around [timeStarted:: null].
gratitudeMeditation → did I actually do it?

- gratefulFor → concrete things I named.
- lieCounter → reinforcement for my “truthfulness” resolution.
- timeStarted → inline timestamp for consistency.

QuickAdd makes this painless: one hotkey = new log. Another marks the meditation done and stamps the time, another increments the lie counter.

## The Main Page

All the pieces roll up into a single Resolution note with the Elul window in the front-matter:

```frontmatter
---
type: Resolution
resolution: Every day, preferably in the morning, meditate on Hashem’s kindness and the many gifts He has given me in His infinite love.
year: 5785
elulStart: 2025-08-24
elulEnd: 2025-10-03
---
```

The rest of the page is just DataviewJS + ChartsView.

### Gratitude Meditation – Overall Completion

Pie chart showing how many days I’ve completed vs missed:


```chartsview
type: Pie
data: |
  dataviewjs:
  const { elulStart, elulEnd } = dv.current().file.frontmatter;
  const start = dv.date(elulStart);
  const end   = dv.date(elulEnd).endOf('day');

  const logs = dv.pages("Elul Logs")
    .where(p => p.type === "Elul Log" && p.date &&
                dv.date(p.date) >= start && dv.date(p.date) <= end)
    .array();

  const completed = logs.filter(p => p.gratitudeMeditation).length;
  const missed = logs.length - completed;

  return (logs.length
    ? [{ status: "Completed", count: completed },
       { status: "Missed", count: missed }]
    : [{ status: "No data yet", count: 1 }]);

options:
  angleField: "count"
  colorField: "status"
  label:
    type: "inner"
    offset: "-30%"
    content: "{percentage}"
```

Basically a streak visualizer: did I actually show up?

Truthfulness – Daily Counts
Column chart of lie counts per day:

```chartsview
type: Column
data: |
  dataviewjs:
  const { elulStart, elulEnd } = dv.current().file.frontmatter;
  const start = dv.date(elulStart);
  const end   = dv.date(elulEnd).endOf('day');

  const logs = dv.pages()
    .where(p => p.type === "Elul Log" && p.date &&
                dv.date(p.date) >= start && dv.date(p.date) <= end)
    .sort(p => p.date, 'asc')
    .array();

  return logs.map(p => ({
    date: dv.date(p.date).toISODate(),
    lies: p.lieCounter ?? 0
  }));

options:
  xField: "date"
  yField: "lies"
  xAxis:
    type: time
    mask: "YYYY-MM-DD"
    title: { text: "Date" }
  yAxis:
    title: { text: "Lie Count" }
    min: 0
```
Lets me see if the counter stays flat at zero or spikes.

### Completion Rate with Calendar Accuracy

The pie chart only counts logged days. If I want accuracy against the entire Elul window (including blanks), I use this DataviewJS snippet:

```dataviewjs
const { elulStart, elulEnd } = dv.current().file.frontmatter;
const start = dv.date(elulStart).startOf('day');
const end   = dv.date(elulEnd).endOf('day');

const logs = dv.pages("Elul Logs")
  .where(p => p.type==="Elul Log" && p.date && dv.date(p.date)>=start && dv.date(p.date)<=end)
  .array();

const doneDays = new Set(logs.filter(p=>p.gratitudeMeditation).map(p=>dv.date(p.date).toISODate()));

let totalDays = 0, completed = 0;
for (let d = start; d <= end; d = d.plus({days:1})) {
  totalDays++;
  if (doneDays.has(d.toISODate())) completed++;
}
const missed = totalDays - completed;
dv.paragraph(`Completed: ${completed} / ${totalDays} (${Math.round(100*completed/totalDays)}%)`);
```

That one doesn’t care if I logged—if I didn’t show up, it still counts as a miss.

### The Meditation Script
At the bottom of the page I keep the script I actually use, so the dashboard isn’t just analytics—it reminds me what I’m supposed to be doing:

## Why This Matters

The point isn’t the charts. It’s that with automation in place, I don’t burn willpower on logistics. QuickAdd spawns the logs, Dataview aggregates them, ChartsView makes the streak obvious. My only job is to actually do the practice.

And yes—it’s also just fun to nerd out.