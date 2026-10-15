// What KIND of content is a piece of text: a blog post, a review, a FAQ entry, a team member, a gallery caption, a business
// description? Two opinions: the Naive Bayes model (always available, weaker) and the meaning of the text through the embedding
// model (strong, only when it was switched on and the text was embedded). The importer asks `kindDistribution`.
import { hasKindModel, predictKindText } from './learned'
import { normalizeText } from './textFeatures'

export type KindOpinion = { distribution: Record<string, number>; source: 'meaning' | 'learned' }

const meaning = new Map<string, Record<string, number>>()

/** remember what the embedding model said about a text (called by smart.ts, or by a script that embeds in Node) */
export const rememberKind = (text: string, distribution: Record<string, number>) => {
  meaning.set(normalizeText(text), distribution)
}

export const kindDistribution = (text: string): KindOpinion | undefined => {
  const known = meaning.get(normalizeText(text))
  if (known) return { distribution: known, source: 'meaning' }
  if (hasKindModel() && text.trim()) return { distribution: predictKindText(text).probabilities, source: 'learned' }
  return undefined
}

export const clearKindMemory = () => meaning.clear()
