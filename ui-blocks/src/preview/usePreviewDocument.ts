// Builds the HTML document of the current site (the same one the "One .html file" export makes), for the preview frame and for the
// "Preview" button. Building the library page mounts React components in memory, which must not happen while React renders:
// so it is done in a timer, and the document is `undefined` until it is ready.
import { useEffect, useState } from 'react'

export function usePreviewDocument(build: () => string, deps: unknown[]) {
  const [html, setHtml] = useState<string>()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setHtml(build())
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setHtml(`<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;padding:24px;color:#b91c1c">The preview could not be built: ${message.replace(/</g, '&lt;')}</body>`)
      }
    }, 0)
    return () => window.clearTimeout(timer)
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- `build` is recreated on every render; `deps` says when the site changed
  }, deps)
  return html
}
