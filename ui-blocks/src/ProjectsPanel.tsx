import { useState } from 'react'
import { projectFileName, projectFromJson, projectToJson, type Project } from './generator/projects'

type Props = {
  projects: Project[]
  message: string
  onSave: (name: string) => void
  onLoad: (project: Project) => void
  onDelete: (id: string) => void
  /** a project read from a file the person chose */
  onImport: (project: Project) => void
  onExportCurrent: (name: string) => Project
  onMessage: (text: string) => void
}

/** Save the work in this browser, keep it as a file, or open a file again. */
function ProjectsPanel({ projects, message, onSave, onLoad, onDelete, onImport, onExportCurrent, onMessage }: Props) {
  const [name, setName] = useState('')

  const download = () => {
    const project = onExportCurrent(name)
    const url = URL.createObjectURL(new Blob([projectToJson(project)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = projectFileName(project)
    a.click()
    URL.revokeObjectURL(url)
  }

  const open = async (file: File | undefined) => {
    if (!file) return
    const project = projectFromJson(await file.text())
    if (!project) return onMessage('That file is not a website project of this tool.')
    onImport(project)
  }

  return (
    <details className="rounded-xl border border-gray-200 bg-white">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">My projects ▾</summary>
      <div className="space-y-2.5 px-3 pb-3 text-xs text-gray-600">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. Glow Studio" aria-label="Project name" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          <button type="button" onClick={() => onSave(name)} className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Save
          </button>
        </div>
        {message && <p className="text-gray-700">{message}</p>}
        {projects.length > 0 && (
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                <span className="min-w-0 flex-1 truncate" title={p.prompt}>
                  <b className="text-gray-800">{p.name}</b> <span className="text-gray-400">{new Date(p.savedAt).toLocaleDateString()}</span>
                </span>
                <button type="button" onClick={() => onLoad(p)} className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                  Open
                </button>
                <button type="button" onClick={() => onDelete(p.id)} aria-label={`Delete ${p.name}`} className="rounded-md px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Download file
          </button>
          <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Open file
            <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => void open(e.target.files?.[0])} />
          </label>
        </div>
        <p className="text-[11px] text-gray-500">Projects stay in this browser. The file holds everything (also big pictures) and can be opened on another computer.</p>
      </div>
    </details>
  )
}

export default ProjectsPanel
