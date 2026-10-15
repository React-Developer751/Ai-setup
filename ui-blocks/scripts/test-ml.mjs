// Checks that the understanding pieces work: features, the learned models, learning a correction, the blend, the text-kind
// models, and (when the model files are there) the embedding model. Fast; run it after training.   npm run test:ml
import fs from 'node:fs'
import { loadGeneratorModule } from './lib/load-generator.mjs'

const problems = []
const ok = (condition, message) => {
  if (!condition) problems.push(message)
}

const features = await loadGeneratorModule('ml/textFeatures.ts')
const classifier = await loadGeneratorModule('themeClassifier.ts')
const learned = await loadGeneratorModule('ml/learned.ts')
const kinds = await loadGeneratorModule('ml/kinds.ts')
const ensemble = await loadGeneratorModule('ml/ensemble.ts')
const sparse = await loadGeneratorModule('ml/sparseModel.ts')

// ── features
ok(features.wordsOf('Meri dukaan, mera DUKKAN!').filter((w) => w === 'dukan').length === 2, 'dukaan / dukkan spellings are one word')
ok(features.wordsOf('दंत चिकित्सक का क्लिनिक').length >= 2, 'Devanagari words are kept')
ok(![...features.featuresOf('gym').keys()].some((k) => k.startsWith('w:the')), 'stop words are not features')

// ── business type: the decision (rules + learned model; no embedding model in Node here)
const cases = {
  'dentist in Indore': 'healthcare',
  'mera salon hai Surat me, website chahiye': 'beauty_wellness',
  'shaadi ki decoration karte hain': 'events_wedding',
  'AC repair ka kaam karta hu Delhi me': 'home_services',
  'we sell flats and plots in Noida': 'real_estate',
  'online store for kurtis and sarees': 'fashion_retail',
  'NGO for stray dogs': 'nonprofit',
  'SaaS dashboard startup': 'modern_tech',
  'car rental company': 'automotive',
  'pet grooming and boarding': 'pets_animals',
  'tour packages to Goa and Manali': 'travel_tourism',
  'law firm for property disputes': 'professional_services',
}
let right = 0
for (const [prompt, expected] of Object.entries(cases)) {
  const decision = classifier.decideTheme(prompt)
  if (decision.theme === expected) right++
  else problems.push(`"${prompt}" -> ${decision.theme} (expected ${expected})`)
}
console.log(`business type: ${right}/${Object.keys(cases).length} sample prompts right`)
ok(right >= Object.keys(cases).length - 1, 'too many sample prompts wrong')
ok(classifier.decideTheme('').theme === 'general_business', 'an empty prompt is a neutral business')
ok(classifier.decideTheme('zzzz qqqq').source === 'default', 'nonsense gives no decision')

// ── learning a correction changes the answer, for that text and for close ones
const before = classifier.decideTheme('Ramesh and Sons')
learned.teachTheme('Ramesh and Sons', 'fashion_retail')
const after = classifier.decideTheme('Ramesh and Sons')
ok(after.theme === 'fashion_retail' && after.source === 'correction', 'a correction wins for the same text')
ok(before.theme !== 'fashion_retail' || before.source === 'correction', 'sanity: it was not already fashion_retail')
learned.teachTheme('Ramesh and Sons', 'automotive')
ok(classifier.decideTheme('ramesh  and sons!').theme === 'automotive', 'a changed mind replaces the old correction (case and punctuation do not matter)')
learned.forgetCorrections()
ok(classifier.decideTheme('Ramesh and Sons').source !== 'correction', 'forgetting removes the corrections')

// the model itself learns: a prompt about "pottery classes" taught as education moves a similar one
const model = new sparse.SparseModel(JSON.parse(fs.readFileSync('src/data/models/theme-model.json', 'utf8')))
const similar = 'terracotta pottery wheel sessions'
const wasEducation = model.predict(similar).probabilities.education
model.learn('pottery classes for adults and kids', 'education')
ok(model.predict(similar).probabilities.education > wasEducation, 'learning an example raises that label for similar text')

// ── blend
const rules = ensemble.ruleDistribution({ a: 3, b: 0 })
ok(rules && rules.a > 0.9, 'a keyword score becomes a probability')
ok(ensemble.ruleDistribution({ a: 0, b: 0 }) === undefined, 'no keyword = no opinion')
const mixed = ensemble.blend({ learned: { a: 0.6, b: 0.4 }, meaning: { a: 0.2, b: 0.8 } }, { rules: 1, learned: 1, meaning: 3, probe: 1 })
ok(mixed.label === 'b', 'weights decide: the heavier source wins')
ok(ensemble.blend({}) === undefined, 'no sources = no decision')

// ── text kinds
const kindCases = {
  'I loved the food and the staff were so friendly, will come again!': 'review',
  'Do you deliver at night? Yes, until 11 pm within 5 km.': 'faq',
  'Squat rack at sunrise': 'gallery',
}
for (const [text, expected] of Object.entries(kindCases)) {
  const opinion = kinds.kindDistribution(text)
  const top = opinion && Object.entries(opinion.distribution).sort((a, b) => b[1] - a[1])[0][0]
  ok(top === expected, `kind of "${text.slice(0, 40)}" -> ${top} (expected ${expected})`)
}
kinds.rememberKind('some odd text', { post: 0.9, review: 0.1 })
ok(kinds.kindDistribution('Some odd  text!').source === 'meaning', 'what the embedding model said is remembered per text')

// ── accuracy gates (numbers written by npm run eval / npm run train)
const trainReport = fs.existsSync('src/data/models/train-report.json') ? JSON.parse(fs.readFileSync('src/data/models/train-report.json', 'utf8')) : {}
ok((trainReport.themes?.test ?? 0) >= 0.6, `learned business-type model accuracy ${(trainReport.themes?.test * 100).toFixed(1)}% is below 60%`)
ok((trainReport.kinds?.test ?? 0) >= 0.7, `learned text-kind model accuracy ${(trainReport.kinds?.test * 100).toFixed(1)}% is below 70%`)

// ── the embedding model (only when its files are in public/models/)
const { EMBEDDING_MODELS, ACTIVE_MODEL } = await loadGeneratorModule('ml/models.ts')
const modelDir = `public/models/${EMBEDDING_MODELS[ACTIVE_MODEL].name}/onnx/model_quantized.onnx`
const vectorFile = `public/models/vectors/${ACTIVE_MODEL}/themes.json`
if (fs.existsSync(modelDir) && fs.existsSync(vectorFile)) {
  const { embed, nearest, unpackVectors } = await loadGeneratorModule('ml/embeddings.ts')
  const options = { localModelPath: `${process.cwd()}/public/models/`, model: EMBEDDING_MODELS[ACTIVE_MODEL].name, prefix: EMBEDDING_MODELS[ACTIVE_MODEL].prefix }
  const [a, b, c] = await embed(['dentist clinic', 'tooth doctor', 'cement and steel supplier'], options)
  const dot = (x, y) => x.reduce((s, v, i) => s + v * y[i], 0)
  ok(dot(a, b) > dot(a, c) + 0.05, 'the embedding model puts "dentist clinic" closer to "tooth doctor" than to "cement supplier"')
  const vectors = unpackVectors(JSON.parse(fs.readFileSync(vectorFile, 'utf8')))
  const [q] = await embed(['tooth doctor in Indore'], options)
  const near = nearest(q, vectors)
  ok(Object.entries(near).sort((x, y) => y[1] - x[1])[0][0] === 'healthcare', 'nearest examples of "tooth doctor in Indore" are healthcare')
  console.log(`embedding model ${ACTIVE_MODEL}: ok`)
} else console.log(`embedding model ${ACTIVE_MODEL}: skipped (run npm run models:download and npm run build:embeddings)`)

console.log(problems.length ? `\n${problems.length} problem(s):\n  ${problems.join('\n  ')}` : '\nall checks passed')
process.exit(problems.length ? 1 : 0)
