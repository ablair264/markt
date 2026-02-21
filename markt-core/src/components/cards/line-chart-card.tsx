import { useId } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { type ChartDataPoint } from './data-contracts';

export const LINE_CHART_CARD_MIN_HEIGHT = 228;
export type { ChartDataPoint } from './data-contracts';

export interface LineChartCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  /** Array of `{ name, value }` points from your data provider. */
  data: ChartDataPoint[];
  color?: string;
  glowIntensity?: number;
  strokeWidth?: number;
  curveType?: 'bump' | 'monotone' | 'linear';
  height?: number;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when `data` is empty. */
  emptyMessage?: string;
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  DataTooltip — mirrors the source DashboardCharts.tsx tooltip       */
/* ------------------------------------------------------------------ */

function DataTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: Record<string, unknown> }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="grid gap-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{
                  background:
                    (item.payload.fill as string) || 'var(--color-chart-1)',
                }}
              />
              <span className="text-muted-foreground">
                {item.payload.name as string}
              </span>
            </div>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LineChartCard                                                       */
/* ------------------------------------------------------------------ */

export function LineChartCard({
  title,
  description,
  subtitle,
  data,
  color = 'var(--color-chart-3)',
  glowIntensity = 8,
  strokeWidth = 2,
  curveType = 'bump',
  height = 120,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: LineChartCardProps) {
  const uid = useId();
  const glowFilterId = `line-glow-${uid.replace(/:/g, '')}`;
  const hasData = data.length > 0;

  const chartConfig: ChartConfig = {
    value: { label: title, color },
  };

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
          {description ?? title}
        </CardDescription>
        <CardTitle className="text-xl">{title}</CardTitle>
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
            config={chartConfig}
            className="w-full"
            style={{ height }}
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12, top: 4, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip cursor={false} content={<DataTooltip />} />
              <Line
                dataKey="value"
                type={curveType}
                stroke="var(--color-value)"
                dot={false}
                strokeWidth={strokeWidth}
                filter={`url(#${glowFilterId})`}
              />
              <defs>
                <filter
                  id={glowFilterId}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur
                    stdDeviation={glowIntensity}
                    result="blur"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="blur"
                    operator="over"
                  />
                </filter>
              </defs>
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
