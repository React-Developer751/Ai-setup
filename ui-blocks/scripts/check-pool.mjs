// Checks src/data/dataPool.json with the same code the generator uses, and says what is usable and what is left out.
//   npm run pool:check            (or: node scripts/check-pool.mjs path/to/other.json)
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const file = process.argv[2] ?? 'src/data/dataPool.json'
let parsed
try {
  parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch (error) {
  console.error(`✖ ${file} is not valid JSON: ${error.message}`)
  process.exit(1)
}

// run the generator's own reader
const { readPool, poolSummary } = await loadGeneratorModule('dataPool.ts')

const pool = readPool(parsed)
const summary = poolSummary(pool)
console.log(`✔ ${file}: ${summary.text} (mode: ${summary.mode})`)
for (const problem of summary.problems) console.log(`  ⚠ left out: ${problem}`)
const unknown = Object.keys(parsed).filter((key) => !['_about', 'settings', 'posts', 'team', 'reviews', 'faq', 'gallery', 'businesses'].includes(key))
for (const key of unknown) console.log(`  ⚠ unknown section "${key}" is ignored`)
process.exit(summary.problems.length || unknown.length ? 1 : 0)
