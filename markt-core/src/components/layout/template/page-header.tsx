/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { useCommandPalette } from '@/contexts/command-palette-context'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface PageHeaderState {
  title: string
  trailing?: ReactNode
}

interface PageHeaderContextValue {
  state: PageHeaderState
  setPageHeader: (state: PageHeaderState) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState>({ title: '' })
  const setPageHeader = useCallback((nextState: PageHeaderState) => setState(nextState), [])

  return <PageHeaderContext.Provider value={{ state, setPageHeader }}>{children}</PageHeaderContext.Provider>
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeader must be inside PageHeaderProvider')
  }
  return context
}

export function useSetPageHeader(title: string, trailing?: ReactNode) {
  const { setPageHeader } = usePageHeader()

  useEffect(() => {
    setPageHeader({ title, trailing })
  }, [setPageHeader, title, trailing])
}

export function PageHeader() {
  const { state } = usePageHeader()
  const { open } = useCommandPalette()

  if (!state.title) {
    return null
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold text-foreground">{state.title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {state.trailing}
        <button
          onClick={open}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Search (⌘K)"
        >
          <Search className="size-5" />
        </button>
      </div>
    </div>
  )
}
