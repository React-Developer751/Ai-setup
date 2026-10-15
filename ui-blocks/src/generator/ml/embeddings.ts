// Understanding by meaning (Path B). A small sentence-embedding model (MiniLM, 23 MB, runs in the browser with WebAssembly; no
// server, no API, no key) turns a text into a list of 384 numbers. Texts with a similar meaning get similar numbers, so
// "tooth doctor", "dental clinic" and "dentist" end up close to each other even though they share no word.
//
// The business-type decision then asks: "which labelled examples from the training data are closest to this prompt?" (k nearest
// neighbours over the example vectors that scripts/build-embeddings.mjs stored in public/models/vectors/).
//
// The model is loaded lazily, the first time it is needed; until then (or if it cannot load) everything keeps working without it.

export type Vectors = { dim: number; labels: string[]; items: number[]; data: Int8Array }

type Extractor = (texts: string | string[], options: { pooling: 'mean'; normalize: boolean }) => Promise<{ data: Float32Array; dims: number[] }>

export type EmbedOptions = {
  /** where the model folders are: "/models/" in the page, "public/models/" in Node */
  localModelPath: string
  /** where the WebAssembly files are (page only) */
  wasmPaths?: { mjs: string; wasm: string }
  model?: string
  /** text put in front of every text before embedding (some models need it) */
  prefix?: string
}

export const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'

let loadedModel = ''

let extractorPromise: Promise<Extractor> | undefined

/** loads the model once; later calls get the same one */
export function loadEmbedder(options: EmbedOptions): Promise<Extractor> {
  // asking for another model than the loaded one starts a new load
  if (loadedModel && loadedModel !== (options.model ?? MODEL_NAME)) extractorPromise = undefined
  loadedModel = options.model ?? MODEL_NAME
  extractorPromise ??= (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowRemoteModels = false
    env.allowLocalModels = true
    env.localModelPath = options.localModelPath
    if (options.wasmPaths && env.backends.onnx.wasm) env.backends.onnx.wasm.wasmPaths = options.wasmPaths
    return (await pipeline('feature-extraction', options.model ?? MODEL_NAME, { dtype: 'q8' })) as unknown as Extractor
  })()
  // a failed load can be tried again later
  extractorPromise.catch(() => (extractorPromise = undefined))
  return extractorPromise
}

/** unit-length vectors for the texts */
export async function embed(texts: string[], options: EmbedOptions): Promise<Float32Array[]> {
  const extractor = await loadEmbedder(options)
  const out: Float32Array[] = []
  // small batches keep memory low and the page responsive
  for (let at = 0; at < texts.length; at += 16) {
    const batch = texts.slice(at, at + 16).map((text) => `${options.prefix ?? ''}${text}`)
    const tensor = await extractor(batch, { pooling: 'mean', normalize: true })
    const dim = tensor.dims[tensor.dims.length - 1]
    for (let i = 0; i < batch.length; i++) out.push(tensor.data.slice(i * dim, (i + 1) * dim))
  }
  return out
}

// ───────────── the stored example vectors ─────────────
/** vectors are kept as 8-bit numbers (a quarter of the size, the same neighbours) */
export const quantize = (vector: Float32Array) => Int8Array.from(vector, (v) => Math.max(-127, Math.min(127, Math.round(v * 127))))

export function packVectors(labels: string[], items: { label: string; vector: Float32Array }[]) {
  const dim = items[0].vector.length
  const data = new Int8Array(items.length * dim)
  items.forEach((item, i) => data.set(quantize(item.vector), i * dim))
  return { dim, labels, items: items.map((item) => labels.indexOf(item.label)), data: Buffer.from(data.buffer).toString('base64') }
}

export function unpackVectors(file: { dim: number; labels: string[]; items: number[]; data: string }): Vectors {
  const binary = atob(file.data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { dim: file.dim, labels: file.labels, items: file.items, data: new Int8Array(bytes.buffer) }
}

/** k nearest labelled examples -> a probability for every label (closer examples count more) */
export function nearest(vector: Float32Array, vectors: Vectors, k = 9, sharpness = 12, exclude = -1): Record<string, number> {
  const { dim, items, data, labels } = vectors
  const best: { sim: number; label: number }[] = []
  for (let i = 0; i < items.length; i++) {
    // (used to test on the training examples themselves: an example must not vote for itself)
    if (i === exclude) continue
    let dot = 0
    const offset = i * dim
    for (let d = 0; d < dim; d++) dot += vector[d] * data[offset + d]
    const sim = dot / 127
    if (best.length < k || sim > best[best.length - 1].sim) {
      best.push({ sim, label: items[i] })
      best.sort((a, b) => b.sim - a.sim)
      if (best.length > k) best.pop()
    }
  }
  const score = new Array<number>(labels.length).fill(0)
  for (const { sim, label } of best) score[label] += Math.exp(sharpness * (sim - best[0].sim))
  const total = score.reduce((a, b) => a + b, 0) || 1
  return Object.fromEntries(labels.map((label, i) => [label, score[i] / total]))
}
