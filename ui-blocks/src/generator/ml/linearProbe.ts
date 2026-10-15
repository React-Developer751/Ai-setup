// A linear "probe" on top of the embedding vectors: one weight vector per label (softmax regression). It learns from the
// labelled example vectors which directions of "meaning" belong to which business type, so it also works for phrasings that are
// not close to any single example. It is tiny (20 labels x 384 numbers) and the answer is one matrix product.
export type ProbeFile = { version: 1; labels: string[]; dim: number; weights: number[]; bias: number[]; scale: number }

export type ProbeOptions = { epochs?: number; learningRate?: number; l2?: number; scale?: number }

const softmax = (logits: Float64Array) => {
  let max = -Infinity
  for (const v of logits) if (v > max) max = v
  let sum = 0
  const out = new Float64Array(logits.length)
  for (let i = 0; i < logits.length; i++) {
    out[i] = Math.exp(logits[i] - max)
    sum += out[i]
  }
  for (let i = 0; i < out.length; i++) out[i] /= sum
  return out
}

export class Probe {
  file: ProbeFile

  constructor(file: ProbeFile) {
    this.file = file
  }

  get labels() {
    return this.file.labels
  }

  predict(vector: ArrayLike<number>): Record<string, number> {
    const { labels, dim, weights, bias, scale } = this.file
    const logits = new Float64Array(labels.length)
    for (let l = 0; l < labels.length; l++) {
      let sum = bias[l]
      const offset = l * dim
      for (let d = 0; d < dim; d++) sum += weights[offset + d] * vector[d] * scale
      logits[l] = sum
    }
    const probabilities = softmax(logits)
    return Object.fromEntries(labels.map((label, i) => [label, probabilities[i]]))
  }
}

/** Adam on the cross-entropy loss, full batch (a few thousand examples: it takes a second). */
export function trainProbe(vectors: ArrayLike<number>[], labelsOf: string[], options: ProbeOptions = {}): Probe {
  const labels = [...new Set(labelsOf)].sort()
  const dim = vectors[0].length
  const n = vectors.length
  const epochs = options.epochs ?? 300
  const lr = options.learningRate ?? 0.05
  const l2 = options.l2 ?? 1e-4
  const scale = options.scale ?? 8
  const y = labelsOf.map((label) => labels.indexOf(label))
  const w = new Float64Array(labels.length * dim)
  const b = new Float64Array(labels.length)
  const mW = new Float64Array(w.length)
  const vW = new Float64Array(w.length)
  const mB = new Float64Array(b.length)
  const vB = new Float64Array(b.length)
  const gW = new Float64Array(w.length)
  const gB = new Float64Array(b.length)
  for (let epoch = 1; epoch <= epochs; epoch++) {
    gW.fill(0)
    gB.fill(0)
    for (let i = 0; i < n; i++) {
      const x = vectors[i]
      const logits = new Float64Array(labels.length)
      for (let l = 0; l < labels.length; l++) {
        let sum = b[l]
        const offset = l * dim
        for (let d = 0; d < dim; d++) sum += w[offset + d] * x[d] * scale
        logits[l] = sum
      }
      const p = softmax(logits)
      for (let l = 0; l < labels.length; l++) {
        const error = p[l] - (l === y[i] ? 1 : 0)
        gB[l] += error / n
        const offset = l * dim
        for (let d = 0; d < dim; d++) gW[offset + d] += (error * x[d] * scale) / n
      }
    }
    const correction1 = 1 - 0.9 ** epoch
    const correction2 = 1 - 0.999 ** epoch
    for (let i = 0; i < w.length; i++) {
      const g = gW[i] + l2 * w[i]
      mW[i] = 0.9 * mW[i] + 0.1 * g
      vW[i] = 0.999 * vW[i] + 0.001 * g * g
      w[i] -= (lr * (mW[i] / correction1)) / (Math.sqrt(vW[i] / correction2) + 1e-8)
    }
    for (let i = 0; i < b.length; i++) {
      mB[i] = 0.9 * mB[i] + 0.1 * gB[i]
      vB[i] = 0.999 * vB[i] + 0.001 * gB[i] * gB[i]
      b[i] -= (lr * (mB[i] / correction1)) / (Math.sqrt(vB[i] / correction2) + 1e-8)
    }
  }
  const round = (v: number) => Math.round(v * 1e5) / 1e5
  return new Probe({ version: 1, labels, dim, weights: Array.from(w, round), bias: Array.from(b, round), scale })
}
