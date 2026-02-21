# Markt Component API Spec

## Foundation

All components share these base dependencies:
- **shadcn/ui** Card primitives (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`)
- **shadcn/ui** Chart primitives (`ChartContainer`, `ChartConfig`, `ChartTooltip`)
- **Recharts** (all charting — no Chart.js)
- **motion/react** (`useSpring`, `useMotionValueEvent`) for spring animations
- **Tailwind CSS v4** — no CSS modules anywhere
- **TanStack Table v8** (table component only)
- **@/lib/utils** `cn()` helper

Optional enhancement: `react-countup` for animated number transitions.

All components are fully typed TypeScript. No `@ts-nocheck`, no `any`.

---

## Shared Types

```typescript
interface ChartDataPoint {
  name: string;
  value: number;
}

interface TrendIndicator {
  value: number;        // percentage change
  isPositive: boolean;
}

type ValueFormat = 'currency' | 'number' | 'percentage';

// Card visual variant (applies to MetricCard)
type CardVariant = 'glass' | 'accent-top' | 'accent-left' | 'bordered';
```

### Formatting Helpers (lib/format.ts)

```typescript
// £12,345
formatCurrency(n: number, currency?: string): string

// 12.3K
formatCompact(n: number): string

// 12,345
formatNumber(n: number): string

// 12.5%
formatPercentage(n: number): string

// Dispatcher
formatValue(n: number, format: ValueFormat): string
```

---

## 1. AreaChartCard

**Source:** `RevenueChart` from DashboardCharts.tsx
**Key feature:** Spring-animated clip-path reveal + floating value badge

```typescript
interface AreaChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalFormat?: ValueFormat;
  data: ChartDataPoint[];
  color?: string;                    // CSS variable or hex, default var(--chart-1)
  gradientOpacity?: [number, number]; // [top, bottom] default [0.2, 0]
  height?: number;                   // chart area height, default 112 (h-28)
  onClick?: () => void;
  className?: string;
}
```

**Behaviour:**
- On mount, spring jumps to chart width (full reveal)
- On mouse move, clip-path follows cursor X via `useSpring`
- Floating badge tracks cursor showing interpolated value
- Ghost line visible behind clipped area at 10% opacity
- Mouse leave → spring back to full width

---

## 2. BarChartCard

**Source:** `OrdersChart` from DashboardCharts.tsx
**Key feature:** Highlighted cell with spring-animated reference line

```typescript
interface BarChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalFormat?: ValueFormat;
  data: ChartDataPoint[];
  color?: string;                    // default var(--chart-2)
  highlightStrategy?: 'max' | 'last' | 'hover'; // default 'max'
  height?: number;                   // default 112
  onClick?: () => void;
  className?: string;
}
```

**Behaviour:**
- Default: highest value bar is highlighted at 100% opacity, others at 20%
- Hover: hovered bar becomes highlighted instead
- Reference line at highlighted value with spring animation
- Value badge pinned to left axis area
- Mouse leave → reverts to default highlight

---

## 3. RadialChartCard

**Source:** `StockChart` from DashboardCharts.tsx
**Key feature:** Glowing SVG filter on hover + inline legend

```typescript
interface RadialChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalSuffix?: string;              // e.g. "units"
  totalFormat?: ValueFormat;
  data: ChartDataPoint[];
  colors?: string[];                 // default [var(--chart-1), var(--chart-4), var(--chart-5)]
  innerRadius?: number;              // default 24
  outerRadius?: number;              // default 56
  showLegend?: boolean;              // default true
  height?: number;                   // default 112
  onClick?: () => void;
  className?: string;
}
```

**Behaviour:**
- Hover on segment → SVG gaussian blur glow filter activates, others fade to 30%
- Legend renders inline to the right of the chart
- Tooltip shows segment name + value

---

## 4. LineChartCard

**Source:** `AgentChart` from DashboardCharts.tsx
**Key feature:** Glowing line via SVG filter

```typescript
interface LineChartCardProps {
  title: string;
  description?: string;
  subtitle?: string;                 // secondary info line below title
  data: ChartDataPoint[];
  color?: string;                    // default var(--chart-3)
  glowIntensity?: number;            // feGaussianBlur stdDeviation, default 8
  strokeWidth?: number;              // default 2
  curveType?: 'bump' | 'monotone' | 'linear'; // default 'bump'
  height?: number;                   // default 112
  onClick?: () => void;
  className?: string;
}
```

**Behaviour:**
- Line renders with permanent SVG glow filter
- Tooltip on hover via `ChartTooltip`
- Grid lines horizontal only, dashed

---

## 5. MetricCard

**Source:** Merged from `MetricCard.tsx` + `MetricCardSquare.tsx` + `CompactCard.tsx`, rebuilt in Tailwind
**Key feature:** Multiple visual variants + optional sparkline + three sizes

```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  format?: ValueFormat;
  trend?: TrendIndicator;
  variant?: CardVariant;             // default 'glass'
  accentColor?: string;              // default var(--chart-1)

  // Optional sparkline
  sparkline?: {
    data: ChartDataPoint[];
    type: 'line' | 'bar' | 'area';   // default 'area'
  };

  // Size
  size?: 'sm' | 'md' | 'lg';        // default 'md'
  // sm = compact horizontal (68px tall), md = standard (160-200px), lg = expanded (220-280px)
  // 'square' aspect ratio available via className="aspect-square"

  // Animated count-up (requires react-countup)
  animate?: boolean;                 // default false

  icon?: React.ReactNode;            // only rendered in 'sm' size
  onClick?: () => void;
  className?: string;
}
```

**Variants (all Tailwind):**

| Variant | Visual |
|---------|--------|
| `glass` | `backdrop-blur-xl bg-card/80 border-l-4` with accentColor |
| `accent-top` | `border-t-4` with accentColor |
| `accent-left` | `border-l-4` with accentColor, no blur |
| `bordered` | `border-2` all sides with accentColor |

**Sizes:**

| Size | Layout | Min Height |
|------|--------|-----------|
| `sm` | Horizontal: icon → value/title → trend badge | 68px |
| `md` | Vertical: title+trend → value → subtitle → sparkline | 160px |
| `lg` | Vertical: same as md but larger type, taller chart area | 220px |

**Sparkline rendering:**
- Uses same Recharts primitives as chart cards
- Line: `<LineChart>` with dot=false
- Bar: `<BarChart>` with small radius
- Area: `<AreaChart>` with gradient fill
- No axes, no grid, no tooltip — pure decorative sparkline
- Date range labels (first/last data point name) below sparkline

**CompactCard convenience alias:**
Export `CompactCard` as a named wrapper around `<MetricCard size="sm" />` for discoverability. One implementation.

---

## 6. DataTableCard

**Source:** `SplitfinTable.tsx` (already Tailwind + TanStack)
**Key feature:** Full TanStack Table v8 inside a card shell

```typescript
interface DataTableCardProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
  viewAllLink?: {
    label?: string;
    onClick: () => void;
  };
  loading?: boolean;
  skeletonRows?: number;             // default 5
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
  };
  onRowClick?: (row: TData) => void;
  className?: string;
}
```

Essentially SplitfinTable renamed. Minimal changes:
- Rename to `DataTableCard`
- Include shadcn Table + Skeleton primitives in the kit
- Ensure generic TypeScript inference works on export

---

## File Structure

```
markt-core/
├── components/
│   ├── cards/
│   │   ├── area-chart-card.tsx
│   │   ├── bar-chart-card.tsx
│   │   ├── radial-chart-card.tsx
│   │   ├── line-chart-card.tsx
│   │   ├── metric-card.tsx          # includes CompactCard export
│   │   └── data-table-card.tsx
│   ├── ui/
│   │   ├── card.tsx                 # shadcn
│   │   ├── chart.tsx                # shadcn
│   │   ├── table.tsx                # shadcn
│   │   ├── skeleton.tsx             # shadcn
│   │   └── badge.tsx                # shadcn
│   └── index.ts                     # barrel export
├── lib/
│   ├── utils.ts                     # cn() helper
│   └── format.ts                    # formatCurrency, formatCompact etc
├── styles/
│   └── globals.css                  # CSS variables, chart colour tokens
├── demo/
│   └── page.tsx                     # showcase page with sample data
├── package.json
├── tsconfig.json
└── README.md
```

---

## CSS Variable Contract

All components use these CSS variables (set in globals.css):

```css
/* Card surfaces */
--card: <color>;
--card-foreground: <color>;
--border: <color>;

/* Typography */
--foreground: <color>;
--muted-foreground: <color>;
--primary-foreground: <color>;

/* Chart palette (up to 5 colours) */
--chart-1: <color>;    /* primary — teal */
--chart-2: <color>;    /* secondary */
--chart-3: <color>;    /* tertiary */
--chart-4: <color>;    /* quaternary */
--chart-5: <color>;    /* quinary */

/* Semantic */
--primary: <color>;
--destructive: <color>;
--muted: <color>;
--accent: <color>;

/* Shadows */
--shadow-sm: <shadow>;
--shadow-md: <shadow>;
--shadow-lg: <shadow>;
```

These map directly to shadcn's default CSS variable system. Buyers using shadcn already have these defined. For non-shadcn users, globals.css ships with a dark theme preset matching the Markt aesthetic.

---

## Dependency Summary

| Package | Used By | Required |
|---------|---------|----------|
| recharts | All chart cards, MetricCard sparklines | Yes |
| motion/react | AreaChartCard, BarChartCard | Yes |
| @tanstack/react-table | DataTableCard | Yes |
| react-countup | MetricCard (animate prop) | Optional |
| tailwindcss v4 | All | Yes |
| clsx / tailwind-merge | cn() utility | Yes |

---

## Demo Data Generators

For the showcase page, provide typed sample data:

```typescript
generateRevenueData(): ChartDataPoint[]      // 12 months of plausible revenue
generateOrderData(days?: number): ChartDataPoint[]  // daily order counts
generateCategoryData(): ChartDataPoint[]      // 3-5 category segments
generateAgentData(): ChartDataPoint[]         // agent performance time series
generateTableData(rows?: number): SampleRow[] // table rows
```
