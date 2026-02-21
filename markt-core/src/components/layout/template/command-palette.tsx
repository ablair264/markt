import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Search,
  FileText,
  LayoutDashboard,
  Rocket,
  Users,
  PieChart,
  Table,
} from 'lucide-react'
import { SidebarKbd } from './sidebar-kbd'

interface CommandItem {
  id: string
  section: string
  label: string
  sublabel?: string
  icon: ReactNode
  path: string
}

interface FlatItem {
  id: string
  label: string
  sublabel?: string
  icon: ReactNode
  path: string
  section: string
}

const NAV_ITEMS: CommandItem[] = [
  {
    id: 'nav-getting-started',
    section: 'Navigation',
    label: 'Getting Started',
    icon: <Rocket size={16} />,
    path: '/getting-started',
  },
  {
    id: 'nav-documentation',
    section: 'Navigation',
    label: 'Documentation',
    icon: <FileText size={16} />,
    path: '/documentation',
  },
  {
    id: 'cmp-compact-guides',
    section: 'Dashboard Cards',
    label: 'Compact',
    icon: <Users size={16} />,
    path: '/dashboard/components/compact-cards',
  },
  {
    id: 'cmp-data-guides',
    section: 'Dashboard Cards',
    label: 'Table',
    icon: <Table size={16} />,
    path: '/dashboard/components/data-cards',
  },
  {
    id: 'cmp-metric-guides',
    section: 'Dashboard Cards',
    label: 'Metrics',
    icon: <LayoutDashboard size={16} />,
    path: '/dashboard/components/metric-cards',
  },
  {
    id: 'cmp-chart-guides',
    section: 'Dashboard Cards',
    label: 'Charts',
    icon: <PieChart size={16} />,
    path: '/dashboard/components/chart-cards',
  },
  {
    id: 'tpl-dnd-dashboard',
    section: 'Templates',
    label: 'DND Dashboard',
    icon: <LayoutDashboard size={16} />,
    path: '/dashboard',
  },
]

const ANIMATION = {
  overlay: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },
  dialog: {
    hidden: { opacity: 0, scale: 0.96, y: -8 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.15 } },
  },
  list: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
  },
} as const

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 text-[13px] text-sidebar-foreground/60 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Search size={16} />
      <span>Search...</span>
      <SidebarKbd>&#8984;K</SidebarKbd>
    </button>
  )
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(-1)
      window.setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const flatItems = useMemo<FlatItem[]>(() => {
    const filtered = query
      ? NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
      : NAV_ITEMS

    return filtered.map((item) => ({
      id: item.id,
      label: item.label,
      sublabel: item.sublabel,
      icon: item.icon,
      path: item.path,
      section: item.section,
    }))
  }, [query])

  const grouped = useMemo(
    () =>
      flatItems.reduce<Record<string, FlatItem[]>>((acc, item) => {
        ;(acc[item.section] ??= []).push(item)
        return acc
      }, {}),
    [flatItems],
  )

  const handleNavigate = useCallback(
    (path: string) => {
      onNavigate(path)
      onClose()
    },
    [onNavigate, onClose],
  )

  const handleGlobalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'Escape' && isOpen) {
        onClose()
        return
      }

      if (!isOpen) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1))
        return
      }

      if (event.key === 'Enter' && activeIndex >= 0 && flatItems[activeIndex]) {
        event.preventDefault()
        handleNavigate(flatItems[activeIndex].path)
      }
    },
    [isOpen, onClose, flatItems, activeIndex, handleNavigate],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])

  const hasResults = flatItems.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={onClose}
          variants={ANIMATION.overlay}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <div className="absolute inset-0 bg-black/60" />
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            variants={ANIMATION.dialog}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="flex h-12 items-center gap-3 border-b border-border px-4">
              <Search size={16} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent text-sm text-popover-foreground placeholder-muted-foreground outline-none"
                role="combobox"
                aria-expanded={hasResults}
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? flatItems[activeIndex]?.id : undefined}
                autoComplete="off"
              />
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2" role="listbox">
              <AnimatePresence mode="wait">
                {hasResults ? (
                  <motion.div
                    key={query || 'nav'}
                    variants={ANIMATION.list}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {Object.entries(grouped).map(([section, items]) => (
                      <div key={section}>
                        <motion.div variants={ANIMATION.item} className="mb-1">
                          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {section}
                          </div>
                        </motion.div>
                        {items.map((item) => {
                          const idx = flatItems.indexOf(item)
                          const isActive = idx === activeIndex
                          return (
                            <motion.button
                              key={item.id}
                              id={item.id}
                              variants={ANIMATION.item}
                              layout
                              role="option"
                              aria-selected={isActive}
                              className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                                isActive
                                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                  : 'text-popover-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`}
                              onClick={() => handleNavigate(item.path)}
                              onMouseEnter={() => setActiveIndex(idx)}
                            >
                              <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                              <span className="truncate">{item.label}</span>
                              {item.sublabel && (
                                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                                  {item.sublabel}
                                </span>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    ))}
                  </motion.div>
                ) : query.length >= 1 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-8 text-center text-sm text-muted-foreground"
                  >
                    No results found
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              <span>
                <kbd className="mr-1 rounded border border-border bg-muted px-1 py-0.5">&uarr;</kbd>
                <kbd className="mr-1 rounded border border-border bg-muted px-1 py-0.5">&darr;</kbd>
                navigate
              </span>
              <span>
                <kbd className="mr-1 rounded border border-border bg-muted px-1 py-0.5">&crarr;</kbd>
                select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
