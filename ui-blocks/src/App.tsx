import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import GeneratorPage from './GeneratorPage'

// the catalogue of the 92 stored components is only needed when its tab is opened
const ComponentLibrary = lazy(() => import('./ComponentLibrary'))

const MODES = {
  generator: { label: 'Website Generator', Page: GeneratorPage },
  library: { label: 'Component Library', Page: ComponentLibrary },
} as const

type Mode = keyof typeof MODES

function App() {
  const [mode, setMode] = useState<Mode>('generator')
  const { Page } = MODES[mode]

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-1.5">
        {(Object.keys(MODES) as Mode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              mode === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>
      <div className={mode === 'generator' ? 'flex min-h-0 flex-1 flex-col overflow-auto lg:overflow-hidden' : 'min-h-0 flex-1 overflow-auto'}>
        <ErrorBoundary key={mode}>
          <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading ...</p>}>
            <Page />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
