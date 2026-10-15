// What the copywriting brain knows about one kind of business.
//
// Words are grouped by what they ARE, so a sentence can only combine words that fit together:
//   thing   : something you can make, run or buy        ("Workflows", "Collections")
//   quality : an abstract quality                      ("Reliability", "Elegance")
//   group   : people                                   ("Teams", "Collectors")
// A verb that works with things ("Automate") is never paired with a quality, and an adjective for qualities
// ("Rock-Solid") is never put in front of people. That is what keeps the generated titles sensible.
export type Kind = 'thing' | 'quality' | 'group'

export type ByKind<T> = { thing: T[]; quality: T[]; group?: T[] }

export type Lexicon = {
  // ── words for headlines and generated sentences
  nouns: ByKind<string>
  adjectives: ByKind<string>
  /** base-form verbs: "Automate" */
  verbs: ByKind<string>
  /** phrases that read well after a noun: "Instantly", "For The Connoisseur" */
  benefits: string[]
  /** who the page talks to (lower case): "growing teams" */
  audiences: string[]
  /** how the team behaves (lower case, after "a team that"): "ships every week" */
  promises: string[]
  /** call-to-action button labels */
  buttons: string[]

  // ── hand-written sentences the brain picks from and mixes with generated ones
  /** [title, text] */
  features: [string, string][]
  /** each entry is one complete flow of steps: [title, text][] */
  steps: [string, string][][]
  /** [value, label] */
  stats: [string, string][]
  /** [question, answer] ("{brand}" is replaced by the business name) */
  faq: [string, string][]
  perks: string[]
  /** plan names with matching [price, period] */
  plans: { names: [string, string, string]; prices: [[string, string], [string, string], [string, string]] }[]
  gallery: string[]
  /** "{brand}" is replaced by the business name */
  beliefs: string[]
  closings: string[]
  points: string[]
  /** [quote, who said it] */
  quotes: [string, string][]
  blogTags: string[]
  teamRoles: string[]
}
