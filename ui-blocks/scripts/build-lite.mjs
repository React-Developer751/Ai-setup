// A build without the 150 MB of embedding model files: the page works fully offline-first, and "Smart understanding" fetches its model
// from another address (a CDN or any static host). Usage:
//   npm run build:lite -- --models-url=https://cdn.example.com/models/
// Upload public/models/ (Xenova/ and vectors/) to that address once. Without --models-url the smart mode is simply not offered by a working
// address (it tells the person that the model could not be loaded) and everything else keeps working.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const url = process.argv.find((a) => a.startsWith('--models-url='))?.split('=').slice(1).join('=')
const env = { ...process.env, ...(url ? { VITE_MODELS_URL: url } : {}) }
execSync('npm run build', { stdio: 'inherit', env })
const heavy = path.resolve('dist/models/Xenova')
if (fs.existsSync(heavy)) fs.rmSync(heavy, { recursive: true, force: true })
// the example vectors are fetched from the same address as the model, so they leave the build too
if (url) fs.rmSync(path.resolve('dist/models'), { recursive: true, force: true })
const size = (dir) => (fs.existsSync(dir) ? Number(execSync(`du -sk "${dir}"`).toString().split('\t')[0]) / 1024 : 0)
console.log(`\ndist is now ${size('dist').toFixed(1)} MB (the model files were removed from it)`)
console.log(url ? `smart understanding will load its model from ${url}` : 'no --models-url given: host public/models/ yourself and rebuild with --models-url=... to offer smart understanding')
