import { useEffect, useMemo, useState } from 'react'

type Block = { name: string; Component: React.ComponentType }

const modules = import.meta.glob<{ default: React.ComponentType }>('./components/*/*.tsx', { eager: true })

const sortByNumber = (a: Block, b: Block) =>
  Number(a.name.match(/\d+$/)?.[0]) - Number(b.name.match(/\d+$/)?.[0])

function ComponentLibrary() {
  const groups = useMemo(() => {
    const result: Record<string, Block[]> = {}
    for (const [path, mod] of Object.entries(modules)) {
      const [, category, file] = path.match(/\.\/components\/([^/]+)\/([^/]+)\.tsx$/)!
      ;(result[category] ??= []).push({ name: file, Component: mod.default })
    }
    Object.values(result).forEach((list) => list.sort(sortByNumber))
    return result
  }, [])

  const categories = Object.keys(groups)
  const [active, setActive] = useState(categories[0])

  // Preline wires up collapse / dropdown behaviour for the header blocks.
  useEffect(() => {
    import('preline').then(({ HSStaticMethods }) => HSStaticMethods.autoInit())
  }, [active])

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-[60] flex flex-wrap gap-2 border-b border-gray-200 bg-white p-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              active === category ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category} ({groups[category].length})
          </button>
        ))}
      </div>

      {groups[active].map(({ name, Component }) => (
        <section key={name} className="border-b-4 border-dashed border-gray-300">
          <p className="bg-gray-50 px-4 py-1 text-xs font-semibold text-gray-500">{name}</p>
          <Component />
        </section>
      ))}
    </div>
  )
}

export default ComponentLibrary
