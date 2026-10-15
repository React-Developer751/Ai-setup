// Puts the opinions together. Three sources can speak about the business type of a prompt:
//   rules     the keyword lists (themeClassifier.ts): precise on the words they know, silent on the rest
//   learned   the Naive Bayes model trained on the examples: knows many phrasings, spelling variants and romanised Hindi
//   meaning   the embedding model: knows what the words MEAN. Two readings of the same vector: the nearest labelled
//             examples ("meaning") and a linear probe trained on all of them ("probe")
// Each gives a probability for every business type; they are averaged with weights that scripts/eval-models.mjs picked on the
// training data (never on the test data). A source with nothing to say (no keyword matched, model not loaded) is left out.
export type Distribution = Record<string, number>

export type Weights = { rules: number; learned: number; meaning: number; probe: number }
export const DEFAULT_WEIGHTS: Weights = { rules: 0.5, learned: 0.5, meaning: 1, probe: 1 }

/** keyword scores -> probabilities; `undefined` when no keyword matched at all */
export function ruleDistribution(scores: Record<string, number>, sharpness = 1.2): Distribution | undefined {
  const entries = Object.entries(scores)
  const max = Math.max(...entries.map(([, s]) => s))
  if (!(max > 0)) return undefined
  const exp = entries.map(([label, s]) => [label, Math.exp(sharpness * (s - max))] as const)
  const sum = exp.reduce((a, [, e]) => a + e, 0)
  return Object.fromEntries(exp.map(([label, e]) => [label, e / sum]))
}

export type Evidence = { rules?: Distribution; learned?: Distribution; meaning?: Distribution; probe?: Distribution }

export function blend(evidence: Evidence, weights: Weights = DEFAULT_WEIGHTS): { probabilities: Distribution; label: string; confidence: number; sources: string[] } | undefined {
  const parts = (['rules', 'learned', 'meaning', 'probe'] as const).flatMap((source) => (evidence[source] ? [{ source, dist: evidence[source]!, weight: weights[source] ?? 0 }] : []))
  if (!parts.length) return undefined
  const total = parts.reduce((a, p) => a + p.weight, 0) || 1
  const probabilities: Distribution = {}
  for (const { dist, weight } of parts) for (const [label, p] of Object.entries(dist)) probabilities[label] = (probabilities[label] ?? 0) + (p * weight) / total
  const [label, confidence] = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0]
  return { probabilities, label, confidence, sources: parts.map((p) => p.source) }
}
