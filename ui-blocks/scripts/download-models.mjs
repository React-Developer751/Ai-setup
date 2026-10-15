// Downloads the embedding model files into public/models/ (they are big, so they are not kept in git). The WebAssembly runtime that
// runs them comes with the npm package (onnxruntime-web).
//   npm run models:download                 the default model (see src/generator/ml/models.ts)
//   npm run models:download -- --all        every model
//   npm run models:download -- --model=all-MiniLM-L6-v2
import fs from 'node:fs'
import path from 'node:path'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
const wanted = process.argv.includes('--all')
  ? Object.keys(EMBEDDING_MODELS)
  : [process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? ACTIVE_MODEL]

const FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'special_tokens_map.json', 'onnx/model_quantized.onnx']

for (const key of wanted) {
  const model = EMBEDDING_MODELS[key]
  if (!model) {
    console.error(`Unknown model "${key}". Known: ${Object.keys(EMBEDDING_MODELS).join(', ')}`)
    process.exit(1)
  }
  console.log(`${model.name} (${model.megabytes} MB)`)
  for (const file of FILES) {
    const target = path.join('public/models', model.name, file)
    if (fs.existsSync(target) && fs.statSync(target).size > 0) {
      console.log(`  have ${file}`)
      continue
    }
    fs.mkdirSync(path.dirname(target), { recursive: true })
    const response = await fetch(`https://huggingface.co/${model.name}/resolve/main/${file}`)
    if (!response.ok) {
      if (file === 'special_tokens_map.json') continue
      throw new Error(`${file}: HTTP ${response.status}`)
    }
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()))
    console.log(`  downloaded ${file} (${(fs.statSync(target).size / 1e6).toFixed(1)} MB)`)
  }
}

