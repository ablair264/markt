import type { ReactNode } from 'react'

export function SidebarKbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="ml-auto rounded border border-sidebar-border bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium leading-none text-sidebar-accent-foreground/80">
      {children}
    </kbd>
  )
}
