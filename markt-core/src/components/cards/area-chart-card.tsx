import { useRef, useState, useEffect, useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from 'recharts';
import { useSpring, useMotionValueEvent } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { formatValue, formatCompact, type ValueFormat } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { type ChartDataPoint } from './data-contracts';

export const AREA_CHART_CARD_MIN_HEIGHT = 228;
export type { ChartDataPoint } from './data-contracts';

/**
 * Displays a metric total with an interactive area sparkline.
 *
 * ### Mapping from data providers
 * ```ts
 * // Supabase
 * const { data } = await supabase
 *   .from('orders')
 *   .select('date, total')
 *   .order('date');
 *
 * // Neon / Drizzle / Prisma / any SQL
 * const rows = await db.select({ date: orders.date, total: sql<number>`SUM(amount)` })
 *   .from(orders).groupBy(orders.date).orderBy(orders.date);
 *
 * // Firebase
 * const snap = await getDocs(query(collection(db, 'orders'), orderBy('date')));
 * const rows = snap.docs.map(d => d.data());
 *
 * // All three map the same way:
 * <AreaChartCard
 *   total={rows.reduce((s, r) => s + r.total, 0)}
 *   data={rows.map(r => ({ name: r.date, value: r.total }))}
 *   loading={isLoading}
 * />
 * ```
 */
export interface AreaChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalFormat?: ValueFormat;
  subtitle?: string;
  /** Array of `{ name, value }` points. Renders empty state when the array is empty. */
  data: ChartDataPoint[];
  color?: string;
  gradientOpacity?: [number, number];
  height?: number;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when `data` is empty. */
  emptyMessage?: string;
  onClick?: () => void;
  className?: string;
}

export function AreaChartCard({
  title,
  description,
  total,
  totalFormat = 'currency',
  subtitle,
  data,
  color = 'var(--color-chart-1)',
  gradientOpacity = [0.2, 0],
  height = 120,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: AreaChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const uid = useId();
  const gradientId = `area-grad-${uid.replace(/:/g, '')}`;

  const springX = useSpring(0, { damping: 30, stiffness: 100 });
  const springY = useSpring(0, { damping: 30, stiffness: 100 });

  useMotionValueEvent(springX, 'change', (latest) => setAxis(latest));

  // Initialise spring to chart width on mount and keep it in sync on resize.
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const syncWidth = () => {
      const width = element.getBoundingClientRect().width;
      setChartWidth(width);
      springX.jump(width);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [springX]);

  const chartConfig: ChartConfig = {
    value: { label: title, color },
  };

  const formattedTotal =
    typeof total === 'string' ? total : formatValue(total, totalFormat);
  const hasData = data.length > 0;
  const revealInset = Math.max(chartWidth - axis, 0);

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/30 transition-colors py-4 gap-3 h-full',
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="px-4 pb-0 gap-1">
        <CardDescription className="text-[11px] uppercase tracking-wider font-medium">
          {title}
        </CardDescription>
        {description && (
          <CardDescription className="text-[10px] text-muted-foreground/70">
            {description}
          </CardDescription>
        )}
        <CardTitle className="flex items-center gap-2 text-xl tabular-nums">
          {formattedTotal}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-xs tabular-nums">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-2 pb-0 mt-auto">
        {loading ? (
          <div className="space-y-2" style={{ height }}>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[calc(100%-1.5rem)] w-full" />
          </div>
        ) : !hasData ? (
          <div
            className="flex h-full items-center justify-center rounded-md border border-dashed border-border/70 text-xs text-muted-foreground"
            style={{ height }}
          >
            {emptyMessage}
          </div>
        ) : (
          <ChartContainer
            ref={chartRef}
            className="w-full"
            style={{ height }}
            config={chartConfig}
          >
            <AreaChart
              className="overflow-visible"
              accessibilityLayer
              data={data}
              onMouseMove={(state) => {
                const x = state.activeCoordinate?.x;
                const v = state.activePayload?.[0]?.value;
                if (x !== undefined && v !== undefined) {
                  springX.set(x);
                  springY.set(v as number);
                }
              }}
              onMouseLeave={() => {
                springX.set(
                  chartRef.current?.getBoundingClientRect().width || 0,
                );
                if (data.length > 0) springY.jump(data[data.length - 1].value);
              }}
              margin={{ right: 0, left: 0, top: 4, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                horizontalCoordinatesGenerator={({ height: h }) => [0, h - 20]}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 10 }}
              />

              {/* Clipped primary area */}
              <Area
                dataKey="value"
                type="monotone"
                fill={`url(#${gradientId})`}
                fillOpacity={0.4}
                stroke="var(--color-value)"
                clipPath={`inset(0 ${revealInset} 0 0)`}
              />

              {/* Cursor dashed line */}
              <line
                x1={axis}
                y1={0}
                x2={axis}
                y2="85%"
                stroke="var(--color-value)"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeOpacity={0.2}
              />

              {/* Floating badge */}
              <rect
                x={axis - 50}
                y={0}
                width={50}
                height={16}
                fill="var(--color-value)"
                rx={3}
              />
              <text
                x={axis - 25}
                fontWeight={600}
                y={12}
                textAnchor="middle"
                fill="var(--primary-foreground)"
                fontSize={10}
              >
                {formatCompact(springY.get())}
              </text>

              {/* Ghost line behind clipped area */}
              <Area
                dataKey="value"
                type="monotone"
                fill="none"
                stroke="var(--color-value)"
                strokeOpacity={0.1}
              />

              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={gradientOpacity[0]}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={gradientOpacity[1]}
                  />
                </linearGradient>
              </defs>
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
