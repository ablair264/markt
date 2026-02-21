/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = '17rem'
const SIDEBAR_WIDTH_DOCK = '4rem'

type SidebarState = 'expanded' | 'collapsed'

type SidebarContextValue = {
  state: SidebarState
  open: boolean
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void
  isMobile: boolean
  isOpenOnMobile: boolean
  setIsOpenOnMobile: (value: boolean | ((value: boolean) => boolean)) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  shortcut?: string
  children: ReactNode
}

export function SidebarProvider({
  defaultOpen = true,
  isOpen: openProp,
  onOpenChange,
  shortcut = 'b',
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const open = openProp ?? internalOpen

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value
      if (onOpenChange) {
        onOpenChange(next)
      } else {
        setInternalOpen(next)
      }
    },
    [onOpenChange, open],
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpenOnMobile((prev) => !prev)
      return
    }
    setOpen((prev) => !prev)
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== shortcut.toLowerCase() || !(event.metaKey || event.ctrlKey)) {
        return
      }

      const activeElement = document.activeElement
      const isInTextInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true' ||
        activeElement?.getAttribute('role') === 'textbox'

      if (!isInTextInput) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, toggleSidebar])

  const state: SidebarState = open ? 'expanded' : 'collapsed'

  const value = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      isOpenOnMobile,
      setIsOpenOnMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, isOpenOnMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn('group/sidebar-root flex min-h-screen w-full text-sidebar-foreground', className)}
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-dock': SIDEBAR_WIDTH_DOCK,
          ...style,
        } as CSSProperties}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  intent?: 'default' | 'float' | 'inset'
  collapsible?: 'hidden' | 'dock' | 'none'
  side?: 'left' | 'right'
}

export function Sidebar({
  className,
  children,
  intent = 'default',
  collapsible = 'hidden',
  side = 'left',
  ...props
}: SidebarProps) {
  const { state, isMobile, isOpenOnMobile, setIsOpenOnMobile } = useSidebar()

  const isCollapsed = state === 'collapsed'

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        data-intent={intent}
        data-collapsible="none"
        className={cn('flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground', className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden',
            isOpenOnMobile ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={() => setIsOpenOnMobile(false)}
          aria-hidden
        />
        <div
          data-slot="sidebar"
          data-intent={intent}
          className={cn(
            'fixed inset-y-0 z-50 flex w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:hidden',
            side === 'left' ? 'left-0' : 'right-0',
            isOpenOnMobile
              ? 'translate-x-0'
              : side === 'left'
                ? '-translate-x-full'
                : 'translate-x-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }

  const dockWidthClass =
    intent === 'inset' ? 'w-[calc(var(--sidebar-width-dock)+0.5rem)]' : 'w-[var(--sidebar-width-dock)]'

  const gapWidthClass =
    collapsible === 'hidden' && isCollapsed
      ? 'w-0'
      : collapsible === 'dock' && isCollapsed
        ? dockWidthClass
        : 'w-[var(--sidebar-width)]'

  const containerWidthClass =
    collapsible === 'dock' && isCollapsed ? 'w-[var(--sidebar-width-dock)]' : 'w-[var(--sidebar-width)]'

  const hiddenOffsetClass =
    collapsible === 'hidden' && isCollapsed
      ? side === 'left'
        ? '-translate-x-full'
        : 'translate-x-full'
      : 'translate-x-0'

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-intent={intent}
      data-side={side}
      data-collapsible={isCollapsed ? collapsible : ''}
      className="group peer hidden md:block"
      {...props}
    >
      <div
        aria-hidden
        data-slot="sidebar-gap"
        className={cn('relative h-svh bg-transparent transition-[width] duration-300 ease-in-out', gapWidthClass)}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-20 hidden flex-col bg-sidebar text-sidebar-foreground transition-[transform,width,left,right] duration-300 ease-in-out md:flex',
          side === 'left' ? 'left-0' : 'right-0',
          intent === 'default' && (side === 'left' ? 'border-r border-sidebar-border' : 'border-l border-sidebar-border'),
          intent === 'float' && 'm-2 rounded-xl border border-sidebar-border shadow-lg',
          intent === 'inset' && 'dark:bg-background',
          containerWidthClass,
          hiddenOffsetClass,
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SidebarHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar()
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex flex-col gap-2 border-sidebar-border', state === 'collapsed' ? 'items-center p-2.5' : 'p-4', className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar()
  return (
    <div
      data-slot="sidebar-content"
      className={cn('flex min-h-0 flex-1 flex-col overflow-auto', state === 'collapsed' ? 'items-center' : '', className)}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-footer" className={cn('mt-auto flex flex-col', className)} {...props} />
}

export function SidebarInset({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative flex min-h-screen w-full flex-1 flex-col bg-background lg:min-w-0',
        'md:group-has-[data-intent=inset]/sidebar-root:m-2 md:group-has-[data-intent=inset]/sidebar-root:rounded-2xl md:group-has-[data-intent=inset]/sidebar-root:border md:group-has-[data-intent=inset]/sidebar-root:border-sidebar-border',
        className,
      )}
      {...props}
    />
  )
}

export type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function SidebarTrigger({ className, children, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      aria-label={props['aria-label'] ?? 'Toggle Sidebar'}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      {children ?? <PanelLeft className="size-4" />}
    </button>
  )
}
