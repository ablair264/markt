// markt-core component barrel export
// Chart cards, MetricCard, and DataTableCard will be added as they're built.

export { formatEventTime } from '../lib/format';
export type { FormatEventTimeOptions } from '../lib/format';
export { AreaChartCard, AREA_CHART_CARD_MIN_HEIGHT } from './cards/area-chart-card';
export type { AreaChartCardProps } from './cards/area-chart-card';
export { mapRowsToChartData } from './cards/data-contracts';
export type { ChartDataPoint } from './cards/data-contracts';

export { BarChartCard, BAR_CHART_CARD_MIN_HEIGHT } from './cards/bar-chart-card';
export type { BarChartCardProps } from './cards/bar-chart-card';

export { RadialChartCard, RADIAL_CHART_CARD_MIN_HEIGHT } from './cards/radial-chart-card';
export type { RadialChartCardProps } from './cards/radial-chart-card';

export { LineChartCard, LINE_CHART_CARD_MIN_HEIGHT } from './cards/line-chart-card';
export type { LineChartCardProps } from './cards/line-chart-card';

export { DottedMultiLineChartCard } from './cards/dotted-multi-line-chart-card';
export type {
  DottedMultiLineChartCardProps,
  DottedMultiLinePoint,
} from './cards/dotted-multi-line-chart-card';

export {
  MetricCard,
  CompactCard,
  METRIC_CARD_MIN_HEIGHT,
} from './cards/metric-card';
export type {
  MetricCardProps,
  CompactCardProps,
  TrendIndicator,
  CardVariant,
} from './cards/metric-card';

export { RoundedPieChartCard } from './cards/rounded-pie-chart-card';
export type {
  RoundedPieChartCardProps,
  RoundedPieChartPoint,
} from './cards/rounded-pie-chart-card';

export {
  LiveActivityCompactCard,
  NextEventCompactCard,
  WhosOnlineCompactCard,
  SparkStatsCompactCard,
  COMPACT_CARD_MIN_HEIGHT,
} from './cards/compact-sm-variants';
export { fromSlackUsers } from './cards/compact-sm-variants';
export type {
  LiveActivityCompactCardProps,
  NextEventCompactCardProps,
  WhosOnlineCompactCardProps,
  SparkStatsCompactCardProps,
  CompactSparklinePoint,
  Avatar02User,
  SlackUserLike,
  FromSlackUsersOptions,
} from './cards/compact-sm-variants';

export { SplitfinTableCard, SPLITFIN_TABLE_CARD_MIN_HEIGHT } from './cards/splitfin-table-card';
export type {
  SplitfinTableCardProps,
  SplitfinTableRow,
  SplitfinAgentProfileMap,
} from './cards/splitfin-table-card';

export { CustomizableDashboard } from './dashboard/customizable-dashboard';
export type {
  CustomizableDashboardProps,
  DashboardWidget,
  DashboardWidgetSize,
} from './dashboard/customizable-dashboard';

export { MasterLayoutTemplate } from './layout/template';
export type { MasterLayoutTemplateProps } from './layout/template';
