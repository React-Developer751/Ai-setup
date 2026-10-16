// The whole understanding pipeline on the free-language intent examples (never used for writing rules):
//   1. the rules (understand.ts)   2. if they found nothing: the guessed intent (words, and with --meaning also the embedding model)
// "right" = the rules found an operation of the right kind, or the guessed intent is the labelled one (the chat then asks the detail).
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { parseEdit } = await loadGeneratorModule('edit/understand.ts')
const { guessIntent, INTENTS } = await loadGeneratorModule('edit/intent.ts')
const file = process.argv.find((a) => a.endsWith('.jsonl')) ?? 'src/data/training/edit-intents.test.jsonl'
const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const OPS = { rename: ['rename'], recolor: ['accent', 'tone'], mode: ['mode'], remove: ['remove', 'removePage'], add: ['add', 'addPage'], set_text: ['text'], replace_text: ['replace'], contact: ['contact'], tier: ['tier'], motion: ['motion'], change_business: ['theme'] }

let meaning
if (process.argv.includes('--meaning')) {
  const { embed, unpackVectors, nearest } = await loadGeneratorModule('ml/embeddings.ts')
  const { Probe } = await loadGeneratorModule('ml/linearProbe.ts')
  const { EMBEDDING_MODELS } = await loadGeneratorModule('ml/models.ts')
  const key = 'multilingual-e5-small'
  const dir = `public/models/vectors/${key}`
  const vectors = unpackVectors(JSON.parse(fs.readFileSync(`${dir}/intents.json`, 'utf8')))
  const probe = new Probe(JSON.parse(fs.readFileSync(`${dir}/intents-probe.json`, 'utf8')))
  const options = { localModelPath: path.resolve('public/models') + '/', model: EMBEDDING_MODELS[key].name, prefix: EMBEDDING_MODELS[key].prefix }
  const vecs = await embed(rows.map((r) => r.text), options)
  meaning = vecs.map((v) => {
    const a = nearest(v, vectors)
    const b = probe.predict(v)
    return Object.fromEntries(Object.keys(a).map((l) => [l, (a[l] + 2 * b[l]) / 3]))
  })
}

const stats = { rules: 0, rulesRight: 0, guessed: 0, guessRight: 0, none: 0 }
const per = {}
for (const [i, row] of rows.entries()) {
  const got = parseEdit(row.text, 'multi')
  const kind = got.kind === 'control' ? got.control : got.kind === 'newSite' ? 'new_site' : got.kind === 'ops' && got.ops.length ? 'ops' : 'none'
  per[row.label] ??= { n: 0, right: 0 }
  per[row.label].n += 1
  if (kind !== 'none') {
    stats.rules += 1
    const right = row.label === kind || (kind === 'ops' && (OPS[row.label] ?? []).includes(got.ops[0].op) && got.ops.every((o) => OPS[row.label].includes(o.op)))
    if (right) { stats.rulesRight += 1; per[row.label].right += 1 }
    continue
  }
  const w = await guessIntent(row.text, false)
  let intent = w.intent
  if (meaning) {
    const blend = Object.fromEntries(INTENTS.map((l) => [l, 0.35 * (w.ranked.find((r) => r[0] === l)?.[1] ?? 0) + 0.65 * meaning[i][l]]))
    intent = Object.entries(blend).sort((a, b) => b[1] - a[1])[0][0]
  }
  stats.guessed += 1
  if (intent === row.label) { stats.guessRight += 1; per[row.label].right += 1 }
}
const total = rows.length
console.log(`rules answered ${stats.rules}/${total} (${stats.rulesRight} right) | rules empty ${stats.guessed}: intent guessed right ${stats.guessRight}`)
console.log(`understood = ${((100 * (stats.rulesRight + stats.guessRight)) / total).toFixed(1)}%  ${meaning ? '(words + meaning)' : '(words only)'}`)
console.log(Object.entries(per).map(([l, v]) => `${l} ${v.right}/${v.n}`).join(' · '))
