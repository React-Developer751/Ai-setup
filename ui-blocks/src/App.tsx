import { useState } from 'react'
import ComponentLibrary from './ComponentLibrary'
import GeneratorPage from './GeneratorPage'

const MODES = {
  generator: { label: 'Website Generator', Page: GeneratorPage },
  library: { label: 'Component Library', Page: ComponentLibrary },
} as const

type Mode = keyof typeof MODES

function App() {
  const [mode, setMode] = useState<Mode>('generator')
  const { Page } = MODES[mode]

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
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
      <Page />
    </div>
  )
}

export default App
