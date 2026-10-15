// Trains the text models from the labelled examples in src/data/training/ and writes them to src/data/models/.
//
//   npm run train                       train both models (business type, text kind)
//   npm run train -- --feedback=f.jsonl also learn from corrections you collected in the page ({"text": ..., "label": ...} per line)
//   npm run train -- --only=themes      only one of them (themes | kinds)
//
// The model is a logistic regression over words, word pairs and letter groups (src/generator/ml/sparseModel.ts). It tries a few
// settings with 5-fold cross validation on the training examples (never on the test examples), keeps the best, trains on everything
// and then reports the accuracy on the separate test file. The probabilities are calibrated with a temperature chosen on the folds.
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => [a.replace(/^--/, '').split('=')[0], a.split('=').slice(1).join('=') || true]))
const { trainSparse } = await loadGeneratorModule('ml/sparseModel.ts')

const readLines = (file) =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => line.trim())
        .map((line, i) => {
          try {
            const row = JSON.parse(line)
            if (typeof row.text !== 'string' || typeof row.label !== 'string') throw new Error('needs "text" and "label"')
            return row
          } catch (error) {
            throw new Error(`${file} line ${i + 1}: ${error.message}`)
          }
        })
    : []

function folds(examples, k, seed = 7) {
  let a = seed
  const rand = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296)
  const byLabel = new Map()
  for (const example of examples) byLabel.set(example.label, [...(byLabel.get(example.label) ?? []), example])
  const parts = Array.from({ length: k }, () => ({ train: [], valid: [] }))
  for (const list of byLabel.values()) {
    const shuffled = [...list].sort(() => rand() - 0.5)
    shuffled.forEach((example, i) => parts.forEach((part, f) => part[f === i % k ? 'valid' : 'train'].push(example)))
  }
  return parts
}

const accuracyOf = (model, examples) => examples.filter((e) => model.predict(e.text).label === e.label).length / examples.length
const logLossOf = (model, examples) => examples.reduce((sum, e) => sum - Math.log(Math.max(model.predict(e.text).probabilities[e.label] ?? 1e-9, 1e-9)), 0) / examples.length

function tune(name, examples) {
  const grid = [
    { epochs: 40, rate: 0.08, l2: 2e-5, weights: { word: 1, pair: 0.7, chars: 0.15 } },
    { epochs: 60, rate: 0.05, l2: 2e-5, weights: { word: 1, pair: 0.7, chars: 0.3 } },
    { epochs: 60, rate: 0.05, l2: 5e-5, weights: { word: 1, pair: 1, chars: 0.3 } },
  ]
  const parts = folds(examples, 5)
  let best
  for (const setting of grid) {
    let right = 0
    let total = 0
    for (const part of parts) {
      const model = trainSparse(part.train, setting)
      right += accuracyOf(model, part.valid) * part.valid.length
      total += part.valid.length
    }
    const accuracy = right / total
    if (!best || accuracy > best.accuracy) best = { ...setting, accuracy }
  }
  // the temperature only changes how confident the probabilities are, not which label wins: the one with the lowest log loss
  let bestTemp
  for (const temperature of [0.5, 0.75, 1, 1.5, 2, 3]) {
    let loss = 0
    let total = 0
    for (const part of parts) {
      const model = trainSparse(part.train, { ...best, temperature })
      loss += logLossOf(model, part.valid) * part.valid.length
      total += part.valid.length
    }
    if (!bestTemp || loss / total < bestTemp.loss) bestTemp = { temperature, loss: loss / total }
  }
  console.log(`  ${name}: best settings epochs=${best.epochs} rate=${best.rate} pairs=${best.weights.pair} letters=${best.weights.chars} -> cross-validation accuracy ${(best.accuracy * 100).toFixed(1)}% (temperature ${bestTemp.temperature})`)
  return { ...best, temperature: bestTemp.temperature, cv: best.accuracy }
}

const report = {}
const jobs = [
  { name: 'themes', train: ['src/data/training/themes.train.jsonl', 'src/data/training/hinglish.train.jsonl'], test: ['src/data/training/themes.test.jsonl', 'src/data/training/hinglish.test.jsonl'], out: 'src/data/models/theme-model.json' },
  { name: 'kinds', train: ['src/data/training/kinds.train.jsonl'], test: ['src/data/training/kinds.test.jsonl'], out: 'src/data/models/kind-model.json' },
]
for (const job of jobs.filter((j) => !args.only || args.only === j.name)) {
  const examples = job.train.flatMap(readLines)
  if (!examples.length) {
    console.log(`\n${job.name}: no examples in ${job.train.join(', ')}, skipped`)
    continue
  }
  // corrections collected in the page count like normal examples (themes only: they are business-type corrections)
  const feedback = job.name === 'themes' && typeof args.feedback === 'string' ? readLines(args.feedback) : []
  const all = [...examples, ...feedback]
  console.log(`\n${job.name}: ${all.length} examples (${feedback.length} from feedback), ${new Set(all.map((e) => e.label)).size} labels`)
  const setting = tune(job.name, all)
  const model = trainSparse(all, setting)
  fs.mkdirSync(path.dirname(job.out), { recursive: true })
  fs.writeFileSync(job.out, JSON.stringify(model.toFile()))
  console.log(`  wrote ${job.out} (${(fs.statSync(job.out).size / 1024).toFixed(0)} KB, ${model.vocabSize} features)`)
  const tests = job.test.flatMap(readLines)
  if (tests.length) {
    const accuracy = accuracyOf(model, tests)
    console.log(`  TEST accuracy on ${tests.length} unseen examples: ${(accuracy * 100).toFixed(1)}%`)
    report[job.name] = { cv: setting.cv, test: accuracy, count: tests.length }
  }
}
fs.writeFileSync('src/data/models/train-report.json', `${JSON.stringify({ trainedAt: new Date().toISOString().slice(0, 10), ...report }, null, 2)}\n`)
