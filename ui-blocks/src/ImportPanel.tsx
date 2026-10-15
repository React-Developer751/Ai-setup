// "Import data": bring data from outside (a WordPress export, a users list, a spreadsheet, an article ...). The import brain
// (generator/dataImport.ts) works out what it is, shows what it understood, and after a click the generator uses it.
import { useMemo, useState } from 'react'
import { analyzeImport, textsToUnderstand, type Choice, type ImportReport, type RawPool } from './generator/dataImport'
import { smartStatus, understandKinds } from './generator/ml/smart'
import { getImported, getPool, mergedPoolJson, setImported, setPoolMode } from './generator/dataPool'
import { THEME_KEYS } from './generator/themes'
import { downloadFile } from './generator/zip'

const CHOICES: { value: Choice; label: string }[] = [
  { value: 'posts', label: 'Blog posts' },
  { value: 'team', label: 'Team / people' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'faq', label: 'FAQ' },
  { value: 'gallery', label: 'Gallery captions' },
  { value: 'business', label: 'Business profile' },
  { value: 'skip', label: 'Do not import' },
]

const SECTION_LABEL: Record<keyof RawPool, string> = { posts: 'posts', team: 'people', reviews: 'reviews', faq: 'FAQ', gallery: 'captions', businesses: 'businesses' }

const countOf = (pool: Partial<RawPool> | null) =>
  pool
    ? (Object.keys(SECTION_LABEL) as (keyof RawPool)[])
        .filter((key) => pool[key]?.length)
        .map((key) => `${pool[key]!.length} ${SECTION_LABEL[key]}`)
        .join(' · ')
    : ''

type Source = { name: string; text: string }

function ImportPanel() {
  const [open, setOpen] = useState(false)
  const [pasted, setPasted] = useState('')
  const [files, setFiles] = useState<Source[]>([])
  const [scope, setScope] = useState<'auto' | 'all' | string>('auto')
  const [minRating, setMinRating] = useState(3.5)
  const [overrides, setOverrides] = useState<Record<string, Choice>>({})
  const [report, setReport] = useState<ImportReport | null>(null)
  const [message, setMessage] = useState('')
  const [, refresh] = useState(0)

  const sources = useMemo<Source[]>(() => [...files, ...(pasted.trim() ? [{ name: '', text: pasted }] : [])], [files, pasted])
  const imported = getImported()
  const total = report ? (Object.values(report.pool) as unknown[][]).reduce((sum, list) => sum + list.length, 0) : 0

  const run = async (nextOverrides: Record<string, Choice>) => {
    // with "smart understanding" on, the embedding model reads the texts first (it recognises what a text is by its meaning)
    if (smartStatus().status === 'ready') await understandKinds(textsToUnderstand(sources))
    setReport(analyzeImport(sources, { scope: scope as 'auto' | 'all', overrides: nextOverrides, minRating }))
    setMessage('')
  }

  const readFiles = async (list: FileList | null) => {
    if (!list) return
    const read = await Promise.all([...list].map(async (file) => ({ name: file.name, text: await file.text() })))
    setFiles(read)
    setReport(null)
    setOverrides({})
  }

  const use = () => {
    if (!report) return
    // what was imported before stays; the same entries are not added twice (the pool merges by title, name, question ...)
    const merged = { ...(imported ?? {}) } as Partial<RawPool>
    for (const key of Object.keys(report.pool) as (keyof RawPool)[]) merged[key] = [...(merged[key] ?? []), ...report.pool[key]]
    const problem = setImported(merged)
    setMessage(problem ?? `Added to the generator: ${countOf(report.pool) || 'nothing new'}. Generate again to see it.`)
    setReport(null)
    setFiles([])
    setPasted('')
    refresh((n) => n + 1)
  }

  return (
    <div className="basis-full space-y-3">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
        Import data {imported ? `(${countOf(imported)})` : ''} {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-xs text-gray-500">
            Bring blog posts, users, reviews, FAQs, photos captions or a business profile from anywhere: JSON (WordPress, an API, your own), CSV, Markdown or plain text. The brain works out what each part is,
            cleans it (HTML, links, emails and phone numbers are removed) and shows you what it understood. You can correct it before it is used.
            Switch on <b>Smart understanding</b> (below the prompt) and it also reads the texts by their meaning, which recognises far more.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="font-medium text-gray-700">Files</span>
              <input type="file" multiple accept=".json,.csv,.tsv,.md,.markdown,.txt,.html,.htm,.jsonl" onChange={(e) => readFiles(e.target.files)} className="block w-full text-xs" />
              {files.length > 0 && <span className="text-xs text-gray-500">{files.map((f) => f.name).join(', ')}</span>}
            </label>
            <label className="space-y-1">
              <span className="font-medium text-gray-700">or paste data</span>
              <textarea value={pasted} onChange={(e) => (setPasted(e.target.value), setReport(null))} rows={3} placeholder='[{"title": "...", "content": "..."}]' className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs" />
            </label>
            <label className="space-y-1">
              <span className="font-medium text-gray-700">Use for</span>
              <select value={scope} onChange={(e) => (setScope(e.target.value), setReport(null))} className="w-full rounded-md border border-gray-300 px-2 py-1.5">
                <option value="auto">The businesses it fits (decided from its own words)</option>
                <option value="all">Every business</option>
                {THEME_KEYS.map((key) => (
                  <option key={key} value={key}>
                    Only {key.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="font-medium text-gray-700">Leave out reviews rated below {minRating} of 5</span>
              <input type="range" min={1} max={5} step={0.5} value={minRating} onChange={(e) => (setMinRating(Number(e.target.value)), setReport(null))} className="w-full" />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={!sources.length} onClick={() => void run(overrides)} className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
              Analyse
            </button>
            {report && (
              <button type="button" disabled={!total} onClick={use} className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-40">
                Use {total} entr{total === 1 ? 'y' : 'ies'} in the generator
              </button>
            )}
            {message && <span className="text-xs text-emerald-700">{message}</span>}
          </div>

          {report && (
            <div className="space-y-2">
              {report.collections.length === 0 && <p className="text-xs text-amber-700">Nothing readable found.</p>}
              {report.collections.map((collection) => (
                <div key={collection.id} className="space-y-1 rounded-md border border-gray-200 bg-white p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-600">
                      {collection.source || 'pasted'} › {collection.path}
                    </span>
                    <span className="text-xs text-gray-400">{collection.rows} rows</span>
                    <select
                      value={collection.kind}
                      onChange={(e) => {
                        const next = { ...overrides, [collection.id]: e.target.value as Choice }
                        setOverrides(next)
                        void run(next)
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      aria-label={`What ${collection.path} is`}
                    >
                      {CHOICES.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${collection.confidence >= 75 ? 'bg-emerald-100 text-emerald-800' : collection.confidence >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                      {collection.confidence}% sure
                    </span>
                    {collection.kind !== 'skip' && <b className="text-xs text-gray-700">{collection.imported} imported</b>}
                  </div>
                  {Object.keys(collection.fields).length > 0 && (
                    <p className="text-xs text-gray-500">
                      Read from: {Object.entries(collection.fields).map(([part, field]) => `${part} ← ${field}`).join(' · ')}
                    </p>
                  )}
                  {collection.skipped.length > 0 && <p className="text-xs text-amber-700">Left out: {collection.skipped.map((s) => `${s.count} × ${s.reason}`).join(', ')}</p>}
                  {collection.notes.map((note) => (
                    <p key={note} className="text-xs text-indigo-700">
                      {note}
                    </p>
                  ))}
                  {collection.samples.length > 0 && <p className="truncate text-xs text-gray-400">e.g. {collection.samples.join(' · ')}</p>}
                </div>
              ))}
              {report.warnings.map((warning) => (
                <p key={warning} className="text-xs text-amber-700">
                  {warning}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
            <span className="text-xs text-gray-500">
              In use now: <b className="text-gray-700">{countOf({ posts: getPool().posts as never, team: getPool().team as never, reviews: getPool().reviews as never, faq: getPool().faq as never, gallery: getPool().gallery as never, businesses: getPool().businesses as never }) || 'nothing'}</b>
            </span>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              Mode
              <select
                value={getPool().mode}
                onChange={(e) => (setPoolMode(e.target.value as 'pool-first' | 'only'), refresh((n) => n + 1))}
                className="rounded-md border border-gray-300 px-2 py-1"
              >
                <option value="pool-first">your data first, the generator fills the rest</option>
                <option value="only">only your data where there is some</option>
              </select>
            </label>
            <button type="button" onClick={() => downloadFile('dataPool.json', `${JSON.stringify(mergedPoolJson(), null, 2)}\n`, 'application/json')} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
              Download dataPool.json
            </button>
            {imported && (
              <button
                type="button"
                onClick={() => (setImported(null), setMessage('Imported entries removed.'), refresh((n) => n + 1))}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Remove imported entries
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Imported entries stay in this browser. To keep them in the project, download the file and save it as <code>src/data/dataPool.json</code>, or use <code>npm run pool:import -- yourfile.json</code>.</p>
        </div>
      )}
    </div>
  )
}

export default ImportPanel
