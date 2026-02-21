import { useEffect, useMemo, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Check, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar02, type Avatar02User } from '@/components/shadcn-space/avatar/avatar-02';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const SPLITFIN_TABLE_CARD_MIN_HEIGHT = 430;

export interface SplitfinTableRow {
  customer: string;
  agent: string;
  value: string;
}

export type SplitfinTableRecord = Record<string, string>;

export interface SplitfinTableColumn {
  key: string;
  header: string;
  width: number;
  kind?: 'text' | 'agent' | 'value' | 'status' | 'muted';
  align?: 'left' | 'right';
}

export interface SplitfinTableView {
  key: string;
  label: string;
  columns: SplitfinTableColumn[];
  rows: SplitfinTableRecord[];
}

export type SplitfinAgentProfileMap = Record<string, Avatar02User>;

interface SplitfinColumnMeta {
  align?: 'left' | 'right';
  widthPercent?: number;
}

/**
 * Data-table card props for provider-backed row sets.
 *
 * `views` should be treated as the canonical data source for dynamic backends.
 * You can map Firebase, Neon/Postgres, or Supabase query results into
 * `SplitfinTableView[]` and pass `agentProfiles` to hydrate avatars from your
 * own user directory.
 */
export interface SplitfinTableCardProps {
  latestOrders?: SplitfinTableRow[];
  newEnquiries?: SplitfinTableRow[];
  views?: SplitfinTableView[];
  defaultView?: string;
  widthMode?: 'small' | 'medium' | 'wide';
  onWidthModeChange?: (mode: 'small' | 'medium' | 'wide') => void;
  columnWidths?: {
    customer?: number;
    agent?: number;
    value?: number;
  };
  onRowClick?: (row: SplitfinTableRecord) => void;
  /**
   * Optional agent profile map keyed by display name.
   * Use this to inject avatars from your own data provider instead of demo URLs.
   */
  agentProfiles?: SplitfinAgentProfileMap;
  /** Show skeleton rows while data is being fetched. */
  loading?: boolean;
  /** Message rendered when the active view has no rows. */
  emptyMessage?: string;
  className?: string;
}

function toDefaultRows(rows: SplitfinTableRow[]): SplitfinTableRecord[] {
  return rows.map((row) => ({
    customer: row.customer,
    agent: row.agent,
    value: row.value,
  }));
}

function renderCell(
  value: string,
  column: SplitfinTableColumn,
  agentProfiles: SplitfinAgentProfileMap,
) {
  if (column.kind === 'agent') {
    const profile = agentProfiles[value] ?? ({ name: value, role: 'Agent' } satisfies Avatar02User);

    return (
      <div className="flex items-center gap-2 min-w-0">
        <Avatar02
          users={[profile]}
          maxVisible={1}
          showOverflowCount={false}
          size="sm"
          className="shrink-0"
        />
        <span className="text-muted-foreground text-sm truncate">{value}</span>
      </div>
    );
  }

  if (column.kind === 'status') {
    const lower = value.toLowerCase();
    const tone =
      lower.includes('hot') || lower.includes('urgent') || lower.includes('overdue')
        ? 'text-amber-300 bg-amber-300/10 border-amber-300/25'
        : lower.includes('new') || lower.includes('open') || lower.includes('qualified')
          ? 'text-sky-300 bg-sky-300/10 border-sky-300/25'
          : lower.includes('won') || lower.includes('closed')
            ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/25'
            : 'text-muted-foreground bg-accent border-border/70';

    return (
      <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium', tone)}>
        {value}
      </span>
    );
  }

  if (column.kind === 'value') {
    return (
      <span className="text-foreground text-sm font-semibold tabular-nums block truncate">
        {value}
      </span>
    );
  }

  if (column.kind === 'muted') {
    return <span className="text-muted-foreground text-sm block truncate">{value}</span>;
  }

  return <span className="text-foreground/95 text-sm font-medium block truncate">{value}</span>;
}

export function SplitfinTableCard({
  latestOrders,
  newEnquiries,
  views,
  defaultView,
  widthMode = 'medium',
  onWidthModeChange,
  columnWidths,
  onRowClick,
  agentProfiles = {},
  loading = false,
  emptyMessage = 'No rows available',
  className,
}: SplitfinTableCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fallbackViews = useMemo<SplitfinTableView[]>(() => {
    const widths = {
      customer: columnWidths?.customer ?? 220,
      agent: columnWidths?.agent ?? 150,
      value: columnWidths?.value ?? 120,
    };

    const defaultColumns: SplitfinTableColumn[] = [
      { key: 'customer', header: 'Customer', width: widths.customer, kind: 'text' },
      { key: 'agent', header: 'Agent', width: widths.agent, kind: 'agent' },
      { key: 'value', header: 'Value', width: widths.value, kind: 'value', align: 'right' },
    ];

    return [
      {
        key: 'latest-orders',
        label: 'Latest Orders',
        columns: defaultColumns,
        rows: toDefaultRows(latestOrders ?? []),
      },
      {
        key: 'new-enquiries',
        label: 'New Enquiries',
        columns: defaultColumns,
        rows: toDefaultRows(newEnquiries ?? []),
      },
    ];
  }, [columnWidths?.agent, columnWidths?.customer, columnWidths?.value, latestOrders, newEnquiries]);

  const tableViews = views && views.length > 0 ? views : fallbackViews;

  const [view, setView] = useState<string>(() => {
    if (defaultView && tableViews.some((v) => v.key === defaultView)) return defaultView;
    return tableViews[0]?.key ?? 'latest-orders';
  });

  useEffect(() => {
    if (!tableViews.some((v) => v.key === view)) {
      setView(tableViews[0]?.key ?? 'latest-orders');
    }
  }, [tableViews, view]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const activeView = tableViews.find((option) => option.key === view) ?? tableViews[0];
  const activeRows = activeView?.rows ?? [];
  const activeTitle = activeView?.label ?? 'Table';

  const columns = useMemo<ColumnDef<SplitfinTableRecord>[]>(() => {
    const sourceColumns = activeView?.columns ?? [];
    const total = sourceColumns.reduce((sum, col) => sum + Math.max(col.width, 1), 0) || 1;

    return sourceColumns.map((column) => ({
      accessorKey: column.key,
      header: column.header,
      size: column.width,
      meta: {
        align: column.align,
        widthPercent: (Math.max(column.width, 1) / total) * 100,
      } satisfies SplitfinColumnMeta,
      cell: ({ row }) => renderCell(String(row.original[column.key] ?? ''), column, agentProfiles),
    }));
  }, [activeView, agentProfiles]);

  const table = useReactTable({
    data: activeRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const widthOptions: Array<{ key: 'small' | 'medium' | 'wide'; label: string }> = [
    { key: 'small', label: 'Small (1 col)' },
    { key: 'medium', label: 'Medium (2 col)' },
    { key: 'wide', label: 'Wide (3 col)' },
  ];
  const hasRows = activeRows.length > 0;

  return (
    <Card
      className={cn(
        'relative h-full gap-2 py-3 overflow-visible',
        'transition-colors hover:border-primary/30',
        className,
      )}
    >
      <div className="flex items-start justify-between px-4">
        <AnimatePresence mode="wait">
          <motion.h3
            key={activeTitle}
            initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            {activeTitle}
          </motion.h3>
        </AnimatePresence>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Switch table data"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-accent/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 top-11 z-50 min-w-[170px] rounded-lg border border-border/80 bg-card p-1.5 shadow-xl"
              >
                <div className="flex flex-col gap-1">
                  <p className="px-2.5 pt-1 pb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                    Data
                  </p>
                  {tableViews.map((option) => {
                    const active = option.key === view;
                    return (
                      <motion.button
                        key={option.key}
                        type="button"
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        onClick={() => {
                          setView(option.key);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                          active
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
                        )}
                      >
                        <span>{option.label}</span>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </motion.button>
                    );
                  })}

                  {onWidthModeChange && (
                    <>
                      <div className="my-1 h-px bg-border/60" />
                      <p className="px-2.5 pt-0.5 pb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        Width
                      </p>
                      {widthOptions.map((option) => {
                        const active = option.key === widthMode;
                        return (
                          <motion.button
                            key={option.key}
                            type="button"
                            whileHover={{ y: -1 }}
                            transition={{ duration: 0.14, ease: 'easeOut' }}
                            onClick={() => {
                              onWidthModeChange(option.key);
                              setMenuOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                              active
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
                            )}
                          >
                            <span>{option.label}</span>
                            {active && <Check className="h-3.5 w-3.5" />}
                          </motion.button>
                        );
                      })}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CardContent className="px-4 pb-1 pt-0">
        {loading ? (
          <div className="space-y-2 rounded-xl border border-border/60 bg-accent/25 p-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !hasRows ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(2px)' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="rounded-xl border border-border/60 bg-accent/25 overflow-x-auto"
            >
              <Table className="table-fixed" containerClassName="overflow-x-auto rounded-xl">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-b border-border/40 bg-accent/70 hover:bg-accent/70"
                    >
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as SplitfinColumnMeta | undefined;
                        return (
                          <TableHead
                            key={header.id}
                            style={{ width: `${meta?.widthPercent ?? 0}%` }}
                            className={cn(
                              'h-10 px-3 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground first:rounded-tl-xl last:rounded-tr-xl',
                              meta?.align === 'right' && 'text-right',
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.map((row, rowIndex) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'border-b border-border/25 last:border-0',
                        rowIndex % 2 === 0 ? 'bg-card/25' : 'bg-card/40',
                        onRowClick && 'cursor-pointer hover:bg-accent/45',
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as SplitfinColumnMeta | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            style={{ width: `${meta?.widthPercent ?? 0}%` }}
                            className={cn(
                              'px-3 py-2 border-r border-border/20 last:border-r-0 overflow-visible max-w-0',
                              meta?.align === 'right' && 'text-right',
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
