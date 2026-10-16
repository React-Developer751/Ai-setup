// "Smart understanding": the embedding model, switched on from the page. Its files (23 or 118 MB) are served from /models/, so
// they are loaded only after the person turns it on, and only once. What the model works out is remembered per text, because the
// generators and the importer that use it are synchronous: the page first calls `understand(...)` (async), then generates.
import { embed, nearest, unpackVectors, type EmbedOptions, type Vectors } from './embeddings'
import { rememberKind } from './kinds'
import { Probe, type ProbeFile } from './linearProbe'
import { ACTIVE_MODEL, EMBEDDING_MODELS } from './models'
import { normalizeText } from './textFeatures'

export type SmartStatus = 'off' | 'loading' | 'ready' | 'error'

const STORE = 'website-generator-smart'
const MODEL_STORE = 'website-generator-smart-model'

let status: SmartStatus = 'off'
let detail = ''
let version = 0
let modelKey = ACTIVE_MODEL
const listeners = new Set<() => void>()

const storage = () => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}
const saved = storage()?.getItem(MODEL_STORE)
if (saved && EMBEDDING_MODELS[saved]) modelKey = saved

let wasm: EmbedOptions['wasmPaths']
/** where the model files are: this site's /models/, or another address (VITE_MODELS_URL, for example a CDN) so that the 150 MB stay out of the build */
const MODELS_URL = ((import.meta as { env?: Record<string, string | undefined> }).env?.VITE_MODELS_URL ?? '/models/').replace(/\/?$/, '/')

const options = (): EmbedOptions => ({ localModelPath: MODELS_URL, wasmPaths: wasm, model: EMBEDDING_MODELS[modelKey].name, prefix: EMBEDDING_MODELS[modelKey].prefix })

const notify = () => {
  version++
  listeners.forEach((listener) => listener())
}

export const smartStatus = () => ({ status, detail, model: modelKey })
export const smartModelKey = () => modelKey
export const smartVersion = () => version
export const subscribeSmart = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
/** whether the person switched it on (remembered in this browser) */
export const smartWanted = () => storage()?.getItem(STORE) === 'on'

// ── files of the active model, loaded once per model
type Loaded = { vectors?: Promise<Vectors | undefined>; probe?: Promise<Probe | undefined> }
const files = new Map<string, Loaded>()
function fileOf(kind: 'themes' | 'kinds' | 'intents') {
  const key = `${modelKey}/${kind}`
  const entry = files.get(key) ?? {}
  entry.vectors ??= fetch(`${MODELS_URL}vectors/${modelKey}/${kind}.json`)
    .then((r) => (r.ok ? r.json() : undefined))
    .then((file) => (file ? unpackVectors(file) : undefined))
    .catch(() => undefined)
  entry.probe ??= fetch(`${MODELS_URL}vectors/${modelKey}/${kind}-probe.json`)
    .then((r) => (r.ok ? (r.json() as Promise<ProbeFile>) : undefined))
    .then((file) => (file ? new Probe(file) : undefined))
    .catch(() => undefined)
  files.set(key, entry)
  return entry as Required<Loaded>
}

// ── what the model says about a business prompt
type Smart = { meaning: Record<string, number>; probe?: Record<string, number> }
const cache = new Map<string, Smart>()
const cacheKey = (prompt: string) => `${modelKey}|${normalizeText(prompt)}`

/** the meaning-based probabilities for a prompt (nearest examples and linear probe), if they were computed already */
export const smartThemeEvidence = (prompt: string): Smart | undefined => cache.get(cacheKey(prompt))

/** computes (and remembers) the meaning-based probabilities of a prompt; resolves when done or when it is not available */
export async function understand(prompt: string): Promise<void> {
  if (status === 'off' || status === 'error' || !prompt.trim()) return
  const key = cacheKey(prompt)
  if (cache.has(key)) return
  try {
    const { vectors, probe } = fileOf('themes')
    const known = await vectors
    if (!known) throw new Error('example vectors not found (run npm run build:embeddings)')
    const [vector] = await embed([prompt], options())
    cache.set(key, { meaning: nearest(vector, known), probe: (await probe)?.predict(vector) })
    if (status !== 'ready') {
      status = 'ready'
      detail = ''
    }
    notify()
  } catch (error) {
    status = 'error'
    detail = error instanceof Error ? error.message : 'could not load'
    notify()
  }
}

/** what kind of content (post, review, FAQ ...) the texts are, by meaning: remembered for the importer */
export async function understandKinds(texts: string[]): Promise<void> {
  if (status !== 'ready' || !texts.length) return
  try {
    const { vectors, probe } = fileOf('kinds')
    const [known, trained] = await Promise.all([vectors, probe])
    if (!known) return
    const fresh = [...new Set(texts)].filter((text) => text.trim())
    const embedded = await embed(fresh, options())
    fresh.forEach((text, i) => {
      const a = nearest(embedded[i], known)
      const b = trained?.predict(embedded[i])
      rememberKind(text, Object.fromEntries(Object.keys(a).map((label) => [label, b ? (a[label] + b[label]) / 2 : a[label]])))
    })
  } catch {
    // the importer simply works without it
  }
}

/** what an edit request means ("remove the faq", "make it simpler" ...), by meaning: a probability for every intent; undefined when the model is not ready */
export async function smartIntent(text: string): Promise<Record<string, number> | undefined> {
  if (status !== 'ready' || !text.trim()) return undefined
  try {
    const { vectors, probe } = fileOf('intents')
    const [known, trained] = await Promise.all([vectors, probe])
    if (!known) return undefined
    const [vector] = await embed([text], options())
    const a = nearest(vector, known)
    const b = trained?.predict(vector)
    return Object.fromEntries(Object.keys(a).map((label) => [label, b ? (a[label] + 2 * b[label]) / 3 : a[label]]))
  } catch {
    return undefined
  }
}

/** switches the smart mode on or off; on = loads the model now. `model` picks the small (English) or the multilingual one. */
export async function setSmart(on: boolean, prompt = '', model?: string): Promise<void> {
  if (model && EMBEDDING_MODELS[model] && model !== modelKey) {
    modelKey = model
    status = status === 'ready' ? 'off' : status
    try {
      storage()?.setItem(MODEL_STORE, model)
    } catch {
      // not remembered
    }
  }
  try {
    if (on) storage()?.setItem(STORE, 'on')
    else storage()?.removeItem(STORE)
  } catch {
    // not remembered
  }
  if (!on) {
    status = 'off'
    detail = ''
    notify()
    return
  }
  if (status === 'ready') return
  status = 'loading'
  detail = `loading the model (${EMBEDDING_MODELS[modelKey].megabytes} MB, once)`
  notify()
  try {
    wasm ??= (await import('./wasmPaths')).wasmPaths
    await Promise.all([embed(['warm up'], options()), fileOf('themes').vectors, fileOf('themes').probe])
    status = 'ready'
    detail = ''
    notify()
    if (prompt) await understand(prompt)
  } catch (error) {
    status = 'error'
    detail = error instanceof Error ? error.message : 'could not load'
    notify()
  }
}
