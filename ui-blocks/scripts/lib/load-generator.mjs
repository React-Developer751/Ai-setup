// Loads TypeScript files of src/generator into plain Node: the file and the local files it imports are transpiled into one temporary
// folder (inside the project, so that packages in node_modules are found). Used by the scripts, so they run the same code as the
// page. Several calls share the folder, so two files that import the same module get the same instance of it.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = path.resolve('src/generator')
let temp
const done = new Set()

function build(source) {
  if (done.has(source)) return
  done.add(source)
  let js = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false },
  }).outputText
  // the pool file itself is read by the scripts, not bundled
  js = js.replace(/^import rawPool from .*$/m, 'const rawPool = {}')
  // other JSON files (the trained models) are put into the module as they are
  js = js.replace(/^import (\w+) from ['"](\.{1,2}\/[^'"]+\.json)['"];?$/gm, (match, name, spec) => {
    const file = path.resolve(path.dirname(source), spec)
    return fs.existsSync(file) ? `const ${name} = JSON.parse(${JSON.stringify(fs.readFileSync(file, 'utf8'))});` : match
  })
  js = js.replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, (match, open, spec, close) => {
    const base = path.resolve(path.dirname(source), spec)
    const resolved = fs.existsSync(`${base}.ts`) ? `${base}.ts` : fs.existsSync(path.join(base, 'index.ts')) ? path.join(base, 'index.ts') : null
    if (!resolved) return match
    build(resolved)
    return `${open}${spec.replace(/\/$/, '')}${fs.existsSync(`${base}.ts`) ? '.mjs' : '/index.mjs'}${close}`
  })
  const target = path.join(temp, path.relative(root, source)).replace(/\.ts$/, '.mjs')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, js)
}

export async function loadGeneratorModule(file) {
  if (!temp) {
    const cache = path.resolve('node_modules/.cache')
    fs.mkdirSync(cache, { recursive: true })
    temp = fs.mkdtempSync(path.join(cache, 'generator-'))
    process.on('exit', () => fs.rmSync(temp, { recursive: true, force: true }))
  }
  build(path.join(root, file))
  return import(pathToFileURL(path.join(temp, file.replace(/\.ts$/, '.mjs'))).href)
}
