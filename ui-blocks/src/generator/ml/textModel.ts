// A small text classifier learned from examples (multinomial Naive Bayes over words, word pairs and letter groups).
// Why this one: it trains in a second, works with a few hundred examples per label, and can LEARN ONE MORE EXAMPLE on the spot
// (a correction typed in the page) without training again. No library, no network: it is a count table and a bit of arithmetic.
import { DEFAULT_WEIGHTS, featuresOf, type FeatureWeights } from './textFeatures'

export type Example = { text: string; label: string }

export type ModelFile = {
  version: 1
  labels: string[]
  /** smoothing */
  alpha: number
  /** divides the log-scores before they become probabilities (Naive Bayes is over-confident without it) */
  temperature: number
  weights: FeatureWeights
  /** total feature weight seen for every label */
  totals: number[]
  vocabSize: number
  /** feature -> [labelIndex, weight, labelIndex, weight ...] */
  features: Record<string, number[]>
  trainedOn: number
}

export type Prediction = { label: string; probability: number; probabilities: Record<string, number> }

export class TextModel {
  labels: string[]
  alpha: number
  temperature: number
  weights: FeatureWeights
  totals: Float64Array
  counts = new Map<string, Float64Array>()
  trainedOn: number

  constructor(file: ModelFile) {
    this.labels = file.labels
    this.alpha = file.alpha
    this.temperature = file.temperature
    this.weights = file.weights
    this.totals = Float64Array.from(file.totals)
    this.trainedOn = file.trainedOn
    for (const [feature, pairs] of Object.entries(file.features)) {
      const row = new Float64Array(this.labels.length)
      for (let i = 0; i < pairs.length; i += 2) row[pairs[i]] = pairs[i + 1]
      this.counts.set(feature, row)
    }
  }

  /** features seen in training count for the vocabulary size (it keeps the smoothing honest) */
  get vocabSize() {
    return this.counts.size
  }

  /** log-score of every label for a text */
  private scores(text: string): { scores: Float64Array; weight: number } {
    const features = featuresOf(text, this.weights)
    const scores = new Float64Array(this.labels.length)
    const vocab = Math.max(this.vocabSize, 1)
    let weight = 0
    for (const [feature, w] of features) {
      const row = this.counts.get(feature)
      // a feature the model has never seen says nothing about any label
      if (!row) continue
      weight += w
      for (let l = 0; l < this.labels.length; l++) {
        scores[l] += w * Math.log((row[l] + this.alpha) / (this.totals[l] + this.alpha * vocab))
      }
    }
    return { scores, weight }
  }

  predict(text: string): Prediction {
    const { scores, weight } = this.scores(text)
    if (weight === 0) {
      // nothing recognisable: no opinion (equal probabilities)
      const even = 1 / this.labels.length
      return { label: this.labels[0], probability: even, probabilities: Object.fromEntries(this.labels.map((label) => [label, even])) }
    }
    // longer texts have more evidence: dividing by the square root of the weight keeps a long text from always being "certain"
    const scaled = Array.from(scores, (score) => score / (this.temperature * Math.sqrt(weight)))
    const max = Math.max(...scaled)
    const exp = scaled.map((s) => Math.exp(s - max))
    const sum = exp.reduce((a, b) => a + b, 0)
    const probabilities = Object.fromEntries(this.labels.map((label, i) => [label, exp[i] / sum]))
    let best = 0
    for (let i = 1; i < exp.length; i++) if (exp[i] > exp[best]) best = i
    return { label: this.labels[best], probability: exp[best] / sum, probabilities }
  }

  /** learn one more example right now. `repeat` makes a correction count as if it had been seen several times. */
  learn(text: string, label: string, repeat = 4) {
    const index = this.labels.indexOf(label)
    if (index < 0) return
    for (const [feature, w] of featuresOf(text, this.weights)) {
      let row = this.counts.get(feature)
      if (!row) {
        row = new Float64Array(this.labels.length)
        this.counts.set(feature, row)
      }
      row[index] += w * repeat
      this.totals[index] += w * repeat
    }
    this.trainedOn += repeat
  }

  toFile(): ModelFile {
    const features: Record<string, number[]> = {}
    for (const [feature, row] of this.counts) {
      const pairs: number[] = []
      row.forEach((value, l) => {
        if (value > 0) pairs.push(l, Math.round(value * 100) / 100)
      })
      features[feature] = pairs
    }
    return { version: 1, labels: this.labels, alpha: this.alpha, temperature: this.temperature, weights: this.weights, totals: Array.from(this.totals, (t) => Math.round(t * 100) / 100), vocabSize: this.vocabSize, features, trainedOn: this.trainedOn }
  }
}

export type TrainOptions = { alpha?: number; temperature?: number; weights?: FeatureWeights; minWeight?: number }

/** Counts the features of every example per label. Features seen with less total weight than `minWeight` are dropped (noise, typos). */
export function trainModel(examples: Example[], options: TrainOptions = {}): TextModel {
  const labels = [...new Set(examples.map((e) => e.label))].sort()
  const weights = options.weights ?? DEFAULT_WEIGHTS
  const sums = new Map<string, Float64Array>()
  for (const example of examples) {
    const l = labels.indexOf(example.label)
    for (const [feature, w] of featuresOf(example.text, weights)) {
      let row = sums.get(feature)
      if (!row) {
        row = new Float64Array(labels.length)
        sums.set(feature, row)
      }
      row[l] += w
    }
  }
  const min = options.minWeight ?? 1.5
  const features: Record<string, number[]> = {}
  const totals = new Array<number>(labels.length).fill(0)
  for (const [feature, row] of sums) {
    const total = row.reduce((a, b) => a + b, 0)
    if (total < min) continue
    const pairs: number[] = []
    row.forEach((value, l) => {
      if (value > 0) {
        pairs.push(l, Math.round(value * 100) / 100)
        totals[l] += value
      }
    })
    features[feature] = pairs
  }
  return new TextModel({ version: 1, labels, alpha: options.alpha ?? 0.1, temperature: options.temperature ?? 1, weights, totals, vocabSize: Object.keys(features).length, features, trainedOn: examples.length })
}

/** accuracy and the confusion of a model on labelled examples */
export function evaluate(model: TextModel, examples: Example[]) {
  let right = 0
  let logLoss = 0
  const confusion = new Map<string, number>()
  const perLabel = new Map<string, { tp: number; fp: number; fn: number }>()
  const stat = (label: string) => perLabel.get(label) ?? perLabel.set(label, { tp: 0, fp: 0, fn: 0 }).get(label)!
  const errors: { text: string; label: string; predicted: string; probability: number }[] = []
  for (const example of examples) {
    const prediction = model.predict(example.text)
    const ok = prediction.label === example.label
    if (ok) {
      right++
      stat(example.label).tp++
    } else {
      stat(example.label).fn++
      stat(prediction.label).fp++
      confusion.set(`${example.label} -> ${prediction.label}`, (confusion.get(`${example.label} -> ${prediction.label}`) ?? 0) + 1)
      errors.push({ text: example.text, label: example.label, predicted: prediction.label, probability: prediction.probability })
    }
    logLoss -= Math.log(Math.max(prediction.probabilities[example.label] ?? 1e-9, 1e-9))
  }
  return { accuracy: right / (examples.length || 1), logLoss: logLoss / (examples.length || 1), confusion: [...confusion].sort((a, b) => b[1] - a[1]), perLabel, errors, count: examples.length }
}
