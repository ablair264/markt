import { useState, useMemo, useEffect } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
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
import { formatValue, type ValueFormat } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { type ChartDataPoint } from './data-contracts';

export const BAR_CHART_CARD_MIN_HEIGHT = 228;
export type { ChartDataPoint } from './data-contracts';

export interface BarChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalFormat?: ValueFormat;
  subtitle?: string;
  /** Array of `{ name, value }` points from your data provider. */
  data: ChartDataPoint[];
  color?: string;
  highlightStrategy?: 'max' | 'last' | 'hover';
  height?: number;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when `data` is empty. */
  emptyMessage?: string;
  onClick?: () => void;
  className?: string;
}

const CHART_MARGIN = 30;

/** Value badge pinned to the left axis area. */
function RefLabel({
  viewBox,
  value,
  color,
}: {
  viewBox?: { x?: number; y?: number };
  value: number;
  color: string;
}) {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;
  const w = value.toString().length * 7 + 10;
  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 8}
        width={w}
        height={16}
        fill={color}
        rx={3}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + w / 2}
        y={y}
        dominantBaseline="central"
        textAnchor="middle"
        fill="var(--primary-foreground)"
        fontSize={10}
      >
        {value}
      </text>
    </>
  );
}

export function BarChartCard({
  title,
  description,
  total,
  totalFormat = 'number',
  subtitle,
  data,
  color = 'var(--color-chart-2)',
  highlightStrategy = 'max',
  height = 120,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: BarChartCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const hasData = data.length > 0;

  const highlighted = useMemo(() => {
    // When the user is hovering a bar, always use that
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: data[activeIndex]?.value ?? 0 };
    }

    switch (highlightStrategy) {
      case 'last':
        return data.length > 0
          ? { index: data.length - 1, value: data[data.length - 1].value }
          : { index: 0, value: 0 };

      case 'hover':
        // No default highlight when nothing is hovered
        return undefined;

      case 'max':
      default:
        return data.reduce(
          (max, d, i) =>
            d.value > max.value ? { index: i, value: d.value } : max,
          { index: 0, value: 0 },
        );
    }
  }, [activeIndex, data, highlightStrategy]);

  const springVal = useSpring(highlighted?.value ?? 0, {
    stiffness: 100,
    damping: 20,
  });
  const [springy, setSpringy] = useState(highlighted?.value ?? 0);

  useMotionValueEvent(springVal, 'change', (v) =>
    setSpringy(Number(v.toFixed(0))),
  );

  useEffect(() => {
    springVal.set(highlighted?.value ?? 0);
  }, [highlighted?.value, springVal]);

  const chartConfig: ChartConfig = {
    value: { label: title, color },
  };

  const formattedTotal =
    typeof total === 'string' ? total : formatValue(total, totalFormat);

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
            className="w-full"
            style={{ height }}
            config={chartConfig}
          >
            <BarChart
              accessibilityLayer
              data={data}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{ left: CHART_MARGIN, right: 4, top: 12, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 10 }}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={3}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    className="duration-200"
                    opacity={
                      highlighted !== undefined && i === highlighted.index
                        ? 1
                        : 0.2
                    }
                    onMouseEnter={() => setActiveIndex(i)}
                  />
                ))}
              </Bar>
              {highlighted !== undefined && (
                <ReferenceLine
                  opacity={0.4}
                  y={springy}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={<RefLabel value={highlighted.value} color={color} />}
                />
              )}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
