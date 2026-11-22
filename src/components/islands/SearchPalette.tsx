import { useEffect, useState, useCallback } from 'react'
import { t } from '@/i18n/index'
import type { Lang } from '@/i18n/config'

interface Props {
  lang: Lang
}

const STORAGE_KEY = 'formulo:search-history:v1'

export default function SearchPalette({ lang }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [formulaResults, setFormulaResults] = useState<any[]>([])
  const [exerciseResults, setExerciseResults] = useState<any[]>([])
  
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (query.trim() && !searchHistory.includes(query)) {
      const updated = [query, ...searchHistory].slice(0, 4)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
    }
  }, [query, searchHistory])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setFormulaResults([])
        setExerciseResults([])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const all = [...formulaResults, ...exerciseResults]
      if (all.length > 0) {
        window.location.href = all[0].item.url || '#'
        setOpen(false)
      } else if (query.trim()) {
        setOpen(false)
        window.location.href = `/${lang}/formules/?q=${encodeURIComponent(query)}`
      }
    }
  }, [query, formulaResults, exerciseResults])

  if (!open && query === '') return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[var(--z-search)]">
      <div className="flex min-h-screen items-center justify-center bg-bg/60 backdrop-blur-sm">
        <div className="search-palette-wrapper max-w-md w-full bg-bg border-b border-border rounded-t-lg p-4">
          <div className="relative w-full">
            <input
              type="search"
              value={query}
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-3 pr-12 bg-surface border border-border strong rounded-xl text-text outline-none focus:ring-2 focus:ring-primary focus-ring-offset-2"
              autoComplete="off"
              aria-label={t(lang, 'nav.search')}
            />
            <button onClick={() => setOpen(!open)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full">
              {open ? '<svg />' : '<svg />'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}