import { useEffect, useId, useRef, useState } from 'react';
import { Activity, CalendarDays, MapPin, Users, Video } from 'lucide-react';
import { Area, AreaChart, Line, LineChart } from 'recharts';
import { Card } from '@/components/ui/card';
import { BlurInText } from '@/components/ui/blur-in-text';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Avatar02, type Avatar02User } from '@/components/shadcn-space/avatar/avatar-02';
import { Skeleton } from '@/components/ui/skeleton';
import { formatValue, type ValueFormat } from '@/lib/format';
import { cn } from '@/lib/utils';

export type { Avatar02User };

interface CompactCardBaseProps {
  title?: string;
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

function compactAccentStyle(accentColor: string): React.CSSProperties {
  return {
    borderColor: 'var(--color-border)',
    borderLeftColor: accentColor,
  };
}

export const COMPACT_CARD_MIN_HEIGHT = 124;

/* ------------------------------------------------------------------ */
/*  LiveActivityCompactCard                                             */
/* ------------------------------------------------------------------ */

/**
 * Compact real-time activity feed card.
 *
 * Recommended wiring:
 * - Firebase: subscribe with `onSnapshot` and pass latest document message.
 * - Supabase: subscribe with `channel(...).on('postgres_changes', ...)`.
 * - Neon/Postgres: stream via websocket/listen-notify, or poll + setState.
 *
 * Update `latestUpdate` with each new event and bump `updateKey` to replay the
 * transition animation deterministically.
 */
export interface LiveActivityCompactCardProps extends CompactCardBaseProps {
  /** The current activity message to display. */
  latestUpdate: string;
  /**
   * Change this value whenever `latestUpdate` changes to re-trigger the
   * blur-in animation. Can be a counter, timestamp, or the message itself.
   */
  updateKey?: string | number;
  /** Label shown next to the status indicator. Defaults to "Live now". */
  activeLabel?: string;
  /**
   * Whether the live indicator should appear active (green ping).
   * Set to false to show a muted/inactive state. Defaults to true.
   */
  isLive?: boolean;
  /** Show skeleton placeholders while awaiting the first event. */
  loading?: boolean;
}

export function LiveActivityCompactCard({
  title = 'Live Activity',
  latestUpdate,
  updateKey,
  activeLabel = 'Live now',
  isLive = true,
  loading = false,
  accentColor = 'var(--color-chart-1)',
  className,
  onClick,
}: LiveActivityCompactCardProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          'min-h-[124px] border-l-[3px] p-3.5 gap-2 overflow-hidden',
          className,
        )}
        style={compactAccentStyle(accentColor)}
      >
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'min-h-[124px] border-l-[3px] p-3.5 gap-2 overflow-hidden cursor-pointer transition-colors hover:border-primary/30',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {title}
        </p>
        {isLive ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5">
            <span className="relative inline-flex size-2.5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
            </span>
            <span className="text-[10px] font-medium text-emerald-300">
              {activeLabel}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5">
            <span className="inline-flex size-2 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-medium text-muted-foreground/60">
              Offline
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <BlurInText
          key={String(updateKey ?? latestUpdate)}
          text={latestUpdate}
          className="!m-0 !text-left !text-[18px] !leading-[1.2] !tracking-normal !font-semibold !font-sans !drop-shadow-none !text-foreground break-words"
        />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  NextEventCompactCard                                                */
/* ------------------------------------------------------------------ */

/**
 * Displays the next upcoming calendar event.
 *
 * ### Google Calendar
 * ```ts
 * import { formatEventTime } from '@/lib/format';
 *
 * const event = await calendar.events.get({ calendarId: 'primary', eventId });
 *
 * <NextEventCompactCard
 *   eventName={event.summary}
 *   eventTime={formatEventTime(
 *     event.start.dateTime ?? event.start.date,
 *     event.end.dateTime ?? event.end.date,
 *     { allDay: !!event.start.date },
 *   )}
 *   status={event.status}          // "confirmed" | "tentative" | "cancelled"
 *   isOnlineMeeting={!!event.hangoutLink || event.eventType === 'workingLocation'}
 *   location={event.location}
 *   attendees={event.attendees?.map(a => ({
 *     name: a.displayName ?? a.email,
 *     email: a.email,
 *   }))}
 * />
 * ```
 *
 * ### Microsoft Graph (Outlook)
 * ```ts
 * import { formatEventTime } from '@/lib/format';
 *
 * const event = await graphClient.api('/me/events/{id}').get();
 *
 * <NextEventCompactCard
 *   eventName={event.subject}
 *   eventTime={formatEventTime(
 *     event.start.dateTime,
 *     event.end.dateTime,
 *     { timeZone: event.start.timeZone, allDay: event.isAllDay },
 *   )}
 *   status={event.showAs}          // "free" | "tentative" | "busy" | "oof"
 *   isOnlineMeeting={event.isOnlineMeeting}
 *   location={event.location?.displayName}
 *   attendees={event.attendees?.map(a => ({
 *     name: a.emailAddress.name,
 *     email: a.emailAddress.address,
 *   }))}
 * />
 * ```
 */
export interface NextEventCompactCardProps extends CompactCardBaseProps {
  /** Name/title of the upcoming event. Maps to `summary` (Google) or `subject` (Outlook). */
  eventName: string;
  /**
   * Pre-formatted time string. Use `formatEventTime()` from `@markt/format`
   * to convert API start/end dates into the correct display format.
   */
  eventTime: string;
  /**
   * Status badge text. Pass the raw API value or a mapped display label.
   * - Google: `event.status` → "confirmed", "tentative", "cancelled"
   * - Outlook: `event.showAs` → "free", "tentative", "busy", "oof"
   * Defaults to "Scheduled".
   */
  status?: string;
  /**
   * Whether this is an online meeting (Google Meet, Teams, Zoom, etc.).
   * Renders a video badge instead of the status badge.
   * - Google: `!!event.hangoutLink`
   * - Outlook: `event.isOnlineMeeting`
   */
  isOnlineMeeting?: boolean;
  /**
   * Physical or virtual location string.
   * - Google: `event.location`
   * - Outlook: `event.location?.displayName`
   */
  location?: string;
  /** Attendee list. Pass an empty array (or omit) if there are no attendees. */
  attendees?: Avatar02User[];
  /** Override the header icon. Defaults to a calendar icon. */
  icon?: React.ReactNode;
}

export function NextEventCompactCard({
  title = 'Next Event',
  eventName,
  eventTime,
  status = 'Scheduled',
  isOnlineMeeting = false,
  location,
  attendees = [],
  icon,
  accentColor = 'var(--color-chart-2)',
  className,
  onClick,
}: NextEventCompactCardProps) {
  return (
    <Card
      className={cn(
        'min-h-[124px] border-l-[3px] p-3.5 gap-1.5 overflow-visible cursor-pointer transition-colors hover:border-primary/30',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <CalendarDays className="h-3 w-3" />}
          {title}
        </div>
        {attendees.length > 0 && (
          <Avatar02
            users={attendees}
            maxVisible={3}
            size="sm"
            showOverflowCount
            className="shrink-0"
          />
        )}
      </div>

      <p className="text-[19px] font-semibold leading-[1.2] text-foreground truncate">
        {eventName}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">{eventTime}</p>
        {isOnlineMeeting ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-accent px-2 py-0.5 text-[10px] font-medium text-foreground/90">
            <Video className="h-2.5 w-2.5" />
            Online
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-border/70 bg-accent px-2 py-0.5 text-[10px] font-medium text-foreground/90">
            {status}
          </span>
        )}
      </div>

      {location && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  WhosOnlineCompactCard — Slack adapter                              */
/* ------------------------------------------------------------------ */

/**
 * Minimal Slack user shape from `users.list`.
 * All profile fields are optional — the Slack API docs explicitly state
 * that absent data may be missing entirely, null, or an empty string.
 *
 * Required OAuth scopes: `users:read`, `users:read.email`
 */
export interface SlackUserLike {
  id: string;
  name?: string;
  real_name?: string;
  deleted?: boolean;
  is_bot?: boolean;
  is_app_user?: boolean;
  /** Presence from `users.getPresence`. Add this after fetching per-user presence. */
  presence?: 'active' | 'away';
  profile?: {
    display_name?: string;
    real_name?: string;
    title?: string;
    email?: string;
    status_text?: string;
    status_emoji?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
  };
}

export interface FromSlackUsersOptions {
  /**
   * Which Slack avatar size to use. Defaults to `"image_72"`.
   * Use `"image_192"` for higher-DPI displays.
   */
  avatarSize?: 'image_48' | 'image_72' | 'image_192';
  /**
   * What to show as the user's role/subtitle in the hover card.
   * - `"title"` — profile job title (default)
   * - `"status"` — Slack status text (e.g. "In a meeting")
   */
  roleField?: 'title' | 'status';
}

/**
 * Map Slack users from `users.list` (filtered to active) into `Avatar02User[]`
 * ready to pass to `WhosOnlineCompactCard`.
 *
 * ### Workflow
 * ```ts
 * // 1. Fetch all workspace members
 * const { members } = await slack.users.list();
 *
 * // 2. Filter out bots, deleted accounts, and Slackbot
 * const humans = members.filter(
 *   u => !u.deleted && !u.is_bot && !u.is_app_user && u.id !== 'USLACKBOT',
 * );
 *
 * // 3. Fetch presence for each user.
 * //    NOTE: users.getPresence is Tier 3 (≈50 req/min) — cache results
 * //    and refresh on a polling interval rather than on every render.
 * const withPresence = await Promise.all(
 *   humans.map(async u => {
 *     const { presence } = await slack.users.getPresence({ user: u.id });
 *     return { ...u, presence };
 *   }),
 * );
 *
 * // 4. Keep only active users
 * const activeUsers = withPresence.filter(u => u.presence === 'active');
 *
 * // 5. Map to Avatar02User[] and render
 * <WhosOnlineCompactCard
 *   users={fromSlackUsers(activeUsers)}
 *   countLabel={`${activeUsers.length} active in workspace`}
 * />
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function fromSlackUsers(
  users: SlackUserLike[],
  options: FromSlackUsersOptions = {},
): Avatar02User[] {
  const { avatarSize = 'image_72', roleField = 'title' } = options;

  return users.map((u) => {
    const name = (
      u.profile?.display_name?.trim() ||
      u.profile?.real_name?.trim() ||
      u.real_name?.trim() ||
      u.name ||
      u.id
    );

    const role =
      roleField === 'status'
        ? [u.profile?.status_emoji, u.profile?.status_text].filter(Boolean).join(' ') || undefined
        : u.profile?.title?.trim() || undefined;

    return {
      name,
      image: u.profile?.[avatarSize] || undefined,
      email: u.profile?.email || undefined,
      role,
    };
  });
}

export interface WhosOnlineCompactCardProps extends CompactCardBaseProps {
  /**
   * List of currently online users as avatar stack.
   * Use `fromSlackUsers(activeUsers)` to map from the Slack API response.
   */
  users: Avatar02User[];
  /**
   * Descriptive label shown below the avatar row.
   * Defaults to "{n} people online".
   * For Slack: `\`${activeUsers.length} active in workspace\``
   */
  countLabel?: string;
  /** Override the header icon. Defaults to a users icon. */
  icon?: React.ReactNode;
}

// sm avatar width (~32px) minus the ~8px AvatarGroup negative margin overlap = ~24px per avatar.
// Reserve ~44px for the +N overflow bubble, and 28px for card padding (14px × 2).
const AVATAR_STEP_PX = 24;
const AVATAR_OVERFLOW_RESERVE_PX = 44;
const CARD_PADDING_PX = 28;

export function WhosOnlineCompactCard({
  title = "Who's Online",
  users,
  countLabel,
  icon,
  accentColor = 'var(--color-chart-3)',
  className,
  onClick,
}: WhosOnlineCompactCardProps) {
  const label = countLabel ?? `${users.length} people online`;
  const cardRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(6);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const usable = entry.contentRect.width - CARD_PADDING_PX - AVATAR_OVERFLOW_RESERVE_PX;
      setMaxVisible(Math.max(2, Math.floor(usable / AVATAR_STEP_PX)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn(
        'min-h-[124px] border-l-[3px] p-3.5 gap-2 overflow-visible cursor-pointer transition-colors hover:border-primary/30 justify-between',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <Users className="h-3 w-3" />}
          {title}
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {users.length}
        </span>
      </div>

      <Avatar02
        users={users}
        maxVisible={maxVisible}
        size="sm"
        showOverflowCount
        className="w-full"
      />

      <p className="text-[10px] text-muted-foreground leading-4">{label}</p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  SparkStatsCompactCard                                               */
/* ------------------------------------------------------------------ */

export interface CompactSparklinePoint {
  name: string;
  value: number;
}

export interface SparkStatsCompactCardProps extends CompactCardBaseProps {
  /** The primary metric value to display. */
  value: number | string;
  format?: ValueFormat;
  /** Descriptive label below the chart, e.g. "+0.6% over last 16 points". */
  statLabel?: string;
  /** Sparkline data points. The chart is hidden when no data is provided. */
  data?: CompactSparklinePoint[];
  /** Chart style used for the compact sparkline. Defaults to `"area"`. */
  chartType?: 'area' | 'line';
  /** Override the header icon. Defaults to an activity icon. */
  icon?: React.ReactNode;
}

export function SparkStatsCompactCard({
  title = 'Performance',
  value,
  format = 'number',
  statLabel = 'vs last period',
  data = [],
  chartType = 'area',
  icon,
  accentColor = 'var(--color-chart-4)',
  className,
  onClick,
}: SparkStatsCompactCardProps) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `compact-spark-${uid}`;
  const chartConfig: ChartConfig = {
    value: { label: title, color: accentColor },
  };

  const formattedValue =
    typeof value === 'string' ? value : formatValue(value, format);

  return (
    <Card
      className={cn(
        'min-h-[124px] border-l-[3px] p-3.5 gap-1.5 overflow-hidden cursor-pointer transition-colors hover:border-primary/30',
        className,
      )}
      style={compactAccentStyle(accentColor)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
          {icon ?? <Activity className="h-3 w-3" />}
          {title}
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formattedValue}
        </span>
      </div>

      {data.length > 0 && (
        <ChartContainer className="w-full h-12 -mx-1" config={chartConfig}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={0.35}
                dot={false}
              />
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          )}
        </ChartContainer>
      )}

      <p className="text-[11px] text-muted-foreground leading-4">{statLabel}</p>
    </Card>
  );
}
