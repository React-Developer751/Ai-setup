// A second learned text model: logistic regression (softmax) over the same word / word-pair / letter-group features.
// Naive Bayes counts; this one LEARNS WEIGHTS that separate the labels, so words that appear everywhere get little weight and
// the telling ones get a lot. It is usually clearly better when there are a few thousand examples. It can also take one more
// example on the spot (a few gradient steps), like the Naive Bayes model.
import { DEFAULT_WEIGHTS, featuresOf, type FeatureWeights } from './textFeatures'
import type { Example, Prediction } from './textModel'

/** weights smaller than this (in absolute value) are not stored: they change no decision, and the file stays small */
const PRUNE = 0.03

export type SparseFile = {
  version: 1
  labels: string[]
  weights: FeatureWeights
  /** feature -> [labelIndex, weight, ...] (only the weights that matter) */
  features: Record<string, number[]>
  bias: number[]
  temperature: number
  trainedOn: number
  /** how it was trained (so a script can train the same way again) */
  settings?: { epochs: number; rate: number; l2: number; minCount: number }
}

export class SparseModel {
  labels: string[]
  weights: FeatureWeights
  temperature: number
  settings?: SparseFile['settings']
  w = new Map<string, Float64Array>()
  bias: Float64Array
  trainedOn: number

  constructor(file: SparseFile) {
    this.labels = file.labels
    this.weights = file.weights
    this.temperature = file.temperature
    this.settings = file.settings
    this.bias = Float64Array.from(file.bias)
    this.trainedOn = file.trainedOn
    for (const [feature, pairs] of Object.entries(file.features)) {
      const row = new Float64Array(this.labels.length)
      for (let i = 0; i < pairs.length; i += 2) row[pairs[i]] = pairs[i + 1]
      this.w.set(feature, row)
    }
  }

  get vocabSize() {
    return this.w.size
  }

  private logits(features: Map<string, number>): { logits: Float64Array; known: number } {
    const logits = Float64Array.from(this.bias)
    let known = 0
    // the length of the text should not decide how sure the model is: features are scaled by 1/sqrt(total weight)
    let total = 0
    for (const v of features.values()) total += v
    const norm = 1 / Math.sqrt(Math.max(total, 1))
    for (const [feature, value] of features) {
      const row = this.w.get(feature)
      if (!row) continue
      known += value
      for (let l = 0; l < logits.length; l++) logits[l] += row[l] * value * norm
    }
    return { logits, known }
  }

  predict(text: string): Prediction {
    const { logits, known } = this.logits(featuresOf(text, this.weights))
    if (known === 0) {
      const even = 1 / this.labels.length
      return { label: this.labels[0], probability: even, probabilities: Object.fromEntries(this.labels.map((label) => [label, even])) }
    }
    const scaled = Array.from(logits, (v) => v / this.temperature)
    const max = Math.max(...scaled)
    const exp = scaled.map((v) => Math.exp(v - max))
    const sum = exp.reduce((a, b) => a + b, 0)
    let best = 0
    for (let i = 1; i < exp.length; i++) if (exp[i] > exp[best]) best = i
    return { label: this.labels[best], probability: exp[best] / sum, probabilities: Object.fromEntries(this.labels.map((label, i) => [label, exp[i] / sum])) }
  }

  /** a few gradient steps on one more example (a correction typed in the page) */
  learn(text: string, label: string, steps = 12, rate = 0.5) {
    const index = this.labels.indexOf(label)
    if (index < 0) return
    const features = featuresOf(text, this.weights)
    let total = 0
    for (const v of features.values()) total += v
    const norm = 1 / Math.sqrt(Math.max(total, 1))
    for (let step = 0; step < steps; step++) {
      const { logits } = this.logits(features)
      const max = Math.max(...logits)
      const exp = Array.from(logits, (v) => Math.exp((v - max) / this.temperature))
      const sum = exp.reduce((a, b) => a + b, 0)
      for (const [feature, value] of features) {
        let row = this.w.get(feature)
        if (!row) {
          row = new Float64Array(this.labels.length)
          this.w.set(feature, row)
        }
        for (let l = 0; l < row.length; l++) row[l] -= rate * ((exp[l] / sum - (l === index ? 1 : 0)) * value * norm)
      }
    }
    this.trainedOn += 1
  }

  toFile(): SparseFile {
    const features: Record<string, number[]> = {}
    for (const [feature, row] of this.w) {
      const pairs: number[] = []
      row.forEach((value, l) => {
        if (Math.abs(value) >= PRUNE) pairs.push(l, Math.round(value * 100) / 100)
      })
      if (pairs.length) features[feature] = pairs
    }
    return { version: 1, labels: this.labels, weights: this.weights, features, bias: Array.from(this.bias, (b) => Math.round(b * 1000) / 1000), temperature: this.temperature, trainedOn: this.trainedOn, settings: this.settings }
  }
}

export type SparseTrainOptions = { epochs?: number; rate?: number; l2?: number; weights?: FeatureWeights; minCount?: number; temperature?: number }

/** Adam on the cross-entropy, in mini-batches. Features that occur in fewer than `minCount` examples are ignored. */
export function trainSparse(examples: Example[], options: SparseTrainOptions = {}): SparseModel {
  const labels = [...new Set(examples.map((e) => e.label))].sort()
  const weights = options.weights ?? DEFAULT_WEIGHTS
  const epochs = options.epochs ?? 40
  const rate = options.rate ?? 0.08
  const l2 = options.l2 ?? 2e-5
  const minCount = options.minCount ?? 2
  const docs = examples.map((e) => ({ features: featuresOf(e.text, weights), y: labels.indexOf(e.label) }))
  const counts = new Map<string, number>()
  for (const doc of docs) for (const feature of doc.features.keys()) counts.set(feature, (counts.get(feature) ?? 0) + 1)
  const index = new Map<string, number>()
  for (const [feature, count] of counts) if (count >= minCount) index.set(feature, index.size)
  const L = labels.length
  const V = index.size
  const w = new Float64Array(V * L)
  const m = new Float64Array(V * L)
  const v = new Float64Array(V * L)
  const bias = new Float64Array(L)
  const mb = new Float64Array(L)
  const vb = new Float64Array(L)
  const prepared = docs.map((doc) => {
    let total = 0
    for (const value of doc.features.values()) total += value
    const norm = 1 / Math.sqrt(Math.max(total, 1))
    const ids: number[] = []
    const values: number[] = []
    for (const [feature, value] of doc.features) {
      const id = index.get(feature)
      if (id !== undefined) {
        ids.push(id)
        values.push(value * norm)
      }
    }
    return { ids, values, y: doc.y }
  })
  let seed = 11
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  const order = prepared.map((_, i) => i)
  const batch = 64
  let t = 0
  for (let epoch = 0; epoch < epochs; epoch++) {
    order.sort(() => rand() - 0.5)
    for (let start = 0; start < order.length; start += batch) {
      const grad = new Map<number, Float64Array>()
      const gradBias = new Float64Array(L)
      const slice = order.slice(start, start + batch)
      for (const i of slice) {
        const doc = prepared[i]
        const logits = Float64Array.from(bias)
        for (let k = 0; k < doc.ids.length; k++) for (let l = 0; l < L; l++) logits[l] += w[doc.ids[k] * L + l] * doc.values[k]
        const max = Math.max(...logits)
        let sum = 0
        const p = Array.from(logits, (x) => {
          const e = Math.exp(x - max)
          sum += e
          return e
        })
        for (let l = 0; l < L; l++) {
          const error = p[l] / sum - (l === doc.y ? 1 : 0)
          gradBias[l] += error / slice.length
          for (let k = 0; k < doc.ids.length; k++) {
            let row = grad.get(doc.ids[k])
            if (!row) {
              row = new Float64Array(L)
              grad.set(doc.ids[k], row)
            }
            row[l] += (error * doc.values[k]) / slice.length
          }
        }
      }
      t++
      const c1 = 1 - 0.9 ** t
      const c2 = 1 - 0.999 ** t
      for (const [id, row] of grad) {
        for (let l = 0; l < L; l++) {
          const at = id * L + l
          const g = row[l] + l2 * w[at]
          m[at] = 0.9 * m[at] + 0.1 * g
          v[at] = 0.999 * v[at] + 0.001 * g * g
          w[at] -= (rate * (m[at] / c1)) / (Math.sqrt(v[at] / c2) + 1e-8)
        }
      }
      for (let l = 0; l < L; l++) {
        mb[l] = 0.9 * mb[l] + 0.1 * gradBias[l]
        vb[l] = 0.999 * vb[l] + 0.001 * gradBias[l] * gradBias[l]
        bias[l] -= (rate * (mb[l] / c1)) / (Math.sqrt(vb[l] / c2) + 1e-8)
      }
    }
  }
  const features: Record<string, number[]> = {}
  for (const [feature, id] of index) {
    const pairs: number[] = []
    for (let l = 0; l < L; l++) if (Math.abs(w[id * L + l]) >= PRUNE) pairs.push(l, Math.round(w[id * L + l] * 100) / 100)
    if (pairs.length) features[feature] = pairs
  }
  return new SparseModel({ version: 1, labels, weights, features, bias: Array.from(bias, (b) => Math.round(b * 100) / 100), temperature: options.temperature ?? 1, trainedOn: examples.length, settings: { epochs, rate, l2, minCount } })
}
