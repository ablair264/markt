import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronUp, Copy, Info } from 'lucide-react'
import { usePageHeader } from '@/components/layout/template/page-header'

/* ------------------------------------------------------------------ */
/*  Data contracts (same shape as App.tsx — keeps backward compat)     */
/* ------------------------------------------------------------------ */

export interface ComponentPropDoc {
  name: string
  type: string
  required?: boolean
  description: string
}

export interface ComponentExampleDoc {
  title: string
  description: string
  code: string
  preview: ReactNode
}

export interface ComponentDoc {
  title: string
  description: string
  usability: string
  implementation: string
  props: ComponentPropDoc[]
  examples: ComponentExampleDoc[]
}

export interface ComponentCategoryDoc {
  title: string
  description: string
  basics: string
  componentPaths: string[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toSectionId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type TabId = 'overview' | 'props' | 'code'

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'props', label: 'Props' },
  { id: 'code', label: 'Code' },
]

/* ------------------------------------------------------------------ */
/*  CopyButton                                                         */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-400" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  TabBar                                                             */
/* ------------------------------------------------------------------ */

function TabBar({
  activeTab,
  onTabChange,
  layoutId,
  hasProps,
  hasCode,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  layoutId: string
  hasProps: boolean
  hasCode: boolean
}) {
  const prefersReduced = useReducedMotion()

  const visibleTabs = useMemo(
    () =>
      TAB_LABELS.filter((tab) => {
        if (tab.id === 'props' && !hasProps) return false
        if (tab.id === 'code' && !hasCode) return false
        return true
      }),
    [hasProps, hasCode],
  )

  return (
    <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative z-10 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/50"
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 400, damping: 30 }
              }
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  OverviewTab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({ doc }: { doc: ComponentDoc }) {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {doc.description}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
            When to use
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{doc.usability}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
            Implementation
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{doc.implementation}</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PropsTab                                                           */
/* ------------------------------------------------------------------ */

function PropsTab({ props }: { props: ComponentPropDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 font-semibold text-foreground">Prop</th>
            <th className="px-4 py-3 font-semibold text-foreground">Type</th>
            <th className="px-4 py-3 font-semibold text-foreground">Required</th>
            <th className="px-4 py-3 font-semibold text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, i) => (
            <tr
              key={prop.name}
              className={`border-b border-border/40 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
            >
              <td className="px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                {prop.name}
              </td>
              <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                {prop.type}
              </td>
              <td className="px-4 py-2.5">
                {prop.required ? (
                  <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    required
                  </span>
                ) : (
                  <span className="text-[12px] text-muted-foreground/60">optional</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CodeTab                                                            */
/* ------------------------------------------------------------------ */

function CodeTab({ examples }: { examples: ComponentExampleDoc[] }) {
  const [activeExample, setActiveExample] = useState(0)
  const example = examples[activeExample]
  if (!example) return null

  return (
    <div className="space-y-3">
      {examples.length > 1 && (
        <div className="flex gap-2">
          {examples.map((ex, i) => (
            <button
              key={ex.title}
              onClick={() => setActiveExample(i)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                i === activeExample
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      )}

      <div className="relative rounded-xl border border-border bg-card">
        <div className="absolute right-3 top-3 z-10">
          <CopyButton text={example.code} />
        </div>
        <pre className="overflow-x-auto p-5 pr-24 font-mono text-[13px] leading-relaxed text-foreground/90">
          <code>{example.code.trim()}</code>
        </pre>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ComponentStage — one component's full showcase block               */
/* ------------------------------------------------------------------ */

function ComponentStage({
  doc,
  sectionId,
  index,
}: {
  doc: ComponentDoc
  sectionId: string
  index: number
}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const tabLayoutId = `stage-tabs-${sectionId}`

  const hasProps = doc.props.length > 0
  const hasCode = doc.examples.some((ex) => ex.code.trim().length > 0)

  // Use the first example for the stage preview
  const primaryExample = doc.examples[0]

  return (
    <section id={sectionId} className="scroll-mt-20 space-y-5">
      {/* Stage: dark showcase area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/50">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.04]" />

        {/* Title overlay */}
        <div className="relative flex items-center gap-3 border-b border-border/50 px-5 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
            {index + 1}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{doc.title}</h3>
            {primaryExample && (
              <p className="text-[12px] text-muted-foreground">{primaryExample.description}</p>
            )}
          </div>
        </div>

        {/* Preview area */}
        <div className="relative flex items-center justify-center px-6 py-8 md:px-10 md:py-12">
          <div className="w-full max-w-lg">
            {primaryExample?.preview}
          </div>
        </div>
      </div>

      {/* Tab bar + content */}
      <div className="space-y-4">
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          layoutId={tabLayoutId}
          hasProps={hasProps}
          hasCode={hasCode}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {activeTab === 'overview' && <OverviewTab doc={doc} />}
            {activeTab === 'props' && <PropsTab props={doc.props} />}
            {activeTab === 'code' && <CodeTab examples={doc.examples} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FloatingMiniNav                                                    */
/* ------------------------------------------------------------------ */

function FloatingMiniNav({
  items,
  activeSectionId,
  onNavigate,
}: {
  items: { id: string; title: string }[]
  activeSectionId: string
  onNavigate: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const prefersReduced = useReducedMotion()

  if (items.length < 2) return null

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className="mb-2 overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md"
          >
            <div className="max-h-60 overflow-y-auto p-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setExpanded(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                    item.id === activeSectionId
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      item.id === activeSectionId ? 'bg-primary' : 'bg-muted-foreground/40'
                    }`}
                  />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all duration-200 hover:border-primary/40 hover:shadow-xl"
      >
        {expanded ? (
          <ChevronUp size={16} className="text-foreground" />
        ) : (
          <span className="text-[11px] font-bold text-primary">{items.length}</span>
        )}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ComponentTheatre — the main page component                         */
/* ------------------------------------------------------------------ */

export interface ComponentTheatreProps {
  category: ComponentCategoryDoc
  docs: ComponentDoc[]
}

export function ComponentTheatre({ category, docs }: ComponentTheatreProps) {
  // Hide the page header while this component is mounted
  const { setPageHeader } = usePageHeader()
  const setPageHeaderRef = useRef(setPageHeader)
  setPageHeaderRef.current = setPageHeader

  useEffect(() => {
    setPageHeaderRef.current({ title: category.title, hidden: true })
    return () => {
      setPageHeaderRef.current({ title: category.title, hidden: false })
    }
  }, [category.title])

  const sectionItems = useMemo(
    () =>
      docs.map((doc, index) => ({
        id: `${toSectionId(category.title)}-${toSectionId(doc.title)}-${index + 1}`,
        title: doc.title,
      })),
    [category.title, docs],
  )

  const [activeSectionId, setActiveSectionId] = useState(sectionItems[0]?.id ?? '')

  useEffect(() => {
    setActiveSectionId(sectionItems[0]?.id ?? '')
  }, [sectionItems])

  // IntersectionObserver to track which section is in view
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!sectionItems.length) return

    const elements = sectionItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (!elements.length) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (mostVisible?.target.id) {
          setActiveSectionId(mostVisible.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    )

    elements.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [sectionItems])

  const handleScrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSectionId(sectionId)
  }, [])

  return (
    <section className="mx-auto w-full max-w-5xl space-y-10 px-4 md:px-8">
      {/* Category header */}
      <header className="space-y-4">
        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          {category.title}
        </h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      </header>

      {/* Basics callout */}
      <div className="flex gap-3 rounded-xl border border-border bg-card/50 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-primary" />
        <div className="space-y-1">
          <h2 className="text-[13px] font-semibold text-foreground">Component Basics</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{category.basics}</p>
        </div>
      </div>

      {/* Component stages */}
      <div className="space-y-14">
        {docs.map((doc, index) => {
          const section = sectionItems[index]
          if (!section) return null
          return (
            <ComponentStage
              key={section.id}
              doc={doc}
              sectionId={section.id}
              index={index}
            />
          )
        })}
      </div>

      {/* Floating mini-nav */}
      <FloatingMiniNav
        items={sectionItems}
        activeSectionId={activeSectionId}
        onNavigate={handleScrollToSection}
      />
    </section>
  )
}
