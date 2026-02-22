import { useCallback, useState, useRef, type ComponentProps, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Activity,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Moon,
  PieChart,
  Rocket,
  Settings,
  Sun,
  Table,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'

interface NavItemDef {
  id: string
  label: string
  icon: ReactNode
  path: string
}

export interface SidebarUser {
  name: string
  role: string
}

// Kept for API compatibility with MasterLayoutTemplate.
export interface ActiveEnquiry {
  id: string
  title: string
  itemCount?: number
  path: string
}

export interface BrandAssets {
  lightLogoSrc?: string
  darkLogoSrc?: string
  shortName?: string
}

export interface AppSidebarTemplateProps extends ComponentProps<typeof Sidebar> {
  user: SidebarUser
  activePath: string
  onNavigate: (path: string) => void
  onSignOut?: () => void
  activeEnquiries?: ActiveEnquiry[]
  brand?: BrandAssets
}

const GETTING_STARTED: NavItemDef = {
  id: 'getting-started',
  label: 'Getting Started',
  icon: <Rocket size={18} />,
  path: '/getting-started',
}

const DOCUMENTATION: NavItemDef = {
  id: 'documentation',
  label: 'Documentation',
  icon: <FileText size={18} />,
  path: '/documentation',
}

const COMPONENT_GUIDES: NavItemDef[] = [
  {
    id: 'compact-cards-guide',
    label: 'Compact',
    icon: <Users size={18} />,
    path: '/dashboard/components/compact-cards',
  },
  {
    id: 'data-cards-guide',
    label: 'Table',
    icon: <Table size={18} />,
    path: '/dashboard/components/data-cards',
  },
  {
    id: 'metric-cards-guide',
    label: 'Metrics',
    icon: <Activity size={18} />,
    path: '/dashboard/components/metric-cards',
  },
  {
    id: 'chart-cards-guide',
    label: 'Charts',
    icon: <PieChart size={18} />,
    path: '/dashboard/components/chart-cards',
  },
]

const TEMPLATE_ITEMS: NavItemDef[] = [
  {
    id: 'dnd-dashboard-template',
    label: 'DND Dashboard',
    icon: <LayoutDashboard size={18} />,
    path: '/dashboard',
  },
  {
    id: 'login-page-template',
    label: 'Login Page',
    icon: <Lock size={18} />,
    path: '/templates/login',
  },
]

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

function CollapsedTooltip({ children, label }: { children: ReactNode; label: string }) {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 12 })
    }
    setShow(true)
  }

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)} className="relative">
      {children}
      {show && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ top: coords.top, left: coords.left, transform: 'translateY(-50%)' }}
        >
          <div className="whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg">
            {label}
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({
  item,
  isActive,
  isCollapsed,
  onNavigate,
  indent = false,
}: {
  item: NavItemDef
  isActive: boolean
  isCollapsed: boolean
  onNavigate: (path: string) => void
  indent?: boolean
}) {
  const prefersReduced = useReducedMotion()

  const button = (
    <div className="relative">
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute bottom-0 left-0 top-0 w-0.5 rounded-full bg-primary"
          transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <button
        onClick={() => onNavigate(item.path)}
        className={`group flex items-center rounded-lg text-left text-[13px] font-medium ${
          isCollapsed
            ? 'mx-auto size-10 justify-center'
            : `h-11 w-full gap-3 ${indent ? 'pl-11 pr-3' : 'px-3'}`
        } ${
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <span
          className={`flex-shrink-0 ${
            isActive
              ? 'text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground'
          }`}
        >
          {item.icon}
        </span>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="truncate whitespace-pre"
          >
            {item.label}
          </motion.span>
        )}
      </button>
    </div>
  )

  if (isCollapsed) {
    return <CollapsedTooltip label={item.label}>{button}</CollapsedTooltip>
  }

  return button
}

export function AppSidebarTemplate({
  user,
  activePath,
  onNavigate,
  onSignOut,
  brand,
  ...props
}: AppSidebarTemplateProps) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const prefersReduced = useReducedMotion()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsExpanded, setNotificationsExpanded] = useState(false)

  const isPathActive = useCallback(
    (path: string) => {
      const resolvedPath = LEGACY_COMPONENT_ROUTE_TO_CATEGORY[activePath] ?? activePath
      return resolvedPath === path || resolvedPath.startsWith(`${path}/`)
    },
    [activePath],
  )

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return true
  })

  const handleThemeToggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      return next
    })
  }, [])

  const userName = user.name || 'User'
  const userRole = user.role || 'User'
  const shortName = brand?.shortName ?? 'SL'

  const collapsedItems = [GETTING_STARTED, DOCUMENTATION, ...COMPONENT_GUIDES, ...TEMPLATE_ITEMS]

  return (
    <Sidebar {...props}>
      <SidebarHeader className={`space-y-3 pb-2 pt-5 ${isCollapsed ? 'items-center px-2' : 'px-4'}`}>
        {isCollapsed ? (
          <CollapsedTooltip label={userName}>
            <button
              onClick={() => {
                toggleSidebar()
                window.setTimeout(() => setProfileOpen(true), 250)
              }}
              className="relative mx-auto flex items-center justify-center"
            >
              <div className="size-9 rounded-full bg-primary p-0.5">
                <div className="flex size-full items-center justify-center rounded-full bg-card text-[13px] font-semibold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </button>
          </CollapsedTooltip>
        ) : (
          <>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all duration-200 shadow-sm ${
                profileOpen
                  ? 'border-sidebar-border bg-card'
                  : 'border-sidebar-border bg-card/90 hover:bg-card'
              }`}
            >
              <div className="relative shrink-0">
                <div className="size-9 rounded-full bg-primary p-0.5">
                  <div className="flex size-full items-center justify-center rounded-full bg-card text-[13px] font-semibold text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-[13px] font-medium leading-tight tracking-tight text-sidebar-foreground">
                  {userName}
                </div>
                <div className="truncate text-[11px] leading-tight tracking-tight text-sidebar-foreground/60">
                  {userRole}
                </div>
              </motion.div>
              <ChevronDown
                size={14}
                className={`shrink-0 text-sidebar-foreground/60 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {profileOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={prefersReduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pb-1">
                    <div>
                      <button
                        onClick={() => setNotificationsExpanded((prev) => !prev)}
                        className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <Bell size={16} className="shrink-0 text-sidebar-foreground/60" />
                        <span className="flex-1 text-left">Notifications</span>
                        <ChevronDown
                          size={14}
                          className={`shrink-0 text-sidebar-foreground/60 transition-transform duration-200 ${
                            notificationsExpanded ? '' : '-rotate-90'
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {notificationsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={prefersReduced ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="ml-7 mr-1 space-y-0.5 py-1">
                              <div className="px-2.5 py-2 text-[12px] text-sidebar-foreground/55">No notifications</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mx-3 my-1 border-t border-sidebar-border/80" />

                    <button
                      onClick={handleThemeToggle}
                      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      {isDark ? (
                        <Sun size={16} className="shrink-0 text-sidebar-foreground/60" />
                      ) : (
                        <Moon size={16} className="shrink-0 text-sidebar-foreground/60" />
                      )}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('/dashboard')
                        setProfileOpen(false)
                      }}
                      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Settings size={16} className="shrink-0 text-sidebar-foreground/60" />
                      <span>Dashboard Settings</span>
                    </button>

                    <div className="mx-3 my-1 border-t border-sidebar-border/80" />

                    <button
                      onClick={() => onSignOut?.()}
                      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut size={16} className="shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <nav className={`flex-1 overflow-y-auto pb-3 ${isCollapsed ? 'space-y-1.5 px-1 pt-2' : 'space-y-1.5 px-3'}`}>
          {isCollapsed ? (
            <>
              {collapsedItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isPathActive(item.path)}
                  isCollapsed
                  onNavigate={onNavigate}
                />
              ))}
            </>
          ) : (
            <>
              <NavItem
                item={GETTING_STARTED}
                isActive={isPathActive('/getting-started')}
                isCollapsed={false}
                onNavigate={onNavigate}
              />
              <NavItem
                item={DOCUMENTATION}
                isActive={isPathActive('/documentation')}
                isCollapsed={false}
                onNavigate={onNavigate}
              />

              <div className="mx-0 my-5 border-t border-sidebar-border/80" />

              <div className="px-3 pb-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                Components
              </div>
              <div className="px-3 pb-2 text-[12px] font-medium tracking-wide text-sidebar-foreground/80">
                Dashboard Cards
              </div>
              <div className="space-y-1.5">
                {COMPONENT_GUIDES.map((item) => (
                  <NavItem
                    key={item.id}
                    indent
                    item={item}
                    isActive={isPathActive(item.path)}
                    isCollapsed={false}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>

              <div className="pt-4">
                <div className="px-3 pb-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                  Templates
                </div>
                <div className="space-y-1.5">
                  {TEMPLATE_ITEMS.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      isActive={isPathActive(item.path)}
                      isCollapsed={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>
      </SidebarContent>

      <SidebarFooter className={isCollapsed ? 'p-2' : 'px-4 py-3'}>
        <div className={`flex justify-center ${!isCollapsed ? 'mt-1 border-t border-sidebar-border/80 pt-3' : 'mt-2'}`}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {isCollapsed ? (
              <span className="text-[11px] font-medium tracking-tight text-sidebar-foreground/60">{shortName}</span>
            ) : (
              <>
                {brand?.lightLogoSrc ? (
                  <img src={brand.lightLogoSrc} alt="Brand" className="h-6 w-auto object-contain dark:hidden" />
                ) : null}
                {brand?.darkLogoSrc ? (
                  <img src={brand.darkLogoSrc} alt="Brand" className="hidden h-6 w-auto object-contain dark:block" />
                ) : null}
                {!brand?.lightLogoSrc && !brand?.darkLogoSrc ? (
                  <span className="text-sm font-semibold tracking-tight text-sidebar-foreground/70">
                    {shortName}
                  </span>
                ) : null}
              </>
            )}
          </motion.div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
