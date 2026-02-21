# Markt — CLAUDE.md

## What This Is

Markt is a premium B2B dashboard component kit extracted from production SplitFin-New code. It ships as purchasable packages on Gumroad.

## Source Repository

All components are extracted and genericised from:
```
/Users/blair/Desktop/Development/Splitfin-New/
```

Key source files:
- `src/components/dashboard/DashboardCharts.tsx` → 4 interactive chart cards (primary foundation)
- `src/components/analytics/shared/MetricCard.tsx` → metric card designs (3 variants × 3 sizes)
- `src/components/analytics/shared/MetricCardSquare.tsx` → square metric cards (designs only, rewrite in Tailwind)
- `src/components/analytics/shared/CompactCard.tsx` → compact horizontal KPI card
- `src/components/shared/SplitfinTable.tsx` → TanStack Table v8 data table card
- `src/components/ui/card.tsx` → shadcn Card primitives
- `src/components/ui/chart.tsx` → shadcn Chart primitives

## Tech Stack

- React 19
- TypeScript (strict — no @ts-nocheck, no any)
- Tailwind CSS v4 (NO CSS modules — convert everything)
- Recharts (NO Chart.js — standardise on one library)
- motion/react (spring animations)
- TanStack Table v8
- shadcn/ui primitives (Card, Chart, Table, Skeleton, Badge)
- Optional: react-countup

## Design Rules

1. **Dark-first aesthetic** — dark teal glassmorphic theme, ships with dark CSS variables
2. **shadcn CSS variable contract** — all colours via --card, --chart-1 through --chart-5, etc.
3. **Tailwind only** — no CSS modules, no styled-components, no inline style objects (except dynamic accent colours)
4. **Props-only API** — no internal data fetching, no contexts, no auth dependencies
5. **Fully typed** — every prop, every callback, every generic

## Genericisation Rules

When extracting from SplitFin-New:

1. Remove ALL references to: SplitFin, splitfin, agent, authService, analyticsDataService, useDashboard
2. Remove ALL data fetching — components receive data via props only
3. Remove ColorProvider dependency — accept colour as a prop with sensible default
4. Replace hardcoded £/GBP with format utilities that accept currency config
5. Replace business-specific labels (Revenue, Orders, Stock, Agent) with generic props
6. Keep ALL interactive behaviours: spring animations, glow filters, clip-path reveals, hover states

## Component Inventory

See `component-spec.md` for full API specification.

| Component | Source | Status |
|-----------|--------|--------|
| AreaChartCard | DashboardCharts.tsx → RevenueChart | To build |
| BarChartCard | DashboardCharts.tsx → OrdersChart | To build |
| RadialChartCard | DashboardCharts.tsx → StockChart | To build |
| LineChartCard | DashboardCharts.tsx → AgentChart | To build |
| MetricCard | MetricCard.tsx + MetricCardSquare.tsx + CompactCard.tsx | To build (Tailwind rewrite) |
| DataTableCard | SplitfinTable.tsx | To build (rename + package) |

## Build Order

1. Scaffold project: package.json, tsconfig, tailwind config, globals.css with dark theme
2. Copy shadcn primitives: card.tsx, chart.tsx, table.tsx, skeleton.tsx, badge.tsx
3. Create lib/format.ts and lib/utils.ts
4. Build the 4 chart cards (extract from DashboardCharts.tsx, genericise)
5. Build MetricCard (merge 3 source files, rewrite in Tailwind, unify on Recharts)
6. Build DataTableCard (rename SplitfinTable, package)
7. Create demo page with sample data generators
8. Polish, test, bundle

## Output Directory

```
/Users/blair/Desktop/Development/markt/markt-core/
```

## What Comes Later (Not This Phase)

- Dashboard builder (drag-drop-resize grid) — separate product, rebuilding from scratch
- Analytics package (full-page chart compositions)
- Inventory, Orders, CRM packages
- Gumroad listing, marketing site
