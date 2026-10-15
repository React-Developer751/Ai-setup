import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import ExportPanel from './ExportPanel'
import ImportPanel from './ImportPanel'
import UnderstandingPanel from './UnderstandingPanel'
import { getLearningVersion, subscribeLearning } from './generator/ml/learned'
import { setSmart, smartVersion, smartWanted, subscribeSmart, understand } from './generator/ml/smart'
import { getPoolVersion, poolSummary, subscribePool } from './generator/dataPool'
import { generateSite } from './generator/generateSite'
import { generateWebsite } from './generator/generateWebsite'
import { libraryComponents } from './generator/library/libraryComponents'
import { generateLibraryPage } from './generator/library/generateLibraryPage'
import { Section, ThemeScope } from './generator/library/ThemeScope'
import { scoreThemes } from './generator/themeClassifier'
import type { Tier } from './generator/designBrain'
import type { MotionSetting } from './generator/motionBrain'
import { initMotion } from './generator/motionRuntime'

const EXAMPLES = [
  'Create a page for an organic green tea cafe named Leafy Premium',
  'Landing page for a protein shake brand and heavy lifting gym called Iron Pulse',
  'A cute online toy shop for kids named Giggle Box',
  'Premium leather wallet boutique called Maison Noir',
  'SaaS dashboard startup called CloudPilot',
  'Law firm called Lexa & Partners',
  'Family dental clinic called Bright Smile',
  'Italian pizza restaurant called Forno',
  'Online coding academy called CodeNest',
  'Wedding photography studio called Lumen',
  'Car wash and repair garage called Shine Auto',
]

function GeneratorPage() {
  const [prompt, setPrompt] = useState(EXAMPLES[0])
  const [submitted, setSubmitted] = useState(EXAMPLES[0])
  const [variation, setVariation] = useState(0)
  const [level, setLevel] = useState<'auto' | Tier>('auto')
  const [creative, setCreative] = useState(true)
  const [motionSetting, setMotionSetting] = useState<MotionSetting>('auto')
  const previewRef = useRef<HTMLDivElement>(null)
  const [engine, setEngine] = useState<'templates' | 'library'>('library')
  const [view, setView] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [pages, setPages] = useState<'multi' | 'single'>('multi')
  const [route, setRoute] = useState('/')
  const [fileIndex, setFileIndex] = useState(0)
  // the light / dark choice made in the preview survives a move to another page
  const modeRef = useRef<string | null>(null)

  // the data pool can change (an import): generate again then
  // ... or what the models know changes (a correction, the smart model finishing a prompt)
  const poolVersion =
    useSyncExternalStore(subscribePool, getPoolVersion) + useSyncExternalStore(subscribeLearning, getLearningVersion) + useSyncExternalStore(subscribeSmart, smartVersion)
  const site = useMemo(() => generateWebsite(submitted, variation, level === 'auto' ? undefined : level, creative, motionSetting), [submitted, variation, level, creative, motionSetting])
  const scores = useMemo(() => scoreThemes(submitted), [submitted])
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- the pool is read inside the generators
  const library = useMemo(() => generateLibraryPage(submitted, variation, level === 'auto' ? undefined : level, creative, motionSetting), [submitted, variation, level, creative, motionSetting, poolVersion])
  // the multi-page site is made with the built-in templates (the 92-components engine is single-page for now)
  const isMulti = pages === 'multi'
  const shownEngine = isMulti ? 'templates' : engine
  const multi = useMemo(
    () => generateSite(submitted, variation, level === 'auto' ? undefined : level, creative, motionSetting),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the pool is read inside the generators
    [submitted, variation, level, creative, motionSetting, poolVersion],
  )
  const active = isMulti ? multi : shownEngine === 'library' ? library : site
  const { themeKey, tier, motion, brain, brainsForced, palette, colorReasons } = active
  const brandName = active.content.brandName
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- the pool is read inside the generators
  const pool = useMemo(() => poolSummary(), [poolVersion])

  const files = isMulti
    ? multi.files
    : [{ path: 'GeneratedLandingPage.tsx', code: shownEngine === 'library' ? library.code : site.code }]
  const file = files[Math.min(fileIndex, files.length - 1)]
  const previewHtml = isMulti ? (multi.pagesHtml[route] ?? multi.pagesHtml['/']) : site.html

  // the live preview of the built-in templates is plain HTML, so start the motion runtime on it here
  useLayoutEffect(() => {
    if (shownEngine !== 'templates' || view !== 'preview') return
    const root = previewRef.current?.querySelector<HTMLElement>('.g-root')
    if (!root) return
    if (modeRef.current) root.setAttribute('data-mode', modeRef.current)
    previewRef.current?.scrollTo(0, 0)
    return initMotion(root, motion)
  }, [shownEngine, view, previewHtml, motion])

  // the person switched "smart understanding" on in an earlier visit: start it again
  useLayoutEffect(() => {
    if (smartWanted()) void setSmart(true, submitted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generate = async (text: string) => {
    if (!text.trim()) return
    // with "smart understanding" on, the model reads the prompt first (the generators are synchronous)
    await understand(text)
    setSubmitted(text)
    setVariation(0)
    setRoute('/')
    setFileIndex(0)
    modeRef.current = null
    setView('preview')
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const downloadCode = () => {
    const url = URL.createObjectURL(new Blob([file.code], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = file.path.split('/').pop() ?? 'GeneratedLandingPage.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Live preview of the built-in templates: the theme switch flips the data attribute that picks the
  // palette, and "#features" style links scroll inside the preview box instead of changing the page URL.
  const onPreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const toggle = target.closest('[data-theme-toggle]')
    if (toggle) {
      const root = toggle.closest('.g-root')
      const next = root?.getAttribute('data-mode') === 'dark' ? 'light' : 'dark'
      root?.setAttribute('data-mode', next)
      modeRef.current = next
      return
    }
    const link = target.closest('a')
    const href = link?.getAttribute('href')
    if (!href?.startsWith('#')) return
    e.preventDefault()
    link?.closest('details')?.removeAttribute('open')
    // multi-page sites: "#/about" opens the About page inside the preview
    if (href.startsWith('#/')) {
      setRoute(href.slice(1))
      return
    }
    e.currentTarget.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <label htmlFor="prompt" className="block text-sm font-semibold text-gray-800">
          Describe your website
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(prompt)
          }}
          rows={2}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="e.g. Create a page for a gym called Iron Pulse"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => generate(prompt)}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Generate website
          </button>
          <button
            type="button"
            onClick={() => {
              setVariation((v) => v + 1)
              setView('preview')
            }}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Another variation
          </button>
          <div className="ml-auto flex items-center gap-1 text-sm">
            <span className="mr-1 text-gray-500">Pages</span>
            {(['multi', 'single'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPages(p)
                  setRoute('/')
                }}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  pages === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'multi' ? 'Multi-page' : 'Single page'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-gray-500">Built with</span>
            {(['library', 'templates'] as const).map((e) => (
              <button
                key={e}
                type="button"
                title={e === 'library' ? 'Single page only for now' : undefined}
                onClick={() => {
                  setEngine(e)
                  if (e === 'library') setPages('single')
                }}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  shownEngine === e ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {e === 'library' ? 'My 92 components' : 'Built-in templates'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-gray-500">Creative brain</span>
            {([true, false] as const).map((on) => (
              <button
                key={String(on)}
                type="button"
                onClick={() => setCreative(on)}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  creative === on ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {on ? 'On' : 'Off'}
              </button>
            ))}
            {brainsForced && <span className="ml-1 text-xs text-gray-500">(always on for this business type)</span>}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-gray-500">Motion</span>
            {(['auto', 'off', 'subtle', 'rich'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMotionSetting(m)}
                className={`rounded-md px-3 py-1.5 font-medium capitalize ${
                  motionSetting === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-gray-500">Design level</span>
            {(['auto', 'normal', 'better', 'premium'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`rounded-md px-3 py-1.5 font-medium capitalize ${
                  level === l ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">Cmd/Ctrl + Enter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setPrompt(example)
                generate(example)
              }}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-gray-600">
          <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700">{themeKey}</span>
          <span
            className={`rounded-full px-3 py-1 font-semibold capitalize ${
              tier === 'premium' ? 'bg-amber-100 text-amber-800' : tier === 'normal' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {tier} {level === 'auto' ? '(auto)' : '(chosen)'}
          </span>
          <span>
            brand: <b className="text-gray-900">{brandName}</b>
          </span>
          <span className="text-xs text-gray-400">
            {isMulti
              ? `${multi.pages.length} pages · ${multi.pages.filter((p) => !p.slug).map((p) => p.label).join(' · ')}`
              : shownEngine === 'library'
                ? `${library.sections.map((x) => x.componentId.split('/')[1]).join(' · ')}`
                : `${site.layoutIds.length} sections · palette ${site.paletteIndex + 1}`}{' '}
            · variation {variation + 1}
          </span>
          <span className="basis-full text-xs text-gray-500">
            Why {brain.tier}? {brain.reasons.join(' · ')} → score {brain.score}
          </span>
          <span className="flex basis-full flex-wrap items-center gap-2 text-xs text-gray-500">
            {(['light', 'dark'] as const).map((m) => (
              <span key={m} className="flex overflow-hidden rounded border border-gray-300" title={`${m} mode`}>
                {[palette[m].bg, palette[m].surface, palette[m].text, palette[m].accent, palette[m].alt].map((c, i) => (
                  <span key={i} className="size-4" style={{ background: c }} />
                ))}
              </span>
            ))}
            <b className="text-gray-700">{palette.name}</b>
            {colorReasons.length > 0 && <span>{colorReasons.join(' · ')}</span>}
          </span>
          <span className="basis-full text-xs text-gray-500">
            Motion <b className="text-gray-700">{motion.level}</b>
            {motion.level !== 'off' && <> · {motion.style} · {motion.duration}ms</>}
            {motion.level !== 'off' && <> · {Object.entries(motion.features).filter(([, on]) => on).map(([name]) => name).join(', ')}</>}
            {motion.reasons.length > 0 && <> ({motion.reasons.join(' · ')})</>}
          </span>
          <span className="basis-full text-xs text-gray-500" title="Blog posts, team, reviews, FAQ and gallery captions that you keep in src/data/dataPool.json">
            Your data pool: <b className="text-gray-700">{pool.text}</b> ({pool.mode}) · edit <code>src/data/dataPool.json</code>
            {pool.problems.length > 0 && <span className="text-amber-700"> · {pool.problems.length} entr{pool.problems.length === 1 ? 'y' : 'ies'} left out: {pool.problems.slice(0, 2).join('; ')}</span>}
          </span>
          <ImportPanel />
          <UnderstandingPanel prompt={submitted} site={{ theme: themeKey, tier, variation, layout: `${isMulti ? 'multi' : 'single'}/${shownEngine}` }} onSmartReady={() => undefined} />
          <span className="text-xs text-gray-400">
            scores: {Object.entries(scores).map(([k, v]) => `${k}=${v}`).join(' · ')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['preview', 'code'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 font-medium capitalize ${
                view === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
          <ExportPanel engine={shownEngine} isMulti={isMulti} multi={multi} site={site} library={library} />
        </div>
      </div>

      {view === 'preview' && isMulti && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="Pages of the site">
          <span className="mr-1 text-gray-500">Page</span>
          {multi.pages.filter((p) => !p.slug).map((p) => (
            <button
              key={p.path}
              type="button"
              onClick={() => setRoute(p.path)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                route === p.path ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          {multi.pages.find((p) => p.path === route)?.slug && (
            <span className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white">Blog post</span>
          )}
        </div>
      )}

      {view === 'preview' ? (
        shownEngine === 'library' ? (
          <div
            key={`${submitted}|${variation}`}
            onClick={onPreviewClick}
            onSubmit={(e) => e.preventDefault()}
            className="h-[75vh] overflow-auto rounded-xl border border-gray-300"
          >
            <ThemeScope theme={library.themeKey} palette={library.palette} content={library.content} motion={library.motion}>
              {library.sections.map(({ role, componentId }) => {
                const Component = libraryComponents[componentId]
                return (
                  <Section key={role} role={role}>
                    <Component />
                  </Section>
                )
              })}
            </ThemeScope>
          </div>
        ) : (
          <div
            ref={previewRef}
            onClick={onPreviewClick}
            onSubmit={(e) => e.preventDefault()}
            className="h-[75vh] overflow-auto rounded-xl border border-gray-300"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )
      ) : (
        <div className="space-y-2">
          {files.length > 1 && (
            <div className="flex flex-wrap gap-1.5 text-xs" aria-label="Files of the site">
              {files.map((f, i) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => setFileIndex(i)}
                  className={`rounded-md px-2.5 py-1 font-mono ${
                    file.path === f.path ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.path}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => copyText(file.code)} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200">
              {copied ? 'Copied!' : 'Copy file'}
            </button>
            {files.length > 1 && (
              <button
                type="button"
                onClick={() => copyText(files.map((f) => `// ===== ${f.path} =====\n${f.code}`).join('\n'))}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
              >
                Copy all {files.length} files
              </button>
            )}
            <button type="button" onClick={downloadCode} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200">
              Download this file
            </button>
            <span className="text-xs text-gray-500">{file.path}</span>
          </div>
          <pre className="h-[70vh] overflow-auto rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
            <code>{file.code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default GeneratorPage
