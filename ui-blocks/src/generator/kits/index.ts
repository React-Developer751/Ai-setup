// Every business type added as a "kit" (plain data). The registries in themes.ts, colorBrain.ts, lexicon.ts ...
// spread these in, so adding a business type means adding one entry here and nothing else.
import { kitsA } from './kitsA'
import { kitsB } from './kitsB'
import { kitsC } from './kitsC'

export const KITS = { ...kitsA, ...kitsB, ...kitsC }

export type KitKey = keyof typeof KITS

export const KIT_KEYS = Object.keys(KITS) as KitKey[]

/** `pick(kit => kit.mood)` -> { real_estate: ..., travel_tourism: ... } */
export const fromKits = <T>(pick: (kit: (typeof KITS)[KitKey]) => T) =>
  Object.fromEntries(KIT_KEYS.map((key) => [key, pick(KITS[key])])) as Record<KitKey, T>
