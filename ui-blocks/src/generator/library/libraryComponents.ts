// id ("hero/Hero12") -> the real component from src/components.
import type { ComponentType } from 'react'

const modules = import.meta.glob<{ default: ComponentType }>('../../components/*/*.tsx', { eager: true })

export const libraryComponents: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.match(/components\/(.+)\.tsx$/)![1], mod.default]),
)
