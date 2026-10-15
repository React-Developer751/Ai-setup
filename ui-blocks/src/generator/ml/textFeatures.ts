// Turns a piece of text into countable features for the learned models: words, word pairs and letter groups.
// The letter groups ("char n-grams") are what lets the models cope with spelling variants and romanised Hindi
// ("dukan" / "dukaan" / "dukkan"), and with words they have never seen ("physiotherapist" shares letters with "physio").
const STOP = new Set(
  (
    'a an the and or of for to in on at by with from my our your their his her its is are was be been am i we you they it this that these those as so ' +
    'create make build design need want please website web site page landing wala wali wale ka ki ke ko se me mein par pe hai hain hu hun ho tha thi aur ya ' +
    'liye lie banao bana do dijiye chahiye chahie hamara hamari hamare mera meri mere apna apni apne yeh ye woh wo kuch bahut sab ek ki kar karta karti karte ' +
    'called named name best new good top online'
  ).split(' '),
)

/** lower case, no accents (Devanagari kept), punctuation to spaces */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// romanised-Hindi spelling variants that mean the same word
const VARIANTS: Record<string, string> = { dukaan: 'dukan', dukkan: 'dukan', dukaaan: 'dukan', shaadi: 'shadi', saadi: 'shadi', vivah: 'shadi', gym: 'gym', jim: 'gym', salon: 'salon', saloon: 'salon', parlor: 'parlour', parlar: 'parlour' }

/** a very light stem: "dentists" and "dentist", "studies" and "study" */
const stem = (word: string) => (word.length > 4 && word.endsWith('ies') ? `${word.slice(0, -3)}y` : word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)

export function wordsOf(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word && !STOP.has(word) && (word.length > 1 || /\d/.test(word)))
    .map((word) => VARIANTS[word] ?? stem(word))
}

export type FeatureWeights = { word: number; pair: number; chars: number }
export const DEFAULT_WEIGHTS: FeatureWeights = { word: 1, pair: 0.7, chars: 0.25 }

/** feature -> weight. "w:dentist", "b:root_canal", "c:<den", "c:ent" ... */
export function featuresOf(text: string, weights: FeatureWeights = DEFAULT_WEIGHTS): Map<string, number> {
  const out = new Map<string, number>()
  const add = (key: string, weight: number) => out.set(key, (out.get(key) ?? 0) + weight)
  const words = wordsOf(text)
  words.forEach((word, i) => {
    add(`w:${word}`, weights.word)
    if (i > 0) add(`b:${words[i - 1]}_${word}`, weights.pair)
    if (word.length >= 4 && weights.chars > 0) {
      const padded = `<${word}>`
      for (let n = 3; n <= 5; n++) for (let at = 0; at + n <= padded.length; at++) add(`c:${padded.slice(at, at + n)}`, weights.chars)
    }
  })
  return out
}
