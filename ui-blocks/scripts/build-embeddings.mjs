// Turns every training example into a vector with the embedding model and stores them in public/models/vectors/.
// The page compares a new prompt with these to find the closest labelled examples ("meaning" source of the blend).
//   npm run build:embeddings                 (needs the model files in public/models/, see README of src/data/training)
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { embed, packVectors } = await loadGeneratorModule('ml/embeddings.ts')
const { trainProbe } = await loadGeneratorModule('ml/linearProbe.ts')
const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
const modelFlag = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? ACTIVE_MODEL
const model = EMBEDDING_MODELS[modelFlag]
if (!model) {
  console.error(`Unknown model "${modelFlag}". Known: ${Object.keys(EMBEDDING_MODELS).join(', ')}`)
  process.exit(1)
}
const options = { localModelPath: path.resolve('public/models') + '/', model: model.name, prefix: model.prefix }
console.log(`model: ${model.name}`)

const readLines = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)) : [])
const jobs = [
  { name: 'themes', files: ['src/data/training/themes.train.jsonl', 'src/data/training/hinglish.train.jsonl'] },
  { name: 'kinds', files: ['src/data/training/kinds.train.jsonl'] },
]
fs.mkdirSync(`public/models/vectors/${modelFlag}`, { recursive: true })
for (const job of jobs.filter((j) => !process.argv.includes('--only') || process.argv.includes(`--only=${j.name}`) || !process.argv.some((a) => a.startsWith('--only=')))) {
  const examples = job.files.flatMap(readLines)
  if (!examples.length) continue
  const started = Date.now()
  const vectors = await embed(examples.map((e) => e.text), options)
  const labels = [...new Set(examples.map((e) => e.label))].sort()
  const packed = packVectors(labels, examples.map((e, i) => ({ label: e.label, vector: vectors[i] })))
  const out = `public/models/vectors/${modelFlag}/${job.name}.json`
  fs.writeFileSync(out, JSON.stringify(packed))
  // the linear probe on the same vectors (small: 20 x 384 numbers)
  const probe = trainProbe(vectors, examples.map((e) => e.label))
  fs.writeFileSync(`public/models/vectors/${modelFlag}/${job.name}-probe.json`, JSON.stringify(probe.file))
  console.log(`${job.name}: ${examples.length} examples -> ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${((Date.now() - started) / 1000).toFixed(0)} s)`)
}
