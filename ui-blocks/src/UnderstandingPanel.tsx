// "How the generator understood your prompt": the business type it picked (and how sure it is, and who decided), a way to correct it
// (the correction is learned at once and can be downloaded as training data), the switch for the embedding model ("smart"), and a
// thumbs up / down for the site on screen.
import { useState, useSyncExternalStore } from 'react'
import { addFeedback, clearFeedback, correctionsJsonl, getFeedback, ratingsJsonl } from './generator/ml/feedback'
import { EMBEDDING_MODELS } from './generator/ml/models'
import { forgetCorrections, getCorrections, getLearningVersion, subscribeLearning, teachTheme } from './generator/ml/learned'
import { setSmart, smartStatus, smartVersion, subscribeSmart } from './generator/ml/smart'
import { decideTheme } from './generator/themeClassifier'
import { THEME_KEYS } from './generator/themes'
import { downloadFile } from './generator/zip'

type Props = {
  prompt: string
  /** the site on screen, for the rating */
  site: { theme: string; tier: string; variation: number; layout: string }
  /** asks the page to generate again (the model needs the prompt) */
  onSmartReady: () => void
}

const label = (key: string) => key.replace(/_/g, ' ')

function UnderstandingPanel({ prompt, site, onSmartReady }: Props) {
  useSyncExternalStore(subscribeLearning, getLearningVersion)
  useSyncExternalStore(subscribeSmart, smartVersion)
  const [, refresh] = useState(0)
  const [model, setModel] = useState(smartStatus().model)
  const decision = decideTheme(prompt)
  const smart = smartStatus()
  const rated = getFeedback().find((e) => e.type === 'rating' && e.text === prompt && e.theme === site.theme && e.tier === site.tier && e.variation === site.variation)
  const top = Object.entries(decision.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const corrections = getCorrections().length
  const feedbackCount = getFeedback().length

  const correct = (value: string) => {
    if (!value || value === decision.theme) return
    addFeedback({ type: 'theme', text: prompt, predicted: decision.theme, label: value })
    teachTheme(prompt, value)
    refresh((n) => n + 1)
  }
  const rate = (good: boolean) => {
    addFeedback({ type: 'rating', text: prompt, theme: site.theme, tier: site.tier, variation: site.variation, layout: site.layout, good })
    refresh((n) => n + 1)
  }
  const turn = async (on: boolean) => {
    await setSmart(on, prompt, model)
    onSmartReady()
  }

  return (
    <div className="basis-full space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
      <div className="flex flex-wrap items-center gap-2">
        <span>
          Understood as <b className="text-gray-900">{label(decision.theme)}</b>
          {decision.source === 'correction' && <span className="text-emerald-700"> (you said so)</span>}
          {decision.source === 'blend' && <> · {Math.round(decision.confidence * 100)}% sure ({decision.sources.join(' + ')})</>}
          {decision.source === 'default' && <> · no clear signal, a general business page</>}
        </span>
        <label className="flex items-center gap-1">
          Not right?
          <select value="" onChange={(e) => correct(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1" aria-label="Correct the business type">
            <option value="">choose the right one…</option>
            {THEME_KEYS.map((key) => (
              <option key={key} value={key}>
                {label(key)}
              </option>
            ))}
          </select>
        </label>
        {top.length > 1 && <span className="text-gray-400">next: {top.slice(1).map(([key, p]) => `${label(key)} ${Math.round(p * 100)}%`).join(', ')}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={smart.status === 'ready' || smart.status === 'loading'} onChange={(e) => turn(e.target.checked)} />
          <b className="text-gray-800">Smart understanding</b> (reads the meaning, not only the words)
        </label>
        <select
          value={model}
          onChange={(e) => {
            setModel(e.target.value)
            if (smart.status === 'ready' || smart.status === 'loading') void setSmart(true, prompt, e.target.value).then(onSmartReady)
          }}
          className="rounded-md border border-gray-300 px-2 py-1"
          aria-label="Smart model"
        >
          {Object.entries(EMBEDDING_MODELS).map(([key, m]) => (
            <option key={key} value={key}>
              {m.megabytes} MB · {m.note}
            </option>
          ))}
        </select>
        <span className={smart.status === 'error' ? 'text-red-600' : smart.status === 'ready' ? 'text-emerald-700' : 'text-gray-500'}>
          {smart.status === 'ready' ? 'on' : smart.status === 'loading' ? smart.detail || 'loading…' : smart.status === 'error' ? `could not start: ${smart.detail}` : 'off'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span>This site:</span>
        <button type="button" onClick={() => rate(true)} aria-pressed={rated?.type === 'rating' && rated.good} className={`rounded-md px-2 py-1 ${rated?.type === 'rating' && rated.good ? 'bg-emerald-600 text-white' : 'bg-white ring-1 ring-gray-300 hover:bg-gray-100'}`}>
          👍 good
        </button>
        <button type="button" onClick={() => rate(false)} aria-pressed={rated?.type === 'rating' && !rated.good} className={`rounded-md px-2 py-1 ${rated?.type === 'rating' && !rated.good ? 'bg-red-600 text-white' : 'bg-white ring-1 ring-gray-300 hover:bg-gray-100'}`}>
          👎 not good
        </button>
        {feedbackCount > 0 && (
          <>
            <span className="text-gray-400">{corrections} correction{corrections === 1 ? '' : 's'} learned · {feedbackCount} feedback saved</span>
            <button type="button" onClick={() => downloadFile('corrections.jsonl', `${correctionsJsonl()}\n`, 'application/x-ndjson')} className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-300 hover:bg-gray-100">
              Download corrections (for training)
            </button>
            <button type="button" onClick={() => downloadFile('ratings.jsonl', `${ratingsJsonl()}\n`, 'application/x-ndjson')} className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-300 hover:bg-gray-100">
              Download ratings
            </button>
            <button
              type="button"
              onClick={() => {
                forgetCorrections()
                clearFeedback()
                refresh((n) => n + 1)
              }}
              className="rounded-md px-2 py-1 text-red-700 ring-1 ring-red-200 hover:bg-red-50"
            >
              Forget
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default UnderstandingPanel
