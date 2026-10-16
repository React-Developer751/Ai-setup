// Files that make the static folder ready for a real host: security headers, caching, and a plain deploy guide.
export type DeployFile = { path: string; content: string }

const HEADERS = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=3600
`

const NETLIFY = `# Netlify: drag this folder onto https://app.netlify.com/drop, or connect the repository (no build command needed).
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
`

const guide = (brand: string, fonts: boolean) => `# Putting ${brand} online

This folder is a finished static website: plain HTML, CSS and JavaScript. It needs no server and no build step.

## Fastest ways

1. **Netlify**: open https://app.netlify.com/drop and drag this folder onto the page. You get an address in a minute.
   (netlify.toml and _headers are already here: security headers and caching are set.)
2. **Cloudflare Pages**: create a project, choose "Upload assets", upload this folder.
3. **GitHub Pages**: put the files in a repository, then Settings > Pages > deploy from the branch. (.nojekyll is included.)
4. **Any shared hosting**: upload everything in this folder to the public_html (or www) folder with FTP.

## Before you publish: five minutes

* Replace https://www.example.com with your real address in sitemap.xml, robots.txt and the canonical links (search the files for "example.com").
* Check the phone, email and address everywhere (Contact page, footer, Privacy and Terms). The placeholder email ends in .example on purpose.
* The contact form opens the visitor's email program. To receive messages directly, point the form's "action" at a form service (Formspree, Netlify Forms ...).
* Replace the sample reviews, team names, prices and pictures with real ones. They are examples, not facts about your business.
* The Privacy Policy and Terms are general templates, not legal advice: have them checked.
${fonts ? '* The pages load their typeface from Google Fonts (visitors\' browsers contact Google). If you must avoid that, remove the three <link> lines for fonts.googleapis.com in each page: the site then uses the visitor\'s system fonts.\n' : ''}* If you added a map or a WhatsApp button, they open Google Maps and WhatsApp for the visitor; nothing else is sent anywhere.

## After you publish

* Add the address to Google Search Console and submit sitemap.xml.
* Open the site on a phone and test the form, the phone number link and the WhatsApp button once.
`

export const deployFiles = (brand: string): DeployFile[] => [
  { path: 'netlify.toml', content: NETLIFY },
  { path: '_headers', content: HEADERS },
  { path: '.nojekyll', content: '\n' },
  { path: 'DEPLOY.md', content: guide(brand, true) },
]
