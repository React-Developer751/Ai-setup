import { Component, type ErrorInfo, type ReactNode } from 'react'

type State = { error?: Error }

/** A crash in one part of the page shows a message and a way back instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The page crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-red-800">The page hit an error. Your prompt and changes are not saved, but you can start again.</p>
        <p className="mt-2 break-words text-xs text-red-700">{this.state.error.message}</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          Reload
        </button>
      </div>
    )
  }
}
