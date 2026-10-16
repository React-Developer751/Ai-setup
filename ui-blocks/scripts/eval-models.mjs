// Measures how well each way of understanding a prompt does, and picks the weights for the blend.
//
//   npm run eval                  report only
//   npm run eval -- --write       also write the best blend weights to src/data/models/ensemble.json
//
// Honest by design: the blend weights are chosen on the TRAINING examples with "out-of-fold" opinions (every example is judged by a
// model that has not seen it); the TEST examples are only used to report the result.
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const write = process.argv.includes('--write') && !process.argv.some((a) => a.startsWith('--test='))
const { scoreThemes, ruleEvidence } = await loadGeneratorModule('themeClassifier.ts')
const { trainSparse, SparseModel } = await loadGeneratorModule('ml/sparseModel.ts')
const { ruleDistribution, blend } = await loadGeneratorModule('ml/ensemble.ts')
const { embed, nearest, unpackVectors } = await loadGeneratorModule('ml/embeddings.ts')
const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
const modelKey = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? ACTIVE_MODEL
const { trainProbe } = await loadGeneratorModule('ml/linearProbe.ts')

const readLines = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)) : [])
const train = ['src/data/training/themes.train.jsonl', 'src/data/training/hinglish.train.jsonl'].flatMap(readLines)
// `--test=file.jsonl` measures another labelled file (for example a blind set written by somebody else); the tuned weights are never written then
const testArg = process.argv.find((a) => a.startsWith('--test='))?.split('=')[1]
const test = (testArg ? [testArg] : ['src/data/training/themes.test.jsonl', 'src/data/training/hinglish.test.jsonl']).flatMap(readLines)
const modelFile = JSON.parse(fs.readFileSync('src/data/models/theme-model.json', 'utf8'))
const vectorPath = `public/models/vectors/${modelKey}/themes.json`
const vectorFile = modelKey !== 'none' && fs.existsSync(vectorPath) ? JSON.parse(fs.readFileSync(vectorPath, 'utf8')) : undefined
const vectors = vectorFile && vectorFile.items.length === train.length ? unpackVectors(vectorFile) : undefined
if (vectorFile && !vectors) console.log(`! the stored vectors (${vectorFile.items.length}) do not match the training file (${train.length}): run npm run build:embeddings`)
const options = modelKey === 'none' ? {} : { localModelPath: `${process.cwd()}/public/models/`, model: EMBEDDING_MODELS[modelKey].name, prefix: EMBEDDING_MODELS[modelKey].prefix }

console.log(`embedding model: ${modelKey}\ntrain ${train.length}, test ${test.length}${vectors ? '' : ' (no embedding vectors: the "meaning" source is skipped)'}`)

// ── out-of-fold opinions of the learned model on the training examples
const settings = { ...modelFile.settings, weights: modelFile.weights, temperature: modelFile.temperature }
const k = 5
const foldOf = train.map((_, i) => i % k)
const shuffled = [...train.keys()].sort((a, b) => ((a * 2654435761) >>> 0) - ((b * 2654435761) >>> 0))
shuffled.forEach((index, order) => (foldOf[index] = order % k))
const oof = new Array(train.length)
for (let f = 0; f < k; f++) {
  const model = trainSparse(train.filter((_, i) => foldOf[i] !== f), settings)
  train.forEach((example, i) => {
    if (foldOf[i] === f) oof[i] = model.predict(example.text).probabilities
  })
}

// ── evidence per example
const finalModel = new SparseModel(modelFile)
let trainVectors, testVectors
if (vectors) {
  trainVectors = await embed(train.map((e) => e.text), options)
  testVectors = await embed(test.map((e) => e.text), options)
}
// probe: out-of-fold on the training examples, the stored one on the test examples
const probeOof = trainVectors ? new Array(train.length) : undefined
if (trainVectors) {
  for (let f = 0; f < k; f++) {
    const idx = train.map((_, i) => i).filter((i) => foldOf[i] !== f)
    const probe = trainProbe(idx.map((i) => trainVectors[i]), idx.map((i) => train[i].label))
    train.forEach((_, i) => {
      if (foldOf[i] === f) probeOof[i] = probe.predict(trainVectors[i])
    })
  }
}
const finalProbe = trainVectors ? trainProbe(trainVectors, train.map((e) => e.label)) : undefined
const evidenceFor = (examples, learned, vecs, leaveOut, probeOf) =>
  examples.map((example, i) => ({
    scores: scoreThemes(example.text),
    firm: ruleEvidence(example.text),
    learned: learned(example, i),
    meaning: vecs ? nearest(vecs[i], vectors, 9, 12, leaveOut ? i : -1) : undefined,
    probe: vecs ? probeOf(i) : undefined,
  }))
const trainEv = evidenceFor(train, (_, i) => oof[i], trainVectors, true, (i) => probeOof[i])
const testEv = evidenceFor(test, (e) => finalModel.predict(e.text).probabilities, testVectors, false, (i) => finalProbe.predict(testVectors[i]))

const decide = (ev, weights) => {
  // the two firm rules stay certain
  const rules = ev.firm && Object.values(ev.firm).includes(1) ? ev.firm : ruleDistribution(ev.scores, weights.ruleSharpness)
  const result = blend({ rules, learned: ev.learned, meaning: ev.meaning, probe: ev.probe }, weights)
  // when no source is sure enough, a neutral business page is better than a confident wrong one
  return result && result.confidence >= (weights.abstain ?? 0.12) ? result.label : 'general_business'
}
const accuracy = (examples, evs, weights) => examples.filter((e, i) => decide(evs[i], weights) === e.label).length / examples.length

// ── choose the weights on the training opinions
let best
const grid = [0, 0.5, 1, 2]
for (const rules of grid) for (const learned of grid) for (const meaning of vectors ? grid : [0]) for (const probe of vectors ? grid : [0]) {
  if (rules + learned + meaning + probe === 0) continue
  for (const ruleSharpness of [0.6, 1.2, 2.5]) for (const abstain of [0.12, 0.25]) {
    const weights = { rules, learned, meaning, probe, ruleSharpness, abstain }
    const acc = accuracy(train, trainEv, weights)
    if (!best || acc > best.acc + 1e-9) best = { ...weights, acc }
  }
}
const chosen = { rules: best.rules, learned: best.learned, meaning: best.meaning, probe: best.probe, ruleSharpness: best.ruleSharpness, abstain: best.abstain }
console.log(`\nweights chosen on the training examples (out-of-fold accuracy ${(best.acc * 100).toFixed(1)}%):`, JSON.stringify(chosen))

// ── report on the test examples
const isHinglish = (t) => /[ऀ-ॿ]/.test(t) || /\b(hai|hain|mera|meri|mere|hamara|hamari|hamare|ka|ki|ke|karte|karta|karti|chahiye|banao|banani|bana|dukan|dukaan|me|mein|wala|wali|ko|se|aur|hu|hun)\b/i.test(t)
const strategies = {
  'rules only': { rules: 1, learned: 0, meaning: 0, probe: 0, ruleSharpness: 1.2 },
  'learned model only': { rules: 0, learned: 1, meaning: 0, probe: 0, ruleSharpness: 1.2 },
  ...(vectors ? { 'meaning (nearest) only': { rules: 0, learned: 0, meaning: 1, probe: 0, ruleSharpness: 1.2 }, 'meaning (probe) only': { rules: 0, learned: 0, meaning: 0, probe: 1, ruleSharpness: 1.2 } } : {}),
  'rules + learned': { rules: 1, learned: 1, meaning: 0, probe: 0, ruleSharpness: 1.2 },
  ...(vectors ? { 'learned + both meanings': { rules: 0, learned: 1, meaning: 1, probe: 1, ruleSharpness: 1.2 }, 'everything (tuned)': chosen } : { 'blend (tuned)': chosen }),
}
const hinglishIdx = test.map((e, i) => (isHinglish(e.text) ? i : -1)).filter((i) => i >= 0)
const englishIdx = test.map((_, i) => i).filter((i) => !hinglishIdx.includes(i))
const sub = (idx) => [idx.map((i) => test[i]), idx.map((i) => testEv[i])]
console.log(`\nTEST accuracy (${test.length} unseen prompts; ${englishIdx.length} English, ${hinglishIdx.length} Hinglish/Hindi)`)
console.log('strategy'.padEnd(22), 'all'.padStart(7), 'English'.padStart(9), 'Hinglish'.padStart(9))
for (const [name, weights] of Object.entries(strategies)) {
  const all = accuracy(test, testEv, weights)
  const [eT, eE] = sub(englishIdx)
  const [hT, hE] = sub(hinglishIdx)
  console.log(name.padEnd(22), `${(all * 100).toFixed(1)}%`.padStart(7), `${(accuracy(eT, eE, weights) * 100).toFixed(1)}%`.padStart(9), `${hT.length ? (accuracy(hT, hE, weights) * 100).toFixed(1) + '%' : '-'}`.padStart(9))
}

const labels = [...new Set(train.map((e) => e.label))].sort()
const predicted = test.map((_, i) => decide(testEv[i], chosen))
console.log('\nper business type (tuned blend): precision / recall')
for (const label of labels) {
  const tp = test.filter((e, i) => e.label === label && predicted[i] === label).length
  const fp = test.filter((e, i) => e.label !== label && predicted[i] === label).length
  const fn = test.filter((e, i) => e.label === label && predicted[i] !== label).length
  console.log(' ', label.padEnd(22), `${tp + fp ? ((tp / (tp + fp)) * 100).toFixed(0) : '-'}%`.padStart(5), '/', `${tp + fn ? ((tp / (tp + fn)) * 100).toFixed(0) : '-'}%`.padStart(5))
}
const mistakes = test.map((e, i) => ({ e, p: predicted[i] })).filter((x) => x.p !== x.e.label)
if (process.argv.includes('--errors')) for (const { e, p } of mistakes) console.log(`   ${e.label} <- predicted ${p}: ${e.text}`)
console.log(`\n${mistakes.length} of ${test.length} test prompts are wrong${process.argv.includes('--errors') ? '' : ' (run with --errors to list them)'}`)

if (write) {
  // one set of weights per embedding model; "default" is for when no embedding model is switched on
  const file = fs.existsSync('src/data/models/ensemble.json') ? JSON.parse(fs.readFileSync('src/data/models/ensemble.json', 'utf8')) : {}
  file[modelKey === 'none' ? 'default' : modelKey] = chosen
  fs.writeFileSync('src/data/models/ensemble.json', `${JSON.stringify(file, null, 2)}\n`)
  const reportFile = fs.existsSync('src/data/models/eval-report.json') ? JSON.parse(fs.readFileSync('src/data/models/eval-report.json', 'utf8')) : {}
  reportFile[modelKey] = { date: new Date().toISOString().slice(0, 10), train: train.length, test: test.length, weights: chosen, accuracy: Object.fromEntries(Object.entries(strategies).map(([name, w]) => [name, Math.round(accuracy(test, testEv, w) * 1000) / 10])) }
  fs.writeFileSync('src/data/models/eval-report.json', `${JSON.stringify(reportFile, null, 2)}\n`)
  console.log(`\nwrote the weights for "${modelKey}" to src/data/models/ensemble.json and eval-report.json`)
}
