# Markt — Claude Code Kickoff Prompts

## Session 1: Scaffold + Shared Utilities

```
Read CLAUDE.md and component-spec.md. Scaffold the markt-core project:

1. Create package.json with dependencies: react, recharts, motion, @tanstack/react-table, clsx, tailwind-merge
2. Create tsconfig.json with strict mode, path aliases (@/ → src/)
3. Create tailwind.config.ts for v4
4. Create styles/globals.css with the full dark theme CSS variable set from component-spec.md
5. Copy these shadcn primitives from /Users/blair/Desktop/Development/Splitfin-New/src/components/ui/ into components/ui/:
   - card.tsx
   - chart.tsx
   - table.tsx
   - skeleton.tsx
   - badge.tsx
6. Copy lib/utils.ts (cn helper) from Splitfin-New
7. Create lib/format.ts with formatCurrency, formatCompact, formatNumber, formatPercentage, formatValue
8. Create components/index.ts barrel export (empty for now)
9. Create lib/demo-data.ts with the sample data generators from the spec

Do not build any card components yet.
```

## Session 2: Chart Cards

```
Read CLAUDE.md and component-spec.md. Now build the 4 chart card components.

Source file: /Users/blair/Desktop/Development/Splitfin-New/src/components/dashboard/DashboardCharts.tsx

Extract and genericise each chart into its own file:

1. components/cards/area-chart-card.tsx — from RevenueChart
   - Replace "Revenue" with title/description props
   - Replace formatGBP with formatValue using totalFormat prop
   - Keep the full spring animation + clip-path + floating badge behaviour
   - Keep the ghost line behind clipped area

2. components/cards/bar-chart-card.tsx — from OrdersChart
   - Replace "Orders" with title/description props
   - Add highlightStrategy prop ('max' | 'last' | 'hover')
   - Keep spring-animated reference line + value badge
   - Keep cell opacity transitions

3. components/cards/radial-chart-card.tsx — from StockChart
   - Replace "Stock Total" with title/description/totalSuffix props
   - Accept colors array prop instead of hardcoded STOCK_COLORS
   - Keep SVG glow filters on hover
   - Keep inline legend

4. components/cards/line-chart-card.tsx — from AgentChart
   - Replace agent-specific props with generic title/description/subtitle
   - Add glowIntensity and curveType props
   - Keep SVG glow filter

Add all 4 to the barrel export. Do not modify any shadcn primitives.
```

## Session 3: MetricCard

```
Read CLAUDE.md and component-spec.md. Build the unified MetricCard component.

Source files:
- /Users/blair/Desktop/Development/Splitfin-New/src/components/analytics/shared/MetricCard.tsx
- /Users/blair/Desktop/Development/Splitfin-New/src/components/analytics/shared/MetricCard.module.css
- /Users/blair/Desktop/Development/Splitfin-New/src/components/analytics/shared/MetricCardSquare.tsx
- /Users/blair/Desktop/Development/Splitfin-New/src/components/analytics/shared/MetricCardSquare.module.css
- /Users/blair/Desktop/Development/Splitfin-New/src/components/analytics/shared/CompactCard.tsx

Create components/cards/metric-card.tsx that:

1. Implements ALL Tailwind — convert every CSS module style to utility classes
2. Has 3 sizes (sm/md/lg) in one component, not separate files
3. Has 4 variants (glass/accent-top/accent-left/bordered) via Tailwind classes
4. Uses Recharts for sparklines (NOT Chart.js) — line, bar, area types
5. Removes ColorProvider dependency — accepts accentColor prop
6. Removes react-countup as hard dependency — only uses it when animate=true
7. Exports CompactCard as a convenience alias for <MetricCard size="sm" />

The sm size should match the horizontal layout from CompactCard.tsx.
The md size should match the standard MetricCard layout.
The lg size should match the large display mode.
The glass variant should match variant1 (glassmorphism + side accent).
The accent-top variant should match variant2 (top border accent).
The bordered variant should match variant3 (full border).

Add to barrel export.
```

## Session 4: DataTableCard + Demo

```
Read CLAUDE.md and component-spec.md. Build DataTableCard and the demo page.

1. components/cards/data-table-card.tsx
   Source: /Users/blair/Desktop/Development/Splitfin-New/src/components/shared/SplitfinTable.tsx
   - Rename to DataTableCard
   - Ensure generic <TData> inference works properly on export
   - Keep skeleton loading, empty state, row click, title bar, view all link
   - No other changes needed — it's already clean Tailwind + TanStack

2. demo/page.tsx
   - Import all 6 components + CompactCard alias
   - Use the demo data generators from lib/demo-data.ts
   - Layout: responsive grid showing every component with sample data
   - Show MetricCard in all 4 variants and all 3 sizes
   - Show each chart card with appropriate sample data
   - Show DataTableCard with sample rows
   - Dark background matching globals.css theme

3. Update barrel export with DataTableCard

4. Final check: run tsc --noEmit and fix any type errors
```
