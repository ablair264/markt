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
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { formatValue, type ValueFormat } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

/** Pair of values for side-by-side trend lines at a single x-axis point. */
export interface DottedMultiLinePoint {
  name: string;
  primary: number;
  secondary: number;
}

export interface DottedMultiLineChartCardProps {
  title: string;
  description?: string;
  total: number | string;
  totalFormat?: ValueFormat;
  data: DottedMultiLinePoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when `data` is empty. */
  emptyMessage?: string;
  onClick?: () => void;
  className?: string;
}

export function DottedMultiLineChartCard({
  title,
  description,
  total,
  totalFormat = 'number',
  data,
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  primaryColor = 'var(--color-chart-2)',
  secondaryColor = 'var(--color-chart-5)',
  height = 120,
  loading = false,
  emptyMessage = 'No data available',
  onClick,
  className,
}: DottedMultiLineChartCardProps) {
  const chartConfig: ChartConfig = {
    primary: {
      label: primaryLabel,
      color: primaryColor,
    },
    secondary: {
      label: secondaryLabel,
      color: secondaryColor,
    },
  };

  const formattedTotal =
    typeof total === 'string' ? total : formatValue(total, totalFormat);
  const hasData = data.length > 0;

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
        <CardTitle className="text-xl tabular-nums">{formattedTotal}</CardTitle>
        {description && (
          <CardDescription className="text-[10px] text-muted-foreground/70">
            {description}
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
          <ChartContainer className="w-full" style={{ height }} config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 10, right: 10, top: 4, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="primary"
                type="linear"
                stroke="var(--color-primary)"
                dot={false}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                dataKey="secondary"
                type="linear"
                stroke="var(--color-secondary)"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
