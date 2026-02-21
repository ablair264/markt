import { useMemo, useState, type ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { CommandPaletteProvider, useCommandPalette } from '@/contexts/command-palette-context'
import { CommandPalette } from './command-palette'
import {
  PageHeaderProvider,
  PageHeader,
  useSetPageHeader,
} from './page-header'
import { AppSidebarTemplate, type ActiveEnquiry, type BrandAssets, type SidebarUser } from './app-sidebar'

const DEFAULT_PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/vehicles/finder': 'Vehicle Finder',
  '/stock': 'Stock Vehicles',
  '/quotes': 'Quotes',
  '/ratesheet': 'Ratesheet',
  '/customers': 'Customers',
  '/users': 'Users',
  '/enquiries': 'Enquiries',
  '/finance/invoices': 'Invoices',
  '/reports': 'Reports',
  '/admin/imports': 'Imports',
  '/admin/discount-terms': 'Discount Terms',
  '/settings': 'Settings',
  '/settings/account': 'Account Settings',
}

export interface MasterLayoutTemplateProps {
  user?: SidebarUser
  initialPath?: string
  activePath?: string
  onActivePathChange?: (path: string) => void
  onSignOut?: () => void
  activeEnquiries?: ActiveEnquiry[]
  trailingHeaderContent?: ReactNode
  pageTitles?: Record<string, string>
  brand?: BrandAssets
  children?: ReactNode | ((context: { activePath: string }) => ReactNode)
}

function resolveTitle(path: string, titles: Record<string, string>): string {
  let currentTitle = 'Dashboard'
  let bestLength = 0

  for (const [routePath, title] of Object.entries(titles)) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      if (routePath.length > bestLength) {
        currentTitle = title
        bestLength = routePath.length
      }
    }
  }

  return currentTitle
}

function HeaderBridge({
  activePath,
  pageTitles,
  trailingHeaderContent,
}: {
  activePath: string
  pageTitles: Record<string, string>
  trailingHeaderContent?: ReactNode
}) {
  const title = resolveTitle(activePath, pageTitles)
  useSetPageHeader(title, trailingHeaderContent)
  return null
}

function CommandPalettePortal({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { isOpen, close } = useCommandPalette()
  return <CommandPalette isOpen={isOpen} onClose={close} onNavigate={onNavigate} />
}

export function MasterLayoutTemplate({
  user = { name: 'User', role: 'User' },
  initialPath = '/dashboard',
  activePath: activePathProp,
  onActivePathChange,
  onSignOut,
  activeEnquiries,
  trailingHeaderContent,
  pageTitles,
  brand,
  children,
}: MasterLayoutTemplateProps) {
  const [internalPath, setInternalPath] = useState(initialPath)
  const activePath = activePathProp ?? internalPath

  const resolvedTitles = useMemo(
    () => ({
      ...DEFAULT_PAGE_TITLES,
      ...pageTitles,
    }),
    [pageTitles],
  )

  const handleNavigate = (path: string) => {
    if (!activePathProp) {
      setInternalPath(path)
    }
    onActivePathChange?.(path)
  }

  const resolvedChildren =
    typeof children === 'function'
      ? children({ activePath })
      : children ?? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Template page content for <span className="font-medium text-foreground">{activePath}</span>
          </div>
        )

  return (
    <CommandPaletteProvider>
      <SidebarProvider defaultOpen>
        <AppSidebarTemplate
          user={user}
          activePath={activePath}
          onNavigate={handleNavigate}
          onSignOut={onSignOut}
          activeEnquiries={activeEnquiries}
          brand={{
            lightLogoSrc: '/logos/markt-light.webp',
            darkLogoSrc: '/logos/markt-dark.webp',
            shortName: 'MARKT',
            ...brand,
          }}
          collapsible="dock"
          intent="default"
        />

        <SidebarInset className="bg-background">
          <PageHeaderProvider>
            <HeaderBridge
              activePath={activePath}
              pageTitles={resolvedTitles}
              trailingHeaderContent={trailingHeaderContent}
            />
            <PageHeader />
            <div className="relative min-h-screen flex-1 overflow-auto p-2 text-foreground lg:p-3">
              {resolvedChildren}
            </div>
          </PageHeaderProvider>
        </SidebarInset>

        <CommandPalettePortal onNavigate={handleNavigate} />
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
