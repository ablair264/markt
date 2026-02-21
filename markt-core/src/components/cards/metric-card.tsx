import { useRef, useState, useEffect, useId, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useSpring, useMotionValueEvent } from 'motion/react';
import CountUp from 'react-countup';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatValue, formatCompact, type ValueFormat } from '@/lib/format';
import { type ChartDataPoint } from './data-contracts';

/* ------------------------------------------------------------------ */
/*  Height constants (for dashboard widget minHeight)                  */
/* ------------------------------------------------------------------ */

/** Natural minimum height of each MetricCard size, in pixels.
 *  Sparklines use mt-auto and fit within these heights via flex layout. */
export const METRIC_CARD_MIN_HEIGHT = { sm: 68, md: 160, lg: 220 } as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TrendIndicator {
  value: number;
  isPositive: boolean;
}

export type CardVariant =
  | 'glass'
  | 'accent-top'
  | 'accent-left'
  | 'accent-right'
  | 'accent-bottom'
  | 'bordered';

/**
 * Generic metric card with optional sparkline.
 *
 * For provider integration, pass a formatted `value` and map time-series rows
 * into `sparkline.data` as `{ name, value }`.
 */
export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  format?: ValueFormat;
  trend?: TrendIndicator;
  variant?: CardVariant;
  accentColor?: string;

  /** Optional trend chart data; map provider rows to `{ name, value }`. */
  sparkline?: {
    data: ChartDataPoint[];
    type?: 'line' | 'bar' | 'area';
  };

  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  /** Show skeleton placeholders while data is being fetched. */
  loading?: boolean;
  /** Message rendered when a sparkline is configured with an empty data array. */
  sparklineEmptyMessage?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Variant → Tailwind width classes (NO color classes)                */
/* ------------------------------------------------------------------ */

const variantWidthClasses: Record<CardVariant, string> = {
  glass:       'backdrop-blur-xl bg-card/80 border border-l-4 shadow-md',
  'accent-top':    'bg-card border border-t-4',
  'accent-left':   'bg-card border border-l-4',
  'accent-right':  'bg-card border border-r-4',
  'accent-bottom': 'bg-card border border-b-4',
  bordered:        'bg-card border-2',
};

/** Build the inline style object that paints the accent side in colour
 *  and keeps every other side as the theme border colour. */
function accentStyle(variant: CardVariant, accent: string): React.CSSProperties {
  const base = 'var(--color-border)';
  switch (variant) {
    case 'glass':
    case 'accent-left':
      return { borderColor: base, borderLeftColor: accent };
    case 'accent-top':
      return { borderColor: base, borderTopColor: accent };
    case 'accent-right':
      return { borderColor: base, borderRightColor: accent };
    case 'accent-bottom':
      return { borderColor: base, borderBottomColor: accent };
    case 'bordered':
      return { borderColor: accent };
    default:
      return { borderColor: base };
  }
}

/* ------------------------------------------------------------------ */
/*  Interactive Sparklines (mirror chart card behaviours)              */
/* ------------------------------------------------------------------ */

/** Area sparkline — clip-path reveal + floating badge + ghost line */
function AreaSparkline({
  data,
  color,
  gradientId,
  height,
}: {
  data: ChartDataPoint[];
  color: string;
  gradientId: string;
  height: number;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const springX = useSpring(0, { damping: 30, stiffness: 100 });
  const springY = useSpring(0, { damping: 30, stiffness: 100 });

  useMotionValueEvent(springX, 'change', (latest) => setAxis(latest));

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

  const config: ChartConfig = { value: { label: 'Value', color } };
  const revealInset = Math.max(chartWidth - axis, 0);

  return (
    <ChartContainer
      ref={chartRef}
      className="w-full"
      style={{ height }}
      config={config}
    >
      <AreaChart
        className="overflow-visible"
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
          springX.set(chartRef.current?.getBoundingClientRect().width || 0);
          if (data.length > 0) springY.jump(data[data.length - 1].value);
        }}
        margin={{ right: 0, left: 0, top: 2, bottom: 0 }}
      >
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
        <rect x={axis - 40} y={0} width={40} height={14} fill="var(--color-value)" rx={3} />
        <text
          x={axis - 20}
          fontWeight={600}
          y={10}
          textAnchor="middle"
          fill="var(--primary-foreground)"
          fontSize={9}
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
            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ChartContainer>
  );
}

/** Bar sparkline — highlighted cell + spring-animated reference line */
function BarSparkline({
  data,
  color,
  height,
}: {
  data: ChartDataPoint[];
  color: string;
  height: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const highlighted = useMemo(() => {
    if (activeIndex !== undefined)
      return { index: activeIndex, value: data[activeIndex]?.value ?? 0 };
    return data.reduce(
      (max, d, i) => (d.value > max.value ? { index: i, value: d.value } : max),
      { index: 0, value: 0 },
    );
  }, [activeIndex, data]);

  const springVal = useSpring(highlighted.value, { stiffness: 100, damping: 20 });
  const [springy, setSpringy] = useState(highlighted.value);

  useMotionValueEvent(springVal, 'change', (v) => setSpringy(Number(v.toFixed(0))));
  useEffect(() => { springVal.set(highlighted.value); }, [highlighted.value, springVal]);

  const config: ChartConfig = { value: { label: 'Value', color } };

  return (
    <ChartContainer className="w-full" style={{ height }} config={config}>
      <BarChart
        data={data}
        onMouseLeave={() => setActiveIndex(undefined)}
        margin={{ left: 24, right: 4, top: 2, bottom: 0 }}
      >
        <Bar dataKey="value" fill="var(--color-value)" radius={2}>
          {data.map((_, i) => (
            <Cell
              key={i}
              className="duration-200"
              opacity={i === highlighted.index ? 1 : 0.2}
              onMouseEnter={() => setActiveIndex(i)}
            />
          ))}
        </Bar>
        <ReferenceLine
          opacity={0.4}
          y={springy}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </BarChart>
    </ChartContainer>
  );
}

/** Line sparkline — permanent SVG glow filter */
function LineSparkline({
  data,
  color,
  glowId,
  height,
}: {
  data: ChartDataPoint[];
  color: string;
  glowId: string;
  height: number;
}) {
  const config: ChartConfig = { value: { label: 'Value', color } };

  return (
    <ChartContainer className="w-full" style={{ height }} config={config}>
      <LineChart data={data} margin={{ left: 4, right: 4, top: 2, bottom: 0 }}>
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          dot={false}
          strokeWidth={2}
          filter={`url(#${glowId})`}
        />
        <defs>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </LineChart>
    </ChartContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Value renderer                                                     */
/* ------------------------------------------------------------------ */

function ValueDisplay({
  value,
  format = 'number',
  animate,
  className,
}: {
  value: number | string;
  format?: ValueFormat;
  animate?: boolean;
  className?: string;
}) {
  if (typeof value === 'string') {
    return <span className={className}>{value}</span>;
  }

  if (animate) {
    return (
      <span className={className}>
        <CountUp
          end={value}
          duration={1.5}
          separator=","
          prefix={format === 'currency' ? '£' : ''}
          suffix={format === 'percentage' ? '%' : ''}
          decimals={format === 'percentage' ? 1 : 0}
        />
      </span>
    );
  }

  return <span className={className}>{formatValue(value, format)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Trend badge                                                        */
/* ------------------------------------------------------------------ */

function TrendBadge({
  trend,
  compact,
}: {
  trend: TrendIndicator;
  compact?: boolean;
}) {
  const positive = trend.isPositive;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-0.5 text-[11px] font-semibold py-[3px] px-2 rounded-2xl',
          positive
            ? 'text-[#61bc8e] bg-[rgba(97,188,142,0.1)]'
            : 'text-destructive bg-destructive/10',
        )}
      >
        <span className="text-xs">{positive ? '↗' : '↘'}</span>
        <span className="text-[10px]">
          {positive ? '+' : ''}
          {Math.abs(trend.value).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-semibold',
        positive ? 'text-[#61bc8e]' : 'text-destructive',
      )}
    >
      <span className="text-base">{positive ? '↑' : '↓'}</span>
      <span>{Math.abs(trend.value).toFixed(0)}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard                                                         */
/* ------------------------------------------------------------------ */

export function MetricCard({
  title,
  value,
  subtitle,
  format = 'number',
  trend,
  variant = 'glass',
  accentColor = 'var(--color-chart-1)',
  sparkline,
  size = 'md',
  animate = false,
  loading = false,
  sparklineEmptyMessage = 'No trend data available',
  icon,
  onClick,
  className,
}: MetricCardProps) {
  const uid = useId();
  const gradientId = `spark-grad-${uid.replace(/:/g, '')}`;
  const glowId = `spark-glow-${uid.replace(/:/g, '')}`;

  /* ---- Small / compact layout ---- */
  if (size === 'sm') {
    if (loading) {
      return (
        <Card
          className={cn(
            'flex items-center gap-3 py-3.5 px-4 min-h-[68px] overflow-hidden',
            variantWidthClasses[variant],
            className,
          )}
          style={accentStyle(variant, accentColor)}
        >
          {icon && <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-12 rounded-2xl" />
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          'flex items-center gap-3 py-3.5 px-4 min-h-[68px] cursor-pointer overflow-hidden',
          'transition-colors hover:border-primary/30',
          variantWidthClasses[variant],
          className,
        )}
        style={accentStyle(variant, accentColor)}
        onClick={onClick}
      >
        {icon && (
          <div
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-white text-lg"
            style={{ backgroundColor: accentColor }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <ValueDisplay
            value={value}
            format={format}
            animate={animate}
            className="text-xl font-bold text-foreground leading-none block mb-0.5"
          />
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide truncate">
            {title}
          </div>
        </div>
        {trend && <TrendBadge trend={trend} compact />}
      </Card>
    );
  }

  /* ---- Medium and large layout ---- */
  const isLarge = size === 'lg';
  const sparkHeight = isLarge ? 70 : 50;

  if (loading) {
    return (
      <Card
        className={cn(
          'flex flex-col overflow-hidden w-full',
          isLarge ? 'min-h-[220px] p-5 gap-2 h-full' : 'min-h-[160px] p-4 gap-2 h-full',
          variantWidthClasses[variant],
          className,
        )}
        style={accentStyle(variant, accentColor)}
      >
        <div className="flex items-start justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className={cn(isLarge ? 'h-10 w-36' : 'h-8 w-24')} />
        <Skeleton className="h-3 w-32" />
        <Skeleton className={cn('mt-auto w-full', isLarge ? 'h-[78px]' : 'h-[58px]')} />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col cursor-pointer overflow-hidden w-full',
        'transition-colors hover:border-primary/30',
        isLarge ? 'min-h-[220px] p-5 gap-1 h-full' : 'min-h-[160px] p-4 gap-1 h-full',
        variantWidthClasses[variant],
        className,
      )}
      style={accentStyle(variant, accentColor)}
      onClick={onClick}
    >
      {/* Header: title + trend */}
      <div className="flex items-start justify-between">
        <h3
          className={cn(
            'font-medium text-muted-foreground uppercase tracking-wide m-0',
            isLarge ? 'text-[13px]' : 'text-[11px]',
          )}
        >
          {title}
        </h3>
        {trend && <TrendBadge trend={trend} />}
      </div>

      {/* Value */}
      <ValueDisplay
        value={value}
        format={format}
        animate={animate}
        className={cn(
          'font-bold text-foreground leading-none tracking-tight block',
          isLarge ? 'text-[2rem] mt-2 mb-1' : 'text-xl mt-1 mb-0.5',
        )}
      />

      {/* Subtitle */}
      {subtitle && (
        <div className={cn('text-muted-foreground', isLarge ? 'text-xs' : 'text-[10px]')}>
          {subtitle}
        </div>
      )}

      {/* Interactive sparkline */}
      {sparkline && (
        <div className="mt-auto -mx-1">
          {sparkline.data.length > 0 ? (
            <>
              {(sparkline.type ?? 'area') === 'area' && (
                <AreaSparkline
                  data={sparkline.data}
                  color={accentColor}
                  gradientId={gradientId}
                  height={sparkHeight}
                />
              )}
              {sparkline.type === 'bar' && (
                <BarSparkline
                  data={sparkline.data}
                  color={accentColor}
                  height={sparkHeight}
                />
              )}
              {sparkline.type === 'line' && (
                <LineSparkline
                  data={sparkline.data}
                  color={accentColor}
                  glowId={glowId}
                  height={sparkHeight}
                />
              )}
              <div className="flex justify-between text-[10px] text-muted-foreground/80 px-2 mt-0.5">
                <span>{sparkline.data[0]?.name}</span>
                <span>{sparkline.data[sparkline.data.length - 1]?.name}</span>
              </div>
            </>
          ) : (
            <div className="mx-1 mt-2 flex h-[52px] items-center justify-center rounded-md border border-dashed border-border/70 px-3 text-[10px] text-muted-foreground">
              {sparklineEmptyMessage}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  CompactCard — convenience alias                                    */
/* ------------------------------------------------------------------ */

export type CompactCardProps = Omit<MetricCardProps, 'size'>;

export function CompactCard(props: CompactCardProps) {
  return <MetricCard {...props} size="sm" />;
}
