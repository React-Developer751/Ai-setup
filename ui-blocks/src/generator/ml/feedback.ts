// What the person tells the generator, kept in this browser: "this business type is wrong, it is X" (becomes a training example) and
// a thumbs up / down for a generated site. Download the files and feed them to `npm run train -- --feedback=...` so the next
// training learns from them.
export type ThemeCorrectionEvent = { type: 'theme'; at: string; text: string; predicted: string; label: string }
export type RatingEvent = { type: 'rating'; at: string; text: string; theme: string; tier: string; variation: number; layout: string; good: boolean }
export type FeedbackEvent = ThemeCorrectionEvent | RatingEvent

const STORE = 'website-generator-feedback'

const storage = () => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

let events: FeedbackEvent[] = []
try {
  events = JSON.parse(storage()?.getItem(STORE) ?? '[]') as FeedbackEvent[]
} catch {
  events = []
}

export const getFeedback = () => events

type NewEvent = Omit<ThemeCorrectionEvent, 'at'> | Omit<RatingEvent, 'at'>

export function addFeedback(input: NewEvent) {
  const event = { ...input, at: new Date().toISOString() } as FeedbackEvent
  // one rating per site (same text, theme, tier and variation): the last one counts
  if (event.type === 'rating') events = events.filter((e) => !(e.type === 'rating' && e.text === event.text && e.theme === event.theme && e.tier === event.tier && e.variation === event.variation))
  events = [...events, event].slice(-2000)
  try {
    storage()?.setItem(STORE, JSON.stringify(events))
  } catch {
    // kept in memory until the page is closed
  }
}

export const clearFeedback = () => {
  events = []
  try {
    storage()?.removeItem(STORE)
  } catch {
    // nothing to remove
  }
}

/** corrections as training examples: {"text": ..., "label": ...} per line (the format of `npm run train -- --feedback=`) */
export const correctionsJsonl = () =>
  events
    .filter((e): e is ThemeCorrectionEvent => e.type === 'theme')
    .map((e) => JSON.stringify({ text: e.text, label: e.label }))
    .join('\n')

export const ratingsJsonl = () =>
  events
    .filter((e): e is RatingEvent => e.type === 'rating')
    .map((e) => JSON.stringify(e))
    .join('\n')
