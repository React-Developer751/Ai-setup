// Tests of saving and opening projects (pure code; a small fake localStorage stands in for the browser's).
const data = new Map()
globalThis.localStorage = { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => { if (String(v).length > 4_500_000) throw new Error('quota'); data.set(k, String(v)) }, removeItem: (k) => data.delete(k) }
import { loadGeneratorModule } from './lib/load-generator.mjs'

let pass = 0
const fail = []
const ok = (c, name) => (c ? (pass += 1) : fail.push(name))
const { parseProject, saveProject, listProjects, deleteProject, rememberSession, lastSession, forgetSession, projectFromJson, projectToJson, projectFileName } = await loadGeneratorModule('projects.ts')

const snap = (extra = {}) => ({ v: 1, prompt: 'bakery in Jaipur called Sweet Crumb', variation: 2, level: 'premium', creative: true, motion: 'auto', engine: 'templates', pages: 'multi', history: [{ text: 'rename', ops: [{ op: 'rename', name: 'Zen Cafe' }] }, { text: 'dark', ops: [{ op: 'mode', mode: 'dark' }] }], details: { phone: '98765 43210' }, ...extra })

// save, list, replace by name, delete
ok(saveProject('Sweet Crumb', snap()).ok, 'save works')
ok(listProjects().length === 1 && listProjects()[0].history.length === 2 && listProjects()[0].variation === 2, 'the project is listed with its changes')
saveProject('sweet crumb', snap({ variation: 5 }))
ok(listProjects().length === 1 && listProjects()[0].variation === 5, 'the same name replaces the old project')
saveProject('Other', snap())
ok(listProjects().length === 2, 'two names, two projects')
deleteProject(listProjects()[0].id)
ok(listProjects().length === 1, 'delete removes one')
for (let i = 0; i < 30; i += 1) saveProject(`P${i}`, snap())
ok(listProjects().length === 20, 'at most 20 projects are kept')

// everything from outside is checked again
const evil = { v: 1, prompt: 'x', history: [{ text: 't', ops: [{ op: 'remove', section: 'nope' }, { op: 'rename', name: 'Fine' }, { op: 'photos', hero: 'javascript:alert(1)' }] }], details: { phone: 'p', logo: 'javascript:alert(1)', hero: 'data:text/html;base64,AAAA' }, level: 'hack', motion: 'x', engine: 'q' }
const clean = parseProject(evil)
ok(clean && clean.history.length === 1 && clean.history[0].ops.length === 1 && clean.history[0].ops[0].op === 'rename', 'invalid operations are dropped when a project is read')
ok(clean.details.logo === undefined && clean.details.hero === undefined, 'bad pictures in the details are dropped')
ok(clean.level === 'auto' && clean.motion === 'auto' && clean.engine === 'library', 'bad settings fall back to defaults')
ok(parseProject(null) === undefined && parseProject({ v: 2, prompt: 'x' }) === undefined && parseProject({ v: 1, prompt: '' }) === undefined && parseProject({ v: 1, prompt: 'a'.repeat(5000) }) === undefined, 'broken projects are refused')
ok(projectFromJson('not json') === undefined && projectFromJson('{"v":1}') === undefined, 'broken files are refused')

// file round trip
const project = parseProject({ ...snap(), id: 'file', name: 'Glow & Co.', savedAt: new Date().toISOString() })
const again = projectFromJson(projectToJson(project))
ok(JSON.stringify(again) === JSON.stringify(project), 'a project survives the file round trip')
ok(projectFileName(project) === 'glow-co.website.json', 'a clean file name')

// big pictures do not break saving
const big = `data:image/jpeg;base64,${'A'.repeat(430000)}`
const bigOps = { text: 'photos', ops: [{ op: 'photos', hero: big, about: big, gallery: [big, big, big, big, big, big] }] }
const result = saveProject('Big', snap({ history: [bigOps, { text: 'rename', ops: [{ op: 'rename', name: 'Keep Me' }] }] }))
ok(result.ok && result.trimmed, 'too many pictures: saved without them, and the person is told')
const saved = listProjects().find((p) => p.name === 'Big')
ok(saved && saved.history.length === 1 && saved.history[0].ops[0].name === 'Keep Me', 'the changes stay when only the pictures are left out')
ok(saveProject('Small pics', snap({ history: [{ text: 'p', ops: [{ op: 'photos', hero: `data:image/jpeg;base64,${'A'.repeat(5000)}` }] }] })).trimmed === false, 'small pictures are kept')

// the last session
rememberSession(snap({ details: { phone: '1', logo: `data:image/png;base64,${'B'.repeat(100)}` } }))
ok(lastSession()?.prompt === 'bakery in Jaipur called Sweet Crumb' && lastSession()?.details.logo === undefined, 'the last session is remembered without pictures')
forgetSession()
ok(lastSession() === undefined, 'the session can be forgotten')

console.log(`${pass} passed, ${fail.length} failed`)
for (const f of fail) console.log(`  ✗ ${f}`)
process.exit(fail.length ? 1 : 0)
