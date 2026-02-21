import { useState, useMemo, useId } from 'react';
import { Cell, RadialBar, RadialBarChart } from 'recharts';
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
import { formatValue, type ValueFormat } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { type ChartDataPoint } from './data-contracts';

export const RADIAL_CHART_CARD_MIN_HEIGHT = 228;
export type { ChartDataPoint } from './data-contracts';

export interface RadialChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalSuffix?: string;
  totalFormat?: ValueFormat;
  /** Array of `{ name, value }` points from your data provider. */
  data: ChartDataPoint[];
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  height?: number;
  cardHeight?: number;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when `data` is empty. */
  emptyMessage?: string;
  onClick?: () => void;
  className?: string;
}

const DEFAULT_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
];

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

export function RadialChartCard({
  title,
  description,
  total,
  totalSuffix,
  totalFormat = 'number',
  data,
  colors = DEFAULT_COLORS,
  innerRadius = 36,
  outerRadius = 84,
  showLegend = true,
  height = 168,
  cardHeight = 228,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: RadialChartCardProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const uid = useId();
  const filterId = `radial-glow-${uid.replace(/:/g, '')}`;

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        name: d.name,
        value: d.value,
        fill: colors[i % colors.length],
      })),
    [data, colors],
  );

  const chartConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = { value: { label: title } };
    chartData.forEach((d) => {
      cfg[d.name] = { label: d.name, color: d.fill };
    });
    return cfg;
  }, [chartData, title]);

  const formattedTotal =
    typeof total === 'string' ? total : formatValue(total, totalFormat);
  const hasData = data.length > 0;

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/30 transition-colors py-4 gap-3 h-full',
        className,
      )}
      style={{ minHeight: cardHeight }}
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
        <CardTitle className="text-xl tabular-nums">
          {formattedTotal}
          {totalSuffix && (
            <span className="text-sm font-normal text-muted-foreground ml-1.5">
              {totalSuffix}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-1 mt-auto">
        {loading ? (
          <div className="space-y-2" style={{ height }}>
            <Skeleton className="h-4 w-20" />
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
          <div
            className={cn(
              'flex items-end gap-3',
              showLegend ? 'justify-between' : 'justify-end',
            )}
          >
            {showLegend && (
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="grid w-fit grid-cols-[auto_auto] items-center gap-x-2 gap-y-1">
                  {chartData.map((d) => (
                    <div key={d.name} className="contents">
                      <div className="flex items-center gap-1.5 text-[10px] leading-4">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: d.fill }}
                        />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium text-[10px] text-foreground tabular-nums text-right">
                        {d.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className={cn(
                'shrink-0 overflow-hidden',
                showLegend
                  ? 'w-[72%] max-w-[320px] -mt-8 -mr-1'
                  : 'w-full max-w-[320px] mx-auto',
              )}
            >
              <ChartContainer
                config={chartConfig}
                className="w-full"
                style={{ height }}
              >
                <RadialBarChart
                  data={chartData}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  onMouseMove={(state) => {
                    if (state?.activePayload?.[0]) {
                      setActiveKey(
                        state.activePayload[0].payload.name as string,
                      );
                    }
                  }}
                  onMouseLeave={() => setActiveKey(null)}
                >
                  <ChartTooltip cursor={false} content={<DataTooltip />} />
                  <RadialBar
                    cornerRadius={8}
                    dataKey="value"
                    background
                    className="drop-shadow-lg"
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.fill}
                        filter={
                          activeKey === entry.name
                            ? `url(#${filterId}-${i})`
                            : undefined
                        }
                        opacity={
                          activeKey === null || activeKey === entry.name ? 1 : 0.3
                        }
                      />
                    ))}
                  </RadialBar>
                  <defs>
                    {chartData.map((_, i) => (
                      <filter
                        key={i}
                        id={`${filterId}-${i}`}
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite
                          in="SourceGraphic"
                          in2="blur"
                          operator="over"
                        />
                      </filter>
                    ))}
                  </defs>
                </RadialBarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
