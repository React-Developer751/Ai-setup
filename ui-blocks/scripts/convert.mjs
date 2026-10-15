// HTML snippet (.ts) -> React component (.tsx) converter.
// Only syntax required by JSX is changed (class -> className, SVG attrs -> camelCase,
// comments -> {/* */}, void tags self-closed, inline style -> object). Markup/classes/text stay as-is.
import fs from 'node:fs'
import path from 'node:path'

const SRC = process.argv[2]
const OUT = process.argv[3]

// source folder -> [output folder, component base name]
const MAP = {
  header: ['header', 'Header'],
  footer: ['footer', 'Footer'],
  contact: ['contact', 'Contact'],
  cta: ['cta', 'Cta'],
  features: ['features', 'Features'],
  content: ['content', 'Content'],
  blog: ['blog', 'Blog'],
  gallery: ['gallery', 'Gallery'],
  hero: ['hero', 'Hero'],
  navbar: ['navbar', 'Navbar'],
  pricing: ['pricing', 'Pricing'],
  statics: ['statics', 'Statics'],
  step: ['step', 'Step'],
  team: ['team', 'Team'],
  testimonial: ['testimonial', 'Testimonial'],
}

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'embed', 'track'])

const ATTR_MAP = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  frameborder: 'frameBorder',
  marginwidth: 'marginWidth',
  marginheight: 'marginHeight',
  scrolling: 'scrolling',
  allowfullscreen: 'allowFullScreen',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  crossorigin: 'crossOrigin',
  srcset: 'srcSet',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  datetime: 'dateTime',
  enctype: 'encType',
  novalidate: 'noValidate',
  referrerpolicy: 'referrerPolicy',
  contenteditable: 'contentEditable',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang',
  'xlink:href': 'xlinkHref',
  viewbox: 'viewBox',
}

const NUMERIC_ATTRS = new Set(['marginWidth', 'marginHeight', 'tabIndex', 'colSpan', 'rowSpan', 'maxLength', 'minLength'])

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

function mapAttrName(name, tag) {
  const lower = name.toLowerCase()
  if (name.startsWith('data-') || name.startsWith('aria-')) return name
  if ((tag === 'input' || tag === 'textarea' || tag === 'select') && lower === 'value') return 'defaultValue'
  if (tag === 'input' && lower === 'checked') return 'defaultChecked'
  if (ATTR_MAP[lower]) return ATTR_MAP[lower]
  if (name.includes('-')) return camel(name)
  return name
}

function styleToObject(css) {
  const props = css
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const i = decl.indexOf(':')
      const k = decl.slice(0, i).trim()
      const v = decl.slice(i + 1).trim()
      const key = k.startsWith('--') ? `'${k}'` : camel(k)
      return `${key}: '${v.replace(/'/g, "\\'")}'`
    })
  return `{{ ${props.join(', ')} }}`
}

const ATTR_RE = /([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g

function convertTag(tagSource) {
  const m = /^<\s*([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(tagSource)
  const tag = m[1]
  const rest = m[2]
  const selfClosed = m[3] === '/'
  let out = `<${tag}`
  let match
  ATTR_RE.lastIndex = 0
  const attrs = rest.replace(/\/\s*$/, '')
  while ((match = ATTR_RE.exec(attrs))) {
    const name = match[1]
    let value = match[2]
    const jsxName = mapAttrName(name, tag)
    if (value === undefined) {
      out += ` ${jsxName}`
      continue
    }
    if (value[0] !== '"' && value[0] !== "'") value = `"${value}"`
    if (name.toLowerCase() === 'style') {
      out += ` style=${styleToObject(value.slice(1, -1))}`
    } else if (NUMERIC_ATTRS.has(jsxName) && /^-?\d+$/.test(value.slice(1, -1))) {
      out += ` ${jsxName}={${value.slice(1, -1)}}`
    } else {
      out += ` ${jsxName}=${value}`
    }
  }
  out += selfClosed || VOID.has(tag.toLowerCase()) ? ' />' : '>'
  return out
}

const TOKEN_RE = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^\s/>]*(?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/g

function convertBody(html) {
  let depth = 0
  let roots = 0
  const out = html.replace(TOKEN_RE, (tok) => {
    if (tok.startsWith('<!--')) {
      return `{/*${tok.slice(4, -3).replace(/\*\//g, '* /')}*/}`
    }
    const closing = tok.startsWith('</')
    const nameMatch = /^<\/?\s*([a-zA-Z][\w:-]*)/.exec(tok)
    const tag = nameMatch[1].toLowerCase()
    if (closing) {
      depth--
      return tok
    }
    const selfClosed = /\/\s*>$/.test(tok) || VOID.has(tag)
    if (depth === 0) roots++
    if (!selfClosed) depth++
    return convertTag(tok)
  })
  return { out, roots }
}

function convertFile(folder, file) {
  const [outDir, base] = MAP[folder]
  const num = file.match(/(\d+)\.ts$/)[1]
  const name = `${base}${num}`
  // Known source typo: class attribute closed with ' instead of " (hero/her1.ts)
  const raw = fs.readFileSync(path.join(SRC, folder, file), 'utf8').trim().replace(/(animate-\[hs-hero-day-night_22s_ease-in-out_infinite\])' style=/g, '$1" style=')
  if (!raw) return null

  // Comments wrapping the whole snippet can't live inside `return (...)`; keep leading ones as JS comments.
  const lead = raw.match(/^(?:\s*<!--[\s\S]*?-->)+/)?.[0] ?? ''
  const leadComments = [...lead.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => `  //${m[1].replace(/\n/g, ' ')}`).join('\n')
  let inner = raw.slice(lead.length).trim()
  for (let m; (m = /<!--(?:(?!-->)[\s\S])*-->$/.exec(inner)); ) inner = inner.slice(0, m.index).trim()

  const { out, roots } = convertBody(inner)
  const body = out.split('\n').map((l) => (l.trim() ? '    ' + l : l)).join('\n')
  const wrap = roots > 1
  const jsx = wrap ? `    <>\n${body.split('\n').map((l) => (l ? '  ' + l : l)).join('\n')}\n    </>` : body

  const code = `export default function ${name}() {\n${leadComments ? leadComments + '\n' : ''}  return (\n${jsx}\n  )\n}\n`
  const dir = path.join(OUT, outDir)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${name}.tsx`), code)
  return `${outDir}/${name}`
}

const done = []
const skipped = []
for (const folder of Object.keys(MAP)) {
  const dir = path.join(SRC, folder)
  if (!fs.existsSync(dir)) continue
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const r = convertFile(folder, file)
    if (r) done.push(r)
    else skipped.push(`${folder}/${file}`)
  }
}
console.log(`converted: ${done.length}`)
console.log(`skipped (empty): ${skipped.length}`)
if (skipped.length) console.log(skipped.join(' '))
