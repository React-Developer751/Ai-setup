// How reliably does a prompt find its niche pack? (1) every keyword finds its own niche, (2) which labelled prompts of the other test sets
// trigger a niche, and does the niche's kit agree with the label (a mismatch is a possible false trigger to look at).
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { detectNiche } = await loadGeneratorModule('niche/applyNiche.ts')
const { NICHES } = await loadGeneratorModule('niche/niches.ts')
const read = (f) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))

let own = 0
let total = 0
const wrong = []
for (const n of NICHES) for (const k of n.keywords) {
  for (const prompt of [`website for my ${k}`, `${k} website banao`]) {
    total += 1
    const hit = detectNiche(prompt, NICHES)
    if (hit?.id === n.id) own += 1
    else wrong.push(`${n.id} "${k}" -> ${hit?.id ?? 'nothing'}`)
  }
}
console.log(`${NICHES.length} niches, ${NICHES.reduce((s, n) => s + n.keywords.length, 0)} keywords: ${own}/${total} keyword prompts find their own niche`)
for (const w of wrong.slice(0, 25)) console.log('  ✗', w)

const sets = { 'blind business set (240)': read('src/data/training/business-blind.jsonl'), 'theme training (3,499)': [...read('src/data/training/themes.train.jsonl'), ...read('src/data/training/hinglish.train.jsonl')], 'real-world (63)': read('src/data/training/real-world.jsonl') }
for (const [name, rows] of Object.entries(sets)) {
  const triggered = rows.map((r) => ({ r, n: detectNiche(r.text, NICHES) })).filter((x) => x.n)
  const disagree = triggered.filter((x) => x.n.theme !== x.r.label)
  console.log(`\n${name}: ${triggered.length} of ${rows.length} prompts trigger a niche; the niche's theme differs from the label in ${disagree.length}`)
  for (const { r, n } of disagree.slice(0, name.startsWith('theme') ? 40 : 15)) console.log(`   [${r.label} vs ${n.theme}] ${n.id}: ${r.text.slice(0, 90)}`)
}
