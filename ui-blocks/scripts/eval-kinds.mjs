// How well do the text-kind models recognise what a piece of text is (post / review / FAQ / team / gallery / business)?
//   npm run eval:kinds [-- --model=multilingual-e5-small]
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { SparseModel } = await loadGeneratorModule('ml/sparseModel.ts')
const { embed, nearest, unpackVectors } = await loadGeneratorModule('ml/embeddings.ts')
const { trainProbe } = await loadGeneratorModule('ml/linearProbe.ts')
const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
const modelKey = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? ACTIVE_MODEL
const readLines = (file) => fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
const train = readLines('src/data/training/kinds.train.jsonl')
const test = readLines('src/data/training/kinds.test.jsonl')
const nb = new SparseModel(JSON.parse(fs.readFileSync('src/data/models/kind-model.json', 'utf8')))
const options = { localModelPath: `${process.cwd()}/public/models/`, model: EMBEDDING_MODELS[modelKey].name, prefix: EMBEDDING_MODELS[modelKey].prefix }
const trainVectors = await embed(train.map((e) => e.text), options)
const testVectors = await embed(test.map((e) => e.text), options)
const labels = [...new Set(train.map((e) => e.label))].sort()
const packed = { dim: trainVectors[0].length, labels, items: train.map((e) => labels.indexOf(e.label)), data: (() => { const d = new Int8Array(train.length * trainVectors[0].length); trainVectors.forEach((v, i) => d.set(Int8Array.from(v, (x) => Math.round(x * 127)), i * v.length)); return Buffer.from(d.buffer).toString('base64') })() }
const vectors = unpackVectors(packed)
const probe = trainProbe(trainVectors, train.map((e) => e.label))
const top = (dist) => Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0]
const mix = (...dists) => Object.fromEntries(labels.map((l) => [l, dists.reduce((a, d) => a + (d[l] ?? 0), 0) / dists.length]))
const rows = test.map((e, i) => ({ e, nb: nb.predict(e.text).probabilities, knn: nearest(testVectors[i], vectors), probe: probe.predict(testVectors[i]) }))
const acc = (pick) => `${((rows.filter((r) => top(pick(r)) === r.e.label).length / rows.length) * 100).toFixed(1)}%`
console.log(`kinds, model ${modelKey}, ${test.length} test texts`)
console.log('  learned (regression) :', acc((r) => r.nb))
console.log('  meaning, nearest      :', acc((r) => r.knn))
console.log('  meaning, probe        :', acc((r) => r.probe))
console.log('  nearest + probe       :', acc((r) => mix(r.knn, r.probe)))
console.log('  all three             :', acc((r) => mix(r.nb, r.knn, r.probe)))
