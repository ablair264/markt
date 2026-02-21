import { useEffect, useMemo, useState } from 'react';
import { Check, GripVertical, Pencil, RotateCcw } from 'lucide-react';
import {
  ResponsiveGridLayout,
  noCompactor,
  useContainerWidth,
  verticalCompactor,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout';
import { cn } from '@/lib/utils';

export type DashboardWidgetSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'full'
  | 'one'
  | 'two'
  | 'three';

export interface DashboardWidget {
  id: string;
  title?: string;
  size?: DashboardWidgetSize;
  minHeight?: number;
  minHeightClassName?: string;
  rowSpan?: number;
  contentClassName?: string;
  render: () => React.ReactNode;
}

export interface CustomizableDashboardProps {
  widgets: DashboardWidget[];
  storageKey?: string;
  packing?: 'strict' | 'dense';
  className?: string;
  onLayoutChange?: (orderedWidgetIds: string[]) => void;
}

const BREAKPOINTS = { lg: 1280, md: 996, sm: 768, xs: 480, xxs: 0 } as const;
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;
const MARGIN: [number, number] = [16, 16];
const ROW_HEIGHT_PX = 8;
const ROW_GAP_PX = MARGIN[1];
const DEFAULT_MIN_HEIGHT = 160;

type BreakpointKey = keyof typeof BREAKPOINTS;

// Per-breakpoint column widths so sizes scale sensibly at xs/xxs viewports.
const SIZE_TO_WIDTH: Record<DashboardWidgetSize, Record<BreakpointKey, number>> = {
  //            lg  md  sm  xs  xxs
  sm:   { lg: 3, md: 3, sm: 3, xs: 2, xxs: 2 },
  md:   { lg: 4, md: 4, sm: 3, xs: 4, xxs: 2 },
  lg:   { lg: 6, md: 5, sm: 6, xs: 4, xxs: 2 },
  full: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  one:  { lg: 3, md: 3, sm: 3, xs: 2, xxs: 2 },
  two:  { lg: 6, md: 5, sm: 6, xs: 4, xxs: 2 },
  three:{ lg: 9, md: 8, sm: 6, xs: 4, xxs: 2 },
};

function resolveWidgetMinHeight(widget: DashboardWidget): number {
  if (widget.minHeight && widget.minHeight > 0) return widget.minHeight;

  const classValue = widget.minHeightClassName;
  if (classValue) {
    const match = classValue.match(/min-h-\[(\d+)px\]/);
    if (match?.[1]) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }

  return DEFAULT_MIN_HEIGHT;
}

function resolveWidgetHeightRows(widget: DashboardWidget): number {
  if (widget.rowSpan && widget.rowSpan > 0) return widget.rowSpan;
  const minHeight = resolveWidgetMinHeight(widget);
  return Math.max(
    6,
    Math.ceil((minHeight + ROW_GAP_PX) / (ROW_HEIGHT_PX + ROW_GAP_PX)),
  );
}

function resolveWidgetWidth(widget: DashboardWidget, bp: BreakpointKey, cols: number): number {
  const size = widget.size ?? 'md';
  return Math.max(1, Math.min(SIZE_TO_WIDTH[size][bp], cols));
}

function createLayoutForCols(
  orderedIds: string[],
  widgetsById: Map<string, DashboardWidget>,
  bp: BreakpointKey,
  cols: number,
  startY = 0,
): LayoutItem[] {
  let x = 0;
  let y = startY;
  let rowMaxH = 0;
  const layout: LayoutItem[] = [];

  for (const id of orderedIds) {
    const widget = widgetsById.get(id);
    if (!widget) continue;

    const w = resolveWidgetWidth(widget, bp, cols);
    const h = resolveWidgetHeightRows(widget);

    if (x + w > cols) {
      x = 0;
      y += rowMaxH;
      rowMaxH = 0;
    }

    // minH = maxH = designed height so card height is locked; only width is resizable.
    layout.push({ i: id, x, y, w, h, minW: 2, minH: h, maxH: h, static: false });

    x += w;
    rowMaxH = Math.max(rowMaxH, h);
  }

  return layout;
}

function createInitialLayouts(
  orderedIds: string[],
  widgetsById: Map<string, DashboardWidget>,
): ResponsiveLayouts<BreakpointKey> {
  return {
    lg:  createLayoutForCols(orderedIds, widgetsById, 'lg',  COLS.lg),
    md:  createLayoutForCols(orderedIds, widgetsById, 'md',  COLS.md),
    sm:  createLayoutForCols(orderedIds, widgetsById, 'sm',  COLS.sm),
    xs:  createLayoutForCols(orderedIds, widgetsById, 'xs',  COLS.xs),
    xxs: createLayoutForCols(orderedIds, widgetsById, 'xxs', COLS.xxs),
  };
}

function sortByPosition(layout: readonly LayoutItem[]): string[] {
  return [...layout]
    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
    .map((item) => String(item.i));
}

/**
 * Filter stale ids from a saved layout and append any new ids at the bottom.
 */
function applyConstraints(
  item: LayoutItem,
  widgetsById: Map<string, DashboardWidget>,
): LayoutItem {
  const widget = widgetsById.get(String(item.i));
  if (!widget) return item;
  const designedH = resolveWidgetHeightRows(widget);
  return { ...item, minH: designedH, maxH: designedH };
}

function reconcileLayout(
  saved: readonly LayoutItem[],
  currentIds: string[],
  widgetsById: Map<string, DashboardWidget>,
  bp: BreakpointKey,
  cols: number,
): LayoutItem[] {
  const currentIdSet = new Set(currentIds);
  // Re-apply per-widget constraints so saved layouts respect current widget config.
  const filtered = saved
    .filter((item) => currentIdSet.has(String(item.i)))
    .map((item) => applyConstraints(item, widgetsById));

  const savedIdSet = new Set(filtered.map((item) => String(item.i)));
  const newIds = currentIds.filter((id) => !savedIdSet.has(id));

  if (newIds.length === 0) return filtered;

  const maxY = filtered.reduce((m, item) => Math.max(m, item.y + item.h), 0);
  const newItems = createLayoutForCols(newIds, widgetsById, bp, cols, maxY);
  return [...filtered, ...newItems];
}

function readInitialLayouts(
  storageKey: string,
  initialIds: string[],
  widgetsById: Map<string, DashboardWidget>,
): ResponsiveLayouts<BreakpointKey> {
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as unknown;

      // New format: full layouts object with real positions
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const asObj = parsed as Record<string, unknown>;
        if (Array.isArray(asObj.lg) && (asObj.lg as unknown[]).length > 0) {
          const asLayouts = parsed as ResponsiveLayouts<BreakpointKey>;
          // Reconcile: remove stale widgets, add new ones
          const result: ResponsiveLayouts<BreakpointKey> = {
            lg:  reconcileLayout(asLayouts.lg  ?? [], initialIds, widgetsById, 'lg',  COLS.lg),
            md:  reconcileLayout(asLayouts.md  ?? [], initialIds, widgetsById, 'md',  COLS.md),
            sm:  reconcileLayout(asLayouts.sm  ?? [], initialIds, widgetsById, 'sm',  COLS.sm),
            xs:  reconcileLayout(asLayouts.xs  ?? [], initialIds, widgetsById, 'xs',  COLS.xs),
            xxs: reconcileLayout(asLayouts.xxs ?? [], initialIds, widgetsById, 'xxs', COLS.xxs),
          };
          return result;
        }
      }

      // Legacy format: array of ordered IDs
      if (Array.isArray(parsed)) {
        const fromSaved = (parsed as unknown[]).map(String);
        const valid = fromSaved.filter((id) => initialIds.includes(id));
        const missing = initialIds.filter((id) => !valid.includes(id));
        return createInitialLayouts([...valid, ...missing], widgetsById);
      }
    } catch {
      // fall through to defaults
    }
  }

  return createInitialLayouts(initialIds, widgetsById);
}

export function CustomizableDashboard({
  widgets,
  storageKey = 'markt-dashboard-layout',
  packing = 'dense',
  className,
  onLayoutChange,
}: CustomizableDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('lg');
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1280,
  });

  const initialIds = useMemo(() => widgets.map((widget) => widget.id), [widgets]);
  const widgetsById = useMemo(
    () => new Map(widgets.map((widget) => [widget.id, widget])),
    [widgets],
  );

  // Store actual grid positions (not just ID order) so drag-and-drop placements are preserved.
  const [activeLayouts, setActiveLayouts] = useState<ResponsiveLayouts<BreakpointKey>>(() =>
    readInitialLayouts(storageKey, initialIds, widgetsById),
  );

  // When the widgets prop changes (additions/removals), reconcile the layouts.
  useEffect(() => {
    setActiveLayouts((prev) => ({
      lg:  reconcileLayout(prev.lg  ?? [], initialIds, widgetsById, 'lg',  COLS.lg),
      md:  reconcileLayout(prev.md  ?? [], initialIds, widgetsById, 'md',  COLS.md),
      sm:  reconcileLayout(prev.sm  ?? [], initialIds, widgetsById, 'sm',  COLS.sm),
      xs:  reconcileLayout(prev.xs  ?? [], initialIds, widgetsById, 'xs',  COLS.xs),
      xxs: reconcileLayout(prev.xxs ?? [], initialIds, widgetsById, 'xxs', COLS.xxs),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIds.join(',')]); // stable string dep avoids infinite loops

  // Persist full layouts (with real positions) to localStorage.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activeLayouts));
    const lgLayout = activeLayouts.lg ?? [];
    const ordered = sortByPosition(lgLayout).filter((id) => widgetsById.has(id));
    onLayoutChange?.(ordered);
  }, [activeLayouts, onLayoutChange, storageKey, widgetsById]);

  function resetLayout() {
    const initial = createInitialLayouts(initialIds, widgetsById);
    setActiveLayouts(initial);
    localStorage.removeItem(storageKey);
  }

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Customizable Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Toggle edit mode to reorder cards by drag handle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditMode((current) => !current)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
              isEditMode
                ? 'border-primary/40 bg-primary/20 text-foreground hover:bg-primary/25'
                : 'border-border/70 bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {isEditMode ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Done
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit layout
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-accent/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset layout
          </button>
        </div>
      </div>

      <div ref={containerRef}>
        {mounted ? (
          <ResponsiveGridLayout
            className="layout"
            width={Math.max(width, 320)}
            layouts={activeLayouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={ROW_HEIGHT_PX}
            margin={MARGIN}
            containerPadding={[0, 0]}
            compactor={packing === 'dense' ? verticalCompactor : noCompactor}
            resizeConfig={{ enabled: isEditMode }}
            dragConfig={{
              enabled: isEditMode,
              handle: '.dashboard-drag-handle',
            }}
            onBreakpointChange={(bp) => setCurrentBreakpoint(bp as BreakpointKey)}
            onLayoutChange={(currentLayout) => {
              if (!isEditMode) return;
              // Re-apply minH/maxH — react-grid-layout strips them from the callback payload.
              const withConstraints = currentLayout.map((item) =>
                applyConstraints(item, widgetsById),
              );
              setActiveLayouts((prev) => ({ ...prev, [currentBreakpoint]: withConstraints }));
            }}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="relative">
                {isEditMode ? (
                  <button
                    type="button"
                    aria-label="Drag card"
                    className="dashboard-drag-handle absolute -right-3 -top-3 z-40 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-accent/85 text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.35)] cursor-grab active:cursor-grabbing touch-none"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                <div
                  className={cn('h-full w-full', widget.contentClassName)}
                  data-breakpoint={currentBreakpoint}
                >
                  {widget.render()}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : null}
      </div>
    </section>
  );
}
