// Does the embedding model understand edit requests better than the word model? kNN and a linear probe on the intent examples.
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { embed, packVectors, nearest } = await loadGeneratorModule('ml/embeddings.ts')
const { trainProbe } = await loadGeneratorModule('ml/linearProbe.ts')
const { EMBEDDING_MODELS } = await loadGeneratorModule('ml/models.ts')
const key = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? 'multilingual-e5-small'
const model = EMBEDDING_MODELS[key]
const options = { localModelPath: path.resolve('public/models') + '/', model: model.name, prefix: model.prefix }
const read = (f) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const train = read('src/data/training/edit-intents.train.jsonl')
const test = read('src/data/training/edit-intents.test.jsonl')
const t0 = Date.now()
const trainVec = await embed(train.map((e) => e.text), options)
const testVec = await embed(test.map((e) => e.text), options)
console.log(`embedded ${train.length + test.length} texts in ${((Date.now() - t0) / 1000).toFixed(0)} s`)
const labels = [...new Set(train.map((e) => e.label))].sort()
const packed = packVectors(labels, train.map((e, i) => ({ label: e.label, vector: trainVec[i] })))
const vectors = { ...packed, data: new Int8Array(Buffer.from(packed.data, 'base64')) }
let knn = 0
test.forEach((e, i) => {
  const d = nearest(testVec[i], vectors, 9, 12)
  const best = Object.entries(d).sort((a, b) => b[1] - a[1])[0][0]
  if (best === e.label) knn += 1
})
const probe = trainProbe(trainVec, train.map((e) => e.label))
let lin = 0
test.forEach((e, i) => { if (Object.entries(probe.predict(testVec[i])).sort((a, b) => b[1] - a[1])[0][0] === e.label) lin += 1 })
console.log(`${key}: kNN ${(100 * knn / test.length).toFixed(1)}%  probe ${(100 * lin / test.length).toFixed(1)}%`)
if (process.argv.includes('--write')) {
  const dir = `public/models/vectors/${key}`
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(`${dir}/intents.json`, JSON.stringify(packed))
  fs.writeFileSync(`${dir}/intents-probe.json`, JSON.stringify(probe.file))
  console.log('written', dir)
}
