// Runs the edit parser on the end-to-end test set (src/data/training/raw/edit-commands-test.jsonl or the merged file) and lists misses.
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const file = process.argv[2] ?? 'src/data/training/edit-commands.test.jsonl'
const path = fs.existsSync(file) ? file : 'src/data/training/raw/edit-commands-test.jsonl'
const { parseEdit } = await loadGeneratorModule('edit/understand.ts')
const rows = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
let ok = 0
const misses = []
for (const row of rows) {
  const got = parseEdit(row.text, row.context)
  const e = row.expect
  const pass = e.control ? got.kind === 'control' && got.control === e.control : e.newSite ? got.kind === 'newSite' : got.kind === 'ops' ? same(got.ops, e.ops) : e.ops.length === 0
  if (pass) ok += 1
  else misses.push({ text: row.text, context: row.context, expect: e, got: got.kind === 'ops' ? got.ops : got })
}
console.log(`${ok}/${rows.length} = ${((100 * ok) / rows.length).toFixed(1)}%`)
for (const m of misses) console.log(`\n✗ [${m.context}] ${m.text}\n   want ${JSON.stringify(m.expect.ops ?? m.expect)}\n   got  ${JSON.stringify(m.got)}`)
