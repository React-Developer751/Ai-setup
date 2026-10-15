// The trained models, loaded once, plus what the person teaches them in the page (corrections are remembered in this browser).
import kindFile from '../../data/models/kind-model.json'
import themeFile from '../../data/models/theme-model.json'
import { SparseModel, type SparseFile } from './sparseModel'
import type { Prediction } from './textModel'
import { normalizeText } from './textFeatures'

const THEME_STORE = 'website-generator-theme-corrections'

export type Correction = { text: string; label: string }

/** the shipped model + every correction learned again, in order (so a changed mind really replaces the old one) */
const buildTheme = (list: Correction[]) => {
  const model = new SparseModel(themeFile as unknown as SparseFile)
  for (const correction of list) model.learn(correction.text, correction.label)
  return model
}
let themeModel = new SparseModel(themeFile as unknown as SparseFile)
const kindModel = new SparseModel(kindFile as unknown as SparseFile)

let corrections: Correction[] = []
let version = 0
const listeners = new Set<() => void>()

const storage = () => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

// corrections made earlier are learned again at start (the model file itself never changes)
try {
  const saved = storage()?.getItem(THEME_STORE)
  corrections = saved ? (JSON.parse(saved) as Correction[]) : []
  themeModel = buildTheme(corrections)
} catch {
  corrections = []
}

export const hasThemeModel = () => themeModel.vocabSize > 0
export const hasKindModel = () => kindModel.vocabSize > 0
export const themeLabels = () => themeModel.labels
export const predictThemeText = (text: string): Prediction => themeModel.predict(text)
export const predictKindText = (text: string): Prediction => kindModel.predict(text)
export const trainedOn = () => ({ themes: themeModel.trainedOn, kinds: kindModel.trainedOn })

/** a correction for exactly this text (same words) wins over everything */
export const correctionFor = (text: string): string | undefined => {
  const key = normalizeText(text)
  for (let i = corrections.length - 1; i >= 0; i--) if (normalizeText(corrections[i].text) === key) return corrections[i].label
  return undefined
}

/** "this prompt is about X": learned now, remembered in this browser */
export function teachTheme(text: string, label: string): string | undefined {
  if (!themeModel.labels.includes(label) || !text.trim()) return undefined
  corrections = [...corrections.filter((c) => normalizeText(c.text) !== normalizeText(text)), { text, label }]
  themeModel = buildTheme(corrections)
  let problem: string | undefined
  try {
    storage()?.setItem(THEME_STORE, JSON.stringify(corrections))
  } catch {
    problem = 'Could not be remembered in this browser.'
  }
  version++
  listeners.forEach((listener) => listener())
  return problem
}

export const getCorrections = () => corrections
export const subscribeLearning = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getLearningVersion = () => version

/** forget everything that was taught in this browser */
export function forgetCorrections() {
  corrections = []
  themeModel = buildTheme([])
  try {
    storage()?.removeItem(THEME_STORE)
  } catch {
    // nothing to remove
  }
  version++
  listeners.forEach((listener) => listener())
}
