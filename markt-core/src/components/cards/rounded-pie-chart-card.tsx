import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, Sector, type SectorProps } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { formatValue, type ValueFormat } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

/** Single segment point for pie cards: `{ name, value }`. */
export interface RoundedPieChartPoint {
  name: string;
  value: number;
}

export interface RoundedPieChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalSuffix?: string;
  totalFormat?: ValueFormat;
  data: RoundedPieChartPoint[];
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
const HOVER_RESET_DELAY_MS = 90;
const HOVER_EXPANSION_PX = 4;
const CHART_BREATHING_PX = 8;

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

export function RoundedPieChartCard({
  title,
  description,
  total,
  totalSuffix,
  totalFormat = 'number',
  data,
  colors = DEFAULT_COLORS,
  innerRadius = 50,
  outerRadius = 82,
  showLegend = true,
  height = 168,
  cardHeight = 228,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: RoundedPieChartCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current !== null) {
        window.clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

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
                          className="h-2 w-2 shrink-0 rounded-full"
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
                style={{ height: height + CHART_BREATHING_PX * 2 }}
              >
                <PieChart
                  onMouseLeave={() => {
                    if (leaveTimeoutRef.current !== null) {
                      window.clearTimeout(leaveTimeoutRef.current);
                    }
                    leaveTimeoutRef.current = window.setTimeout(() => {
                      setActiveIndex(null);
                      leaveTimeoutRef.current = null;
                    }, HOVER_RESET_DELAY_MS);
                  }}
                >
                  <ChartTooltip cursor={false} content={<DataTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    cornerRadius={10}
                    paddingAngle={3}
                    stroke="none"
                    onMouseEnter={(_, index) => {
                      if (leaveTimeoutRef.current !== null) {
                        window.clearTimeout(leaveTimeoutRef.current);
                        leaveTimeoutRef.current = null;
                      }
                      setActiveIndex(index);
                    }}
                    activeIndex={activeIndex ?? -1}
                    activeShape={(shapeProps: SectorProps) => (
                      <Sector
                        {...shapeProps}
                        outerRadius={Number(shapeProps.outerRadius) + HOVER_EXPANSION_PX}
                      />
                    )}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.fill}
                        opacity={
                          activeIndex === null || activeIndex === i ? 1 : 0.3
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
