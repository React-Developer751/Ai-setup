// The hand-written niche packs (src/data/niches/batch-*.json; format and rules: NICHE_SPEC.md; checked by `npm run check:niches`).
import batchA from '../../data/niches/batch-a.json'
import batchB from '../../data/niches/batch-b.json'
import batchC from '../../data/niches/batch-c.json'
import batchD from '../../data/niches/batch-d.json'
import type { Niche } from './types'

export const NICHES = [...batchA, ...batchB, ...batchC, ...batchD] as unknown as Niche[]
