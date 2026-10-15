// A last check with prompts written like real people write them (not from the training files): how often is the business type right?
//   npm run eval:real -- path/to/prompts.jsonl [--model=multilingual-e5-small|all-MiniLM-L6-v2|none] [--errors]
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const file = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) ?? 'src/data/training/real-world.jsonl'
const modelKey = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? 'none'
const classifier = await loadGeneratorModule('themeClassifier.ts')
const { embed, nearest, unpackVectors } = await loadGeneratorModule('ml/embeddings.ts')
const { Probe } = await loadGeneratorModule('ml/linearProbe.ts')
const { EMBEDDING_MODELS } = await loadGeneratorModule('ml/models.ts')
const { blend } = await loadGeneratorModule('ml/ensemble.ts')
const { predictThemeText } = await loadGeneratorModule('ml/learned.ts')
const rows = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
const weightsFile = JSON.parse(fs.readFileSync('src/data/models/ensemble.json', 'utf8'))

let meaning = []
if (modelKey !== 'none') {
  const model = EMBEDDING_MODELS[modelKey]
  const dir = `public/models/vectors/${modelKey}`
  const vectors = unpackVectors(JSON.parse(fs.readFileSync(`${dir}/themes.json`, 'utf8')))
  const probe = new Probe(JSON.parse(fs.readFileSync(`${dir}/themes-probe.json`, 'utf8')))
  const embedded = await embed(rows.map((r) => r.text), { localModelPath: `${process.cwd()}/public/models/`, model: model.name, prefix: model.prefix })
  meaning = embedded.map((v) => ({ meaning: nearest(v, vectors), probe: probe.predict(v) }))
}
const weights = weightsFile[modelKey === 'none' ? 'default' : modelKey]
let right = 0
const wrong = []
rows.forEach((row, i) => {
  const result = blend({ rules: classifier.ruleEvidence(row.text), learned: predictThemeText(row.text).probabilities, ...(meaning[i] ?? {}) }, weights)
  const label = result && result.confidence >= (weights.abstain ?? 0.12) ? result.label : 'general_business'
  if (label === row.label) right++
  else wrong.push(`${row.label} <- ${label} (${Math.round((result?.confidence ?? 0) * 100)}%): ${row.text}`)
})
console.log(`${modelKey === 'none' ? 'A (rules + learned model)' : `B (+ ${modelKey})`}: ${right}/${rows.length} = ${((right / rows.length) * 100).toFixed(1)}%`)
if (process.argv.includes('--errors')) for (const w of wrong) console.log('  ' + w)
