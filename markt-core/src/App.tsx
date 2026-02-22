import { useEffect, useMemo, useState } from 'react'
import {
  AreaChartCard,
  AREA_CHART_CARD_MIN_HEIGHT,
  BarChartCard,
  BAR_CHART_CARD_MIN_HEIGHT,
  RadialChartCard,
  RADIAL_CHART_CARD_MIN_HEIGHT,
  RoundedPieChartCard,
  DottedMultiLineChartCard,
  MetricCard,
  METRIC_CARD_MIN_HEIGHT,
  LiveActivityCompactCard,
  NextEventCompactCard,
  WhosOnlineCompactCard,
  SparkStatsCompactCard,
  COMPACT_CARD_MIN_HEIGHT,
  SplitfinTableCard,
  SPLITFIN_TABLE_CARD_MIN_HEIGHT,
  CustomizableDashboard,
  MasterLayoutTemplate,
  type DashboardWidget,
} from '@/components'
import { LoginPageTemplate } from '@/components/templates/login-page'
import {
  ComponentTheatre,
  type ComponentDoc,
  type ComponentCategoryDoc,
} from '@/components/showcase/component-theatre'
import {
  generateRevenueData,
  generateOrderData,
  generateCategoryData,
  generateSparklineData,
  generateLatestOrdersData,
  generateNewEnquiriesData,
} from '@/lib/demo-data'

// ComponentPropDoc, ComponentExampleDoc, ComponentDoc, ComponentCategoryDoc
// are now imported from '@/components/showcase/component-theatre'

const revenueData = generateRevenueData()
const orderData = generateOrderData()
const categoryData = generateCategoryData()
const revenueTotal = revenueData.reduce((sum, point) => sum + point.value, 0)
const orderTotal = orderData.reduce((sum, point) => sum + point.value, 0)
const categoryTotal = categoryData.reduce((sum, point) => sum + point.value, 0)

const sparkLine = generateSparklineData(16)
const sparkBar = generateSparklineData(16)
const sparkArea = generateSparklineData(16)

const latestOrdersTable = generateLatestOrdersData(8)
const newEnquiriesTable = generateNewEnquiriesData(8)

const meetingUsers = [
  { name: 'Alex Lin', role: 'Accounts', image: 'https://images.shadcnspace.com/assets/profiles/user-1.jpg' },
  { name: 'Dina Tran', role: 'Product', image: 'https://images.shadcnspace.com/assets/profiles/user-2.jpg' },
  { name: 'Noah Patel', role: 'Design', image: 'https://images.shadcnspace.com/assets/profiles/user-3.jpg' },
  { name: 'Mia Ross', role: 'Operations' },
]

const onlineUsers = [
  { name: 'Iris Cole', role: 'Support', image: 'https://images.shadcnspace.com/assets/profiles/user-4.jpg' },
  { name: 'Sam Park', role: 'Sales', image: 'https://images.shadcnspace.com/assets/profiles/user-5.jpg' },
  { name: 'Leah Wood', role: 'Engineering', image: 'https://images.shadcnspace.com/assets/profiles/user-6.jpg' },
  { name: 'Ryan Diaz', role: 'Customer Success', image: 'https://images.shadcnspace.com/assets/profiles/user-2.jpg' },
  { name: 'Owen Hart', role: 'Finance' },
  { name: 'Nina Patel', role: 'Marketing', image: 'https://images.shadcnspace.com/assets/profiles/user-1.jpg' },
]

const liveUpdates = [
  'Pipeline synced 18 new orders',
  'Agent queue dropped below 2m',
  'Inventory alert resolved for 2 SKUs',
  'Checkout errors down 14% this hour',
]

const hourlySalesData = [
  { name: '08:00', value: 420 },
  { name: '09:00', value: 610 },
  { name: '10:00', value: 720 },
  { name: '11:00', value: 840 },
  { name: '12:00', value: 910 },
  { name: '13:00', value: 980 },
  { name: '14:00', value: 890 },
  { name: '15:00', value: 1040 },
  { name: '16:00', value: 1160 },
  { name: '17:00', value: 1280 },
]

const dottedMultiLineData = [
  { name: 'Mon', primary: 120, secondary: 96 },
  { name: 'Tue', primary: 132, secondary: 108 },
  { name: 'Wed', primary: 128, secondary: 112 },
  { name: 'Thu', primary: 146, secondary: 118 },
  { name: 'Fri', primary: 158, secondary: 126 },
  { name: 'Sat', primary: 152, secondary: 121 },
  { name: 'Sun', primary: 164, secondary: 133 },
]

const mockUser = {
  name: 'Jordan Blake',
  role: 'Revenue Ops Manager',
}

const PAGE_TITLES: Record<string, string> = {
  '/getting-started': 'Getting Started',
  '/documentation': 'Documentation',
  '/dashboard': 'DND Dashboard',
  '/dashboard/components/compact-cards': 'Compact Cards',
  '/dashboard/components/data-cards': 'Data Cards',
  '/dashboard/components/metric-cards': 'Metric Cards',
  '/dashboard/components/chart-cards': 'Chart Cards',
  '/dashboard/components/data-metric-cards': 'Metric Cards',
  '/dashboard/components/whos-online': 'Compact Cards',
  '/dashboard/components/next-event': 'Compact Cards',
  '/dashboard/components/live-activity': 'Compact Cards',
  '/dashboard/components/sales-today': 'Compact Cards',
  '/dashboard/components/splitfin-table': 'Data Cards',
  '/dashboard/components/metric-orders': 'Metric Cards',
  '/dashboard/components/metric-revenue': 'Metric Cards',
  '/dashboard/components/large-metrics': 'Metric Cards',
  '/dashboard/components/radial-chart': 'Chart Cards',
  '/dashboard/components/bar-chart': 'Chart Cards',
  '/dashboard/components/dotted-multi-line': 'Chart Cards',
  '/dashboard/components/rounded-pie': 'Chart Cards',
  '/dashboard/components/area-chart': 'Chart Cards',
  '/templates/login': 'Login Page',
}

const COMPACT_CARD_COMPONENT_PATHS = [
  '/dashboard/components/whos-online',
  '/dashboard/components/next-event',
  '/dashboard/components/live-activity',
  '/dashboard/components/sales-today',
]

const DATA_CARD_COMPONENT_PATHS = [
  '/dashboard/components/splitfin-table',
]

const METRIC_CARD_COMPONENT_PATHS = [
  '/dashboard/components/metric-orders',
  '/dashboard/components/metric-revenue',
  '/dashboard/components/large-metrics',
]

const CHART_COMPONENT_PATHS = [
  '/dashboard/components/radial-chart',
  '/dashboard/components/bar-chart',
  '/dashboard/components/area-chart',
  '/dashboard/components/rounded-pie',
  '/dashboard/components/dotted-multi-line',
]

const COMPONENT_CATEGORIES: Record<string, ComponentCategoryDoc> = {
  '/dashboard/components/compact-cards': {
    title: 'Compact Cards',
    description:
      'Small-footprint cards designed for the first row of a dashboard. These focus on glanceable status and trend context.',
    basics:
      'Use compact cards for fast, high-frequency information. Keep copy short, prefer one core metric per card, and update data live where relevant.',
    componentPaths: COMPACT_CARD_COMPONENT_PATHS,
  },
  '/dashboard/components/data-cards': {
    title: 'Data Cards',
    description:
      'Data-oriented cards focused on tabular records, row-level inspection, and switching between operational datasets.',
    basics:
      'Use data cards when users need to scan records quickly, compare row attributes, and drill into recent activity.',
    componentPaths: DATA_CARD_COMPONENT_PATHS,
  },
  '/dashboard/components/metric-cards': {
    title: 'Metric Cards',
    description:
      'KPI-focused cards that prioritize numeric summaries, trends, and compact visual context for business health.',
    basics:
      'Use metric cards when you need key performance signals at a glance and want trend context without full chart complexity.',
    componentPaths: METRIC_CARD_COMPONENT_PATHS,
  },
  '/dashboard/components/chart-cards': {
    title: 'Chart Cards',
    description:
      'Visualization-focused cards for distribution, trend, and comparative analysis across key business metrics.',
    basics:
      'Use chart cards where shape and movement of data are more important than raw tabular detail. Keep data ordered and labels consistent.',
    componentPaths: CHART_COMPONENT_PATHS,
  },
}

const LEGACY_COMPONENT_ROUTE_TO_CATEGORY: Record<string, string> = {
  '/dashboard/components/whos-online': '/dashboard/components/compact-cards',
  '/dashboard/components/next-event': '/dashboard/components/compact-cards',
  '/dashboard/components/live-activity': '/dashboard/components/compact-cards',
  '/dashboard/components/sales-today': '/dashboard/components/compact-cards',
  '/dashboard/components/data-metric-cards': '/dashboard/components/metric-cards',
  '/dashboard/components/splitfin-table': '/dashboard/components/data-cards',
  '/dashboard/components/metric-orders': '/dashboard/components/metric-cards',
  '/dashboard/components/metric-revenue': '/dashboard/components/metric-cards',
  '/dashboard/components/large-metrics': '/dashboard/components/metric-cards',
  '/dashboard/components/radial-chart': '/dashboard/components/chart-cards',
  '/dashboard/components/bar-chart': '/dashboard/components/chart-cards',
  '/dashboard/components/area-chart': '/dashboard/components/chart-cards',
  '/dashboard/components/rounded-pie': '/dashboard/components/chart-cards',
  '/dashboard/components/dotted-multi-line': '/dashboard/components/chart-cards',
}

// ComponentCategoryPage replaced by ComponentTheatre (imported above)

function PlaceholderDocPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="w-full space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Planned Content</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Overview and setup guidance</li>
          <li>Data provider wiring patterns</li>
          <li>Reusable implementation examples</li>
        </ul>
      </section>
    </section>
  )
}

function App() {
  const [liveIndex, setLiveIndex] = useState(0)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', shouldUseDark)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndex((prev) => (prev + 1) % liveUpdates.length)
    }, 4200)

    return () => clearInterval(interval)
  }, [])

  const salesTodayTotal = useMemo(
    () => hourlySalesData.reduce((sum, point) => sum + point.value, 0),
    [],
  )

  const dashboardWidgets = useMemo<DashboardWidget[]>(
    () => [
      {
        id: 'who-online',
        size: 'sm',
        minHeight: COMPACT_CARD_MIN_HEIGHT,
        render: () => (
          <WhosOnlineCompactCard
            title="Who's Online"
            users={onlineUsers}
            countLabel="Sales + Ops channels active"
            accentColor="var(--color-chart-3)"
          />
        ),
      },
      {
        id: 'next-event',
        size: 'sm',
        minHeight: COMPACT_CARD_MIN_HEIGHT,
        render: () => (
          <NextEventCompactCard
            title="Next Event"
            eventName="Design System Review"
            eventTime="Thu 13:00 - 13:45"
            attendees={meetingUsers}
            accentColor="var(--color-chart-2)"
          />
        ),
      },
      {
        id: 'live-activity',
        size: 'sm',
        minHeight: COMPACT_CARD_MIN_HEIGHT,
        render: () => (
          <LiveActivityCompactCard
            title="Live Activity"
            latestUpdate={liveUpdates[liveIndex]!}
            updateKey={liveIndex}
            activeLabel="Realtime"
            accentColor="var(--color-chart-1)"
            footerHint="Streaming updates in realtime"
          />
        ),
      },
      {
        id: 'sales-today',
        size: 'sm',
        minHeight: COMPACT_CARD_MIN_HEIGHT,
        render: () => (
          <SparkStatsCompactCard
            title="Sales Today"
            value={salesTodayTotal}
            format="currency"
            statLabel="Hourly line trend"
            data={hourlySalesData}
            chartType="line"
            accentColor="var(--color-chart-4)"
          />
        ),
      },
      {
        id: 'orders-table',
        size: 'two',
        minHeight: SPLITFIN_TABLE_CARD_MIN_HEIGHT,
        render: () => (
          <SplitfinTableCard
            latestOrders={latestOrdersTable}
            newEnquiries={newEnquiriesTable}
            defaultView="latest-orders"
            columnWidths={{ customer: 210, agent: 140, value: 110 }}
          />
        ),
      },
      {
        id: 'stock-radial',
        size: 'sm',
        minHeight: RADIAL_CHART_CARD_MIN_HEIGHT,
        render: () => (
          <RadialChartCard
            title="Stock Total"
            total={categoryTotal}
            totalSuffix="units"
            totalFormat="number"
            data={categoryData}
          />
        ),
      },
      {
        id: 'orders-bar-chart',
        size: 'sm',
        minHeight: BAR_CHART_CARD_MIN_HEIGHT,
        render: () => (
          <BarChartCard
            title="Orders"
            total={orderTotal}
            totalFormat="number"
            subtitle="Hourly distribution"
            data={orderData}
          />
        ),
      },
      {
        id: 'metric-orders',
        size: 'two',
        minHeight: METRIC_CARD_MIN_HEIGHT.md,
        render: () => (
          <MetricCard
            title="Orders"
            value={orderTotal}
            format="number"
            subtitle="24h trend"
            trend={{ value: 4.3, isPositive: true }}
            variant="accent-top"
            accentColor="var(--color-chart-2)"
            sparkline={{ data: sparkLine, type: 'line' }}
          />
        ),
      },
      {
        id: 'metric-revenue',
        size: 'two',
        minHeight: METRIC_CARD_MIN_HEIGHT.md,
        render: () => (
          <MetricCard
            title="Total Revenue"
            value={revenueTotal}
            format="currency"
            subtitle="vs prior week"
            trend={{ value: 8.7, isPositive: true }}
            variant="accent-left"
            accentColor="var(--color-chart-1)"
            sparkline={{ data: sparkBar, type: 'bar' }}
          />
        ),
      },
      {
        id: 'dotted-multi-line',
        size: 'sm',
        minHeight: 228,
        render: () => (
          <DottedMultiLineChartCard
            title="Pipeline Delta"
            total={164}
            totalFormat="number"
            data={dottedMultiLineData}
            primaryLabel="Current"
            secondaryLabel="Previous"
          />
        ),
      },
      {
        id: 'rounded-pie',
        size: 'sm',
        minHeight: 228,
        render: () => (
          <RoundedPieChartCard
            title="Category Mix"
            total={categoryTotal}
            totalSuffix="units"
            totalFormat="number"
            data={categoryData}
          />
        ),
      },
      {
        id: 'area-chart',
        size: 'sm',
        minHeight: AREA_CHART_CARD_MIN_HEIGHT,
        render: () => (
          <AreaChartCard
            title="Revenue"
            total={revenueTotal}
            totalFormat="currency"
            subtitle="Rolling 30 days"
            data={revenueData}
          />
        ),
      },
      {
        id: 'bar-chart',
        size: 'sm',
        minHeight: BAR_CHART_CARD_MIN_HEIGHT,
        render: () => (
          <BarChartCard
            title="Order Volume"
            total={orderTotal}
            totalFormat="number"
            subtitle="Rolling 14 days"
            data={orderData}
          />
        ),
      },
      {
        id: 'large-revenue',
        size: 'md',
        minHeight: METRIC_CARD_MIN_HEIGHT.lg,
        render: () => (
          <MetricCard
            size="lg"
            title="Annual Revenue"
            value={1842650}
            format="currency"
            subtitle="FY running total"
            trend={{ value: 18.3, isPositive: true }}
            variant="accent-left"
            accentColor="var(--color-chart-1)"
            sparkline={{ data: revenueData, type: 'area' }}
            animate
          />
        ),
      },
      {
        id: 'large-ltv',
        size: 'md',
        minHeight: METRIC_CARD_MIN_HEIGHT.lg,
        render: () => (
          <MetricCard
            size="lg"
            title="Customer LTV"
            value={6290}
            format="currency"
            subtitle="Trailing 12 months"
            trend={{ value: 6.1, isPositive: true }}
            variant="accent-right"
            accentColor="var(--color-chart-3)"
            sparkline={{ data: sparkArea, type: 'line' }}
          />
        ),
      },
      {
        id: 'large-conversion',
        size: 'md',
        minHeight: METRIC_CARD_MIN_HEIGHT.lg,
        render: () => (
          <MetricCard
            size="lg"
            title="Conversion"
            value={4.9}
            format="percentage"
            subtitle="Checkout funnel"
            trend={{ value: 1.4, isPositive: true }}
            variant="accent-bottom"
            accentColor="var(--color-chart-4)"
            sparkline={{ data: sparkLine, type: 'area' }}
          />
        ),
      },
    ],
    [liveIndex, salesTodayTotal],
  )

  const getComponentDoc = (path: string): ComponentDoc | null => {
    if (path === '/dashboard/components/whos-online') {
      return {
        title: "Who's Online Example",
        description: 'Avatar stack card for showing currently active users in workspace or channel context.',
        usability: 'Use in team dashboards, incident channels, or support operations where immediate user availability matters.',
        implementation: 'Map your online users into the `users` prop and pass a short contextual `countLabel`.',
        props: [
          { name: 'title', type: 'string', description: 'Card header label.' },
          { name: 'users', type: 'Avatar02User[]', required: true, description: 'Online users list.' },
          { name: 'countLabel', type: 'string', description: 'Optional status text under avatars.' },
          { name: 'accentColor', type: 'string', description: 'Left accent color token.' },
        ],
        examples: [
          {
            title: 'Workspace Presence Example',
            description: 'Shows active sales and ops users for the current hour.',
            preview: (
              <div className="max-w-md">
                <WhosOnlineCompactCard
                  title="Who's Online"
                  users={onlineUsers}
                  countLabel="Sales + Ops channels active"
                  accentColor="var(--color-chart-3)"
                />
              </div>
            ),
            code: `
<WhosOnlineCompactCard
  title="Who's Online"
  users={onlineUsers}
  countLabel="Sales + Ops channels active"
  accentColor="var(--color-chart-3)"
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/next-event') {
      return {
        title: 'Next Event Example',
        description: 'Compact meeting/event card for upcoming calendar context and attendee visibility.',
        usability: 'Use in personal dashboards, team command centers, and calendar side panels.',
        implementation: 'Bind event source values to `eventName`, `eventTime`, `attendees`, and optional location/status flags.',
        props: [
          { name: 'eventName', type: 'string', required: true, description: 'Upcoming event title.' },
          { name: 'eventTime', type: 'string', required: true, description: 'Preformatted time range.' },
          { name: 'attendees', type: 'Avatar02User[]', description: 'Participant avatars.' },
          { name: 'status', type: 'string', description: 'Badge status text when not online meeting.' },
          { name: 'isOnlineMeeting', type: 'boolean', description: 'Switches badge to Online.' },
        ],
        examples: [
          {
            title: 'Calendar Event Example',
            description: 'Displays the next design review meeting with attendees.',
            preview: (
              <div className="max-w-md">
                <NextEventCompactCard
                  title="Next Event"
                  eventName="Design System Review"
                  eventTime="Thu 13:00 - 13:45"
                  attendees={meetingUsers}
                  accentColor="var(--color-chart-2)"
                />
              </div>
            ),
            code: `
<NextEventCompactCard
  title="Next Event"
  eventName="Design System Review"
  eventTime="Thu 13:00 - 13:45"
  attendees={meetingUsers}
  accentColor="var(--color-chart-2)"
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/live-activity') {
      return {
        title: 'Live Activity Example',
        description: 'Realtime activity banner card designed for subscription-driven updates.',
        usability: 'Use for operational feeds, webhook updates, queue events, and ingest monitoring.',
        implementation: 'Pass the latest message to `latestUpdate`, update `updateKey` per event, and set `isLive` when feed is active.',
        props: [
          { name: 'latestUpdate', type: 'string', required: true, description: 'Latest activity message.' },
          { name: 'updateKey', type: 'string | number', description: 'Animation key for message transition.' },
          { name: 'activeLabel', type: 'string', description: 'Live badge label.' },
          { name: 'isLive', type: 'boolean', description: 'Live/Offline indicator toggle.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state before first payload.' },
        ],
        examples: [
          {
            title: 'Realtime Feed Example',
            description: 'Cycles through simulated live updates.',
            preview: (
              <div className="max-w-md">
                <LiveActivityCompactCard
                  title="Live Activity"
                  latestUpdate={liveUpdates[liveIndex]!}
                  updateKey={liveIndex}
                  activeLabel="Realtime"
                  accentColor="var(--color-chart-1)"
                  footerHint="Streaming updates in realtime"
                />
              </div>
            ),
            code: `
<LiveActivityCompactCard
  title="Live Activity"
  latestUpdate={liveUpdates[liveIndex]!}
  updateKey={liveIndex}
  activeLabel="Realtime"
  accentColor="var(--color-chart-1)"
  footerHint="Streaming updates in realtime"
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/sales-today') {
      return {
        title: 'Sales Today Example',
        description: 'Compact KPI card with embedded sparkline for intraday sales movement.',
        usability: 'Use in top-row KPI strips where trend shape matters more than full chart controls.',
        implementation: 'Provide hourly points via `data`, set `chartType="line"`, and format value with `currency`.',
        props: [
          { name: 'value', type: 'number | string', required: true, description: 'Primary KPI value.' },
          { name: 'data', type: 'CompactSparklinePoint[]', description: 'Sparkline data points.' },
          { name: 'chartType', type: `'area' | 'line'`, description: 'Sparkline rendering mode.' },
          { name: 'format', type: 'ValueFormat', description: 'Display formatter for value.' },
          { name: 'statLabel', type: 'string', description: 'Trend context label.' },
        ],
        examples: [
          {
            title: 'Hourly Sales Line Example',
            description: 'Renders hourly sales as line sparkline in compact card form.',
            preview: (
              <div className="max-w-md">
                <SparkStatsCompactCard
                  title="Sales Today"
                  value={salesTodayTotal}
                  format="currency"
                  statLabel="Hourly line trend"
                  data={hourlySalesData}
                  chartType="line"
                  accentColor="var(--color-chart-4)"
                />
              </div>
            ),
            code: `
<SparkStatsCompactCard
  title="Sales Today"
  value={salesTodayTotal}
  format="currency"
  statLabel="Hourly line trend"
  data={hourlySalesData}
  chartType="line"
  accentColor="var(--color-chart-4)"
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/splitfin-table') {
      return {
        title: 'Data Table Card Example',
        description: 'Data table card with switchable views, typed columns, and optional row interactions.',
        usability: 'Use for latest orders, enquiries, tickets, and any small-to-medium dashboard table slices.',
        implementation: 'Map backend rows into `views` or pass `latestOrders/newEnquiries` for defaults; inject `agentProfiles` when needed.',
        props: [
          { name: 'views', type: 'SplitfinTableView[]', description: 'Fully custom table views.' },
          { name: 'latestOrders', type: 'SplitfinTableRow[]', description: 'Default orders data source.' },
          { name: 'newEnquiries', type: 'SplitfinTableRow[]', description: 'Default enquiries data source.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state for async fetch.' },
          { name: 'agentProfiles', type: 'Record<string, Avatar02User>', description: 'Custom avatar/profile mapping.' },
        ],
        examples: [
          {
            title: 'Data Table Card Example',
            description: 'Switches between latest orders and new enquiries.',
            preview: (
              <SplitfinTableCard
                latestOrders={latestOrdersTable}
                newEnquiries={newEnquiriesTable}
                defaultView="latest-orders"
                columnWidths={{ customer: 210, agent: 140, value: 110 }}
              />
            ),
            code: `
<SplitfinTableCard
  latestOrders={latestOrdersTable}
  newEnquiries={newEnquiriesTable}
  defaultView="latest-orders"
  columnWidths={{ customer: 210, agent: 140, value: 110 }}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/radial-chart') {
      return {
        title: 'Radial Chart Example',
        description: 'Radial bar composition card for distribution, composition, and category comparisons.',
        usability: 'Use for inventory mix, channel share, or grouped KPI composition in compact spaces.',
        implementation: 'Pass `{ name, value }` category points and optional color list for deterministic segment coloring.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Card title.' },
          { name: 'total', type: 'number | string', required: true, description: 'Primary total metric.' },
          { name: 'data', type: 'ChartDataPoint[]', required: true, description: 'Radial segment values.' },
          { name: 'showLegend', type: 'boolean', description: 'Show/hide list legend.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state.' },
        ],
        examples: [
          {
            title: 'Category Distribution Example',
            description: 'Shows inventory category totals as radial bars.',
            preview: (
              <div className="max-w-sm">
                <RadialChartCard
                  title="Stock Total"
                  total={categoryTotal}
                  totalSuffix="units"
                  totalFormat="number"
                  data={categoryData}
                />
              </div>
            ),
            code: `
<RadialChartCard
  title="Stock Total"
  total={categoryTotal}
  totalSuffix="units"
  totalFormat="number"
  data={categoryData}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/bar-chart') {
      return {
        title: 'Bar Chart Example',
        description: 'Interactive bar chart card with highlighted value and optional hover strategy.',
        usability: 'Use for period-over-period volume comparisons where discrete bars are preferred.',
        implementation: 'Feed ordered periods in `data`, use `highlightStrategy` to control default focus behavior.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Card title.' },
          { name: 'total', type: 'number | string', required: true, description: 'Aggregate metric.' },
          { name: 'data', type: 'ChartDataPoint[]', required: true, description: 'Bar points.' },
          { name: 'highlightStrategy', type: `'max' | 'last' | 'hover'`, description: 'Default highlighted bar behavior.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state.' },
        ],
        examples: [
          {
            title: 'Orders Volume Example',
            description: 'Shows rolling 14-day order volume with interactive highlight.',
            preview: (
              <div className="max-w-sm">
                <BarChartCard
                  title="Orders"
                  total={orderTotal}
                  totalFormat="number"
                  subtitle="Rolling 14 days"
                  data={orderData}
                />
              </div>
            ),
            code: `
<BarChartCard
  title="Orders"
  total={orderTotal}
  totalFormat="number"
  subtitle="Rolling 14 days"
  data={orderData}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/metric-orders') {
      return {
        title: 'Metric Orders Example',
        description: 'Medium metric card with trend badge and inline sparkline for order momentum.',
        usability: 'Use in KPI rows where one-liner context and trend direction are required.',
        implementation: 'Pass `trend` and `sparkline` for directional context; choose variant for accent placement.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'KPI label.' },
          { name: 'value', type: 'number | string', required: true, description: 'KPI value.' },
          { name: 'trend', type: 'TrendIndicator', description: 'Positive/negative change badge.' },
          { name: 'sparkline', type: `{ data: ChartDataPoint[]; type?: 'line' | 'bar' | 'area' }`, description: 'Trend mini-chart.' },
          { name: 'variant', type: 'CardVariant', description: 'Border accent style.' },
        ],
        examples: [
          {
            title: 'Orders KPI Example',
            description: 'Medium card with line sparkline and positive trend.',
            preview: (
              <div className="max-w-md">
                <MetricCard
                  title="Orders"
                  value={orderTotal}
                  format="number"
                  subtitle="24h trend"
                  trend={{ value: 4.3, isPositive: true }}
                  variant="accent-top"
                  accentColor="var(--color-chart-2)"
                  sparkline={{ data: sparkLine, type: 'line' }}
                />
              </div>
            ),
            code: `
<MetricCard
  title="Orders"
  value={orderTotal}
  format="number"
  subtitle="24h trend"
  trend={{ value: 4.3, isPositive: true }}
  variant="accent-top"
  accentColor="var(--color-chart-2)"
  sparkline={{ data: sparkLine, type: 'line' }}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/metric-revenue') {
      return {
        title: 'Metric Revenue Example',
        description: 'Revenue KPI card optimized for summary display plus compact trend context.',
        usability: 'Use in dashboards where revenue value and directional health must be visible at-a-glance.',
        implementation: 'Use `format="currency"`, attach trend + bar/area sparkline based on period granularity.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'KPI title.' },
          { name: 'value', type: 'number | string', required: true, description: 'Revenue value.' },
          { name: 'format', type: 'ValueFormat', description: 'Formatting strategy.' },
          { name: 'trend', type: 'TrendIndicator', description: 'Delta badge payload.' },
          { name: 'sparkline', type: `{ data: ChartDataPoint[]; type?: 'line' | 'bar' | 'area' }`, description: 'Revenue trend sparkline.' },
        ],
        examples: [
          {
            title: 'Revenue KPI Example',
            description: 'Medium card with bar sparkline and positive revenue trend.',
            preview: (
              <div className="max-w-md">
                <MetricCard
                  title="Total Revenue"
                  value={revenueTotal}
                  format="currency"
                  subtitle="vs prior week"
                  trend={{ value: 8.7, isPositive: true }}
                  variant="accent-left"
                  accentColor="var(--color-chart-1)"
                  sparkline={{ data: sparkBar, type: 'bar' }}
                />
              </div>
            ),
            code: `
<MetricCard
  title="Total Revenue"
  value={revenueTotal}
  format="currency"
  subtitle="vs prior week"
  trend={{ value: 8.7, isPositive: true }}
  variant="accent-left"
  accentColor="var(--color-chart-1)"
  sparkline={{ data: sparkBar, type: 'bar' }}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/dotted-multi-line') {
      return {
        title: 'Dotted Multi Line Example',
        description: 'Dual-line chart card for comparing primary vs secondary series in compact width.',
        usability: 'Use for current-vs-previous trends, planned-vs-actual, or controlled cohort comparisons.',
        implementation: 'Pass a point array with `primary` and `secondary` values and custom labels/colors as needed.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Card title.' },
          { name: 'total', type: 'number | string', required: true, description: 'Headline metric.' },
          { name: 'data', type: 'DottedMultiLinePoint[]', required: true, description: 'Dual-series chart data.' },
          { name: 'primaryLabel', type: 'string', description: 'Legend label for primary series.' },
          { name: 'secondaryLabel', type: 'string', description: 'Legend label for secondary series.' },
        ],
        examples: [
          {
            title: 'Current vs Previous Example',
            description: 'Compares current pipeline signal to previous baseline.',
            preview: (
              <div className="max-w-sm">
                <DottedMultiLineChartCard
                  title="Pipeline Delta"
                  total={164}
                  totalFormat="number"
                  data={dottedMultiLineData}
                  primaryLabel="Current"
                  secondaryLabel="Previous"
                />
              </div>
            ),
            code: `
<DottedMultiLineChartCard
  title="Pipeline Delta"
  total={164}
  totalFormat="number"
  data={dottedMultiLineData}
  primaryLabel="Current"
  secondaryLabel="Previous"
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/rounded-pie') {
      return {
        title: 'Rounded Pie Example',
        description: 'Rounded-corner pie chart card for category composition with optional legend.',
        usability: 'Use when category distribution matters and segment shape readability is important.',
        implementation: 'Send category points in `data` and configure radii when fitting tighter cards.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Card title.' },
          { name: 'total', type: 'number | string', required: true, description: 'Headline total.' },
          { name: 'data', type: 'RoundedPieChartPoint[]', required: true, description: 'Pie segment dataset.' },
          { name: 'showLegend', type: 'boolean', description: 'Toggles side legend list.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state.' },
        ],
        examples: [
          {
            title: 'Category Mix Example',
            description: 'Displays category share using rounded pie segments.',
            preview: (
              <div className="max-w-sm">
                <RoundedPieChartCard
                  title="Category Mix"
                  total={categoryTotal}
                  totalSuffix="units"
                  totalFormat="number"
                  data={categoryData}
                />
              </div>
            ),
            code: `
<RoundedPieChartCard
  title="Category Mix"
  total={categoryTotal}
  totalSuffix="units"
  totalFormat="number"
  data={categoryData}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/area-chart') {
      return {
        title: 'Area Chart Example',
        description: 'Area trend card with headline total and interactive hover cursor reveal.',
        usability: 'Use for cumulative/continuous metrics such as revenue, GMV, traffic, or active sessions.',
        implementation: 'Pass ordered period data in `{ name, value }`, set `total`, and optionally tune gradient opacity.',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Card title.' },
          { name: 'total', type: 'number | string', required: true, description: 'Headline metric.' },
          { name: 'data', type: 'ChartDataPoint[]', required: true, description: 'Area series data points.' },
          { name: 'subtitle', type: 'string', description: 'Secondary context line.' },
          { name: 'loading', type: 'boolean', description: 'Skeleton state.' },
        ],
        examples: [
          {
            title: 'Revenue Area Example',
            description: 'Renders rolling revenue trend with interactive indicator.',
            preview: (
              <div className="max-w-sm">
                <AreaChartCard
                  title="Revenue"
                  total={revenueTotal}
                  totalFormat="currency"
                  subtitle="Rolling 30 days"
                  data={revenueData}
                />
              </div>
            ),
            code: `
<AreaChartCard
  title="Revenue"
  total={revenueTotal}
  totalFormat="currency"
  subtitle="Rolling 30 days"
  data={revenueData}
/>`,
          },
        ],
      }
    }

    if (path === '/dashboard/components/large-metrics') {
      return {
        title: 'Large Metrics Example',
        description: 'Large-format KPI cards for executive summaries with richer trend context.',
        usability: 'Use at the bottom of dashboards for high-priority business outcomes and monthly/quarterly stats.',
        implementation: 'Set `size="lg"` and attach sparklines/trend badges for each top-level KPI card.',
        props: [
          { name: 'size', type: `'sm' | 'md' | 'lg'`, description: 'Card size variant.' },
          { name: 'title', type: 'string', required: true, description: 'Metric title.' },
          { name: 'value', type: 'number | string', required: true, description: 'Metric value.' },
          { name: 'trend', type: 'TrendIndicator', description: 'Directional delta badge.' },
          { name: 'sparkline', type: `{ data: ChartDataPoint[]; type?: 'line' | 'bar' | 'area' }`, description: 'Inline trend chart.' },
        ],
        examples: [
          {
            title: 'Annual Revenue Example',
            description: 'Large area-trend revenue KPI.',
            preview: (
              <MetricCard
                size="lg"
                title="Annual Revenue"
                value={1842650}
                format="currency"
                subtitle="FY running total"
                trend={{ value: 18.3, isPositive: true }}
                variant="accent-left"
                accentColor="var(--color-chart-1)"
                sparkline={{ data: revenueData, type: 'area' }}
                animate
              />
            ),
            code: `
<MetricCard
  size="lg"
  title="Annual Revenue"
  value={1842650}
  format="currency"
  subtitle="FY running total"
  trend={{ value: 18.3, isPositive: true }}
  variant="accent-left"
  accentColor="var(--color-chart-1)"
  sparkline={{ data: revenueData, type: 'area' }}
  animate
/>`,
          },
          {
            title: 'Customer LTV Example',
            description: 'Large line-trend customer value KPI.',
            preview: (
              <MetricCard
                size="lg"
                title="Customer LTV"
                value={6290}
                format="currency"
                subtitle="Trailing 12 months"
                trend={{ value: 6.1, isPositive: true }}
                variant="accent-right"
                accentColor="var(--color-chart-3)"
                sparkline={{ data: sparkArea, type: 'line' }}
              />
            ),
            code: `
<MetricCard
  size="lg"
  title="Customer LTV"
  value={6290}
  format="currency"
  subtitle="Trailing 12 months"
  trend={{ value: 6.1, isPositive: true }}
  variant="accent-right"
  accentColor="var(--color-chart-3)"
  sparkline={{ data: sparkArea, type: 'line' }}
/>`,
          },
          {
            title: 'Conversion Example',
            description: 'Large percentage KPI with area sparkline.',
            preview: (
              <MetricCard
                size="lg"
                title="Conversion"
                value={4.9}
                format="percentage"
                subtitle="Checkout funnel"
                trend={{ value: 1.4, isPositive: true }}
                variant="accent-bottom"
                accentColor="var(--color-chart-4)"
                sparkline={{ data: sparkLine, type: 'area' }}
              />
            ),
            code: `
<MetricCard
  size="lg"
  title="Conversion"
  value={4.9}
  format="percentage"
  subtitle="Checkout funnel"
  trend={{ value: 1.4, isPositive: true }}
  variant="accent-bottom"
  accentColor="var(--color-chart-4)"
  sparkline={{ data: sparkLine, type: 'area' }}
/>`,
          },
        ],
      }
    }

    return null
  }

  const renderRoute = (path: string) => {
    const resolvedPath = LEGACY_COMPONENT_ROUTE_TO_CATEGORY[path] ?? path

    if (resolvedPath === '/getting-started') {
      return (
        <PlaceholderDocPage
          title="Getting Started"
          description="Start here for product setup, dashboard layout fundamentals, and how to connect cards to your data providers."
        />
      )
    }

    if (resolvedPath === '/documentation') {
      return (
        <PlaceholderDocPage
          title="Documentation"
          description="Reference docs for components, props, implementation patterns, and production integration guidance."
        />
      )
    }

    if (resolvedPath === '/templates/login') {
      return (
        <section className="w-full space-y-8">
          <article className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border" style={{ height: 780 }}>
              <LoginPageTemplate
                onLogin={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1500))
                }}
                logo={
                  <span className="text-2xl font-bold tracking-tight text-white">
                    Your<span className="text-primary">Logo</span>
                  </span>
                }
                subtitle="Welcome back to your dashboard"
                helpText={
                  <span className="text-muted-foreground">
                    Demo mode — no real authentication
                  </span>
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">Interactive demo with a simulated 1.5s login delay. Try submitting with any credentials.</p>
          </article>

          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Login Page Template</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              A full-page dark glassmorphic login screen with animated gradient background, floating accents, and password visibility toggle. Wire up your auth provider via the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">onLogin</code> callback.
            </p>
          </header>

          <article className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Quick Start</h2>
            <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-foreground">
{`import { LoginPageTemplate } from '@markt/core'

function App() {
  return (
    <LoginPageTemplate
      onLogin={async ({ username, password }) => {
        // Wire to your auth provider
        await signIn(username, password)
      }}
      logo={<img src="/logo.svg" alt="Logo" className="h-10" />}
      subtitle="Welcome back"
      helpText={<a href="/forgot">Forgot password?</a>}
    />
  )
}`}
            </pre>
          </article>

          <article className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Props</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2.5 font-semibold text-foreground">Prop</th>
                    <th className="px-4 py-2.5 font-semibold text-foreground">Type</th>
                    <th className="px-4 py-2.5 font-semibold text-foreground">Default</th>
                    <th className="px-4 py-2.5 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">onLogin</td><td className="px-4 py-2 font-mono">{`(creds) => Promise<void>`}</td><td className="px-4 py-2">required</td><td className="px-4 py-2">Auth callback receiving username &amp; password</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">logo</td><td className="px-4 py-2 font-mono">ReactNode</td><td className="px-4 py-2">-</td><td className="px-4 py-2">Logo element above subtitle</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">subtitle</td><td className="px-4 py-2 font-mono">string</td><td className="px-4 py-2">"Access your dashboard"</td><td className="px-4 py-2">Text below the logo</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">usernameLabel</td><td className="px-4 py-2 font-mono">string</td><td className="px-4 py-2">"Username"</td><td className="px-4 py-2">First input label</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">passwordLabel</td><td className="px-4 py-2 font-mono">string</td><td className="px-4 py-2">"Password"</td><td className="px-4 py-2">Password input label</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">submitLabel</td><td className="px-4 py-2 font-mono">string</td><td className="px-4 py-2">"Sign In"</td><td className="px-4 py-2">Button text</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-foreground">loadingLabel</td><td className="px-4 py-2 font-mono">string</td><td className="px-4 py-2">"Signing In..."</td><td className="px-4 py-2">Button text during loading</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-foreground">helpText</td><td className="px-4 py-2 font-mono">ReactNode</td><td className="px-4 py-2">-</td><td className="px-4 py-2">Footer content (forgot password link, etc.)</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )
    }

    if (resolvedPath === '/dashboard') {
      return (
        <section className="w-full">
          <CustomizableDashboard
            widgets={dashboardWidgets}
            storageKey="markt-custom-dashboard-default-v3"
          />
        </section>
      )
    }

    const category = COMPONENT_CATEGORIES[resolvedPath]
    if (category) {
      const docs = category.componentPaths
        .map((componentPath) => getComponentDoc(componentPath))
        .filter((doc): doc is ComponentDoc => doc !== null)

      return <ComponentTheatre category={category} docs={docs} />
    }

    return (
      <section className="w-full">
        <CustomizableDashboard
          widgets={dashboardWidgets}
          storageKey="markt-custom-dashboard-default-v3"
        />
      </section>
    )
  }

  return (
    <MasterLayoutTemplate
      user={mockUser}
      initialPath="/getting-started"
      pageTitles={PAGE_TITLES}
      brand={{
        lightLogoSrc: '/logos/markt-light.webp',
        darkLogoSrc: '/logos/markt-dark.webp',
        shortName: 'MARKT',
      }}
      onSignOut={() => {
        console.info('Signed out')
      }}
    >
      {({ activePath }) => renderRoute(activePath)}
    </MasterLayoutTemplate>
  )
}

export default App
