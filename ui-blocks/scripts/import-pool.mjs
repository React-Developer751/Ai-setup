// Reads data from outside (JSON, CSV, Markdown, text, HTML), works out what it is with the same import brain the page uses,
// and adds it to src/data/dataPool.json.
//
//   npm run pool:import -- export.json users.csv            analyse and add
//   npm run pool:import -- export.json --dry                only show what it understood
//   npm run pool:import -- notes.md --as=posts              say what everything in these files is
//   npm run pool:import -- export.json --smart            let the embedding model read the texts first (recognises much more)
//   options: --scope=all | --scope=food_dining   (who the entries are for; default: decided from the words)
//            --min-rating=4                       (leave out reviews below this, out of 5)
//            --out=other.json                     (write somewhere else; the original is only backed up when it is overwritten)
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const args = process.argv.slice(2)
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => [a.replace(/^--/, '').split('=')[0], a.includes('=') ? a.split('=').slice(1).join('=') : true]))
const files = args.filter((a) => !a.startsWith('--'))
if (!files.length) {
  console.error('Give at least one file: npm run pool:import -- yourdata.json [--dry] [--as=posts] [--scope=all]')
  process.exit(1)
}

const { analyzeImport, mergePools } = await loadGeneratorModule('dataImport.ts')

const inputs = files.map((file) => ({ name: path.basename(file), text: fs.readFileSync(file, 'utf8') }))
// --smart: let the embedding model read the texts first (much better at telling what a text is; needs the model in public/models/)
if (flags.smart) {
  const { textsToUnderstand } = await loadGeneratorModule('dataImport.ts')
  const { embed, nearest, unpackVectors } = await loadGeneratorModule('ml/embeddings.ts')
  const { Probe } = await loadGeneratorModule('ml/linearProbe.ts')
  const { rememberKind } = await loadGeneratorModule('ml/kinds.ts')
  const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
  const key = typeof flags.model === 'string' ? flags.model : ACTIVE_MODEL
  const model = EMBEDDING_MODELS[key]
  const dir = `public/models/vectors/${key}`
  if (!model || !fs.existsSync(`${dir}/kinds.json`)) {
    console.error(`--smart needs ${dir}/kinds.json (run: npm run build:embeddings -- --model=${key})`)
    process.exit(1)
  }
  const vectors = unpackVectors(JSON.parse(fs.readFileSync(`${dir}/kinds.json`, 'utf8')))
  const probe = fs.existsSync(`${dir}/kinds-probe.json`) ? new Probe(JSON.parse(fs.readFileSync(`${dir}/kinds-probe.json`, 'utf8'))) : undefined
  const texts = [...new Set(textsToUnderstand(inputs))]
  const embedded = await embed(texts, { localModelPath: `${process.cwd()}/public/models/`, model: model.name, prefix: model.prefix })
  texts.forEach((text, i) => {
    const a = nearest(embedded[i], vectors)
    const b = probe?.predict(embedded[i])
    rememberKind(text, Object.fromEntries(Object.keys(a).map((label) => [label, b ? (a[label] + b[label]) / 2 : a[label]])))
  })
  console.log(`(smart reading with ${key}: ${texts.length} texts read by meaning)`)
}
const options = { scope: flags.scope ?? 'auto', minRating: flags['min-rating'] ? Number(flags['min-rating']) : undefined, overrides: {} }
let report = analyzeImport(inputs, options)
if (flags.as) {
  const overrides = Object.fromEntries(report.collections.map((collection) => [collection.id, flags.as]))
  report = analyzeImport(inputs, { ...options, overrides })
}

for (const c of report.collections) {
  const label = c.kind === 'skip' ? 'not imported' : `${c.kind} (${c.confidence}% sure)`
  console.log(`\n${c.source} › ${c.path}  [${c.rows} rows]  -> ${label}${c.kind !== 'skip' ? `, ${c.imported} imported` : ''}`)
  const used = Object.entries(c.fields).map(([part, field]) => `${part} <- ${field}`).join(', ')
  if (used) console.log(`   read from: ${used}`)
  for (const s of c.skipped) console.log(`   left out: ${s.count} x ${s.reason}`)
  for (const note of c.notes) console.log(`   note: ${note}`)
  if (c.samples.length) console.log(`   e.g. ${c.samples.join(' | ')}`)
}
for (const warning of report.warnings) console.log(`\n! ${warning}`)

const total = Object.values(report.pool).reduce((sum, list) => sum + list.length, 0)
if (flags.dry) {
  console.log(`\n(dry run) ${total} entries would be added. Nothing was written.`)
  process.exit(0)
}
if (!total) {
  console.log('\nNothing to add. Use --as=posts|team|reviews|faq|gallery|business to say what the data is.')
  process.exit(1)
}

const out = path.resolve(typeof flags.out === 'string' ? flags.out : 'src/data/dataPool.json')
let existing = {}
if (fs.existsSync(out)) {
  try {
    existing = JSON.parse(fs.readFileSync(out, 'utf8'))
  } catch (error) {
    console.error(`\n${out} is not valid JSON (${error.message}). Fix it first (npm run pool:check).`)
    process.exit(1)
  }
  fs.copyFileSync(out, `${out}.bak`)
}
const merged = mergePools(existing, report.pool)
fs.writeFileSync(out, `${JSON.stringify(merged, null, 2)}\n`)
console.log(`\n✔ ${total} entries added to ${path.relative(process.cwd(), out)}${fs.existsSync(`${out}.bak`) ? ` (the previous file is saved as ${path.basename(out)}.bak)` : ''}. Check it with: npm run pool:check`)
