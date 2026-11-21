import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { t, type Lang, type TranslationKey } from '@/i18n/index'
import { ALL_DOMAINS, DIFFICULTIES, LEVELS, SUBJECTS } from '@/data/taxonomy'
import type { Sort } from '@/lib/filters'
import {
  bindExerciseFilterStoreToUrl,
  exerciseFilterStore,
} from '@/lib/exercise-filter-store'
import {
  filterExercises,
  sortExercises,
  type ExerciseFilterState,
  type SearchExercise,
  type ExerciseKind,
} from '@/lib/exercise-filters'
import { createExerciseSearchIndex, searchExercises } from '@/lib/search'

const INDEX_URL = (lang: Lang) => `/search/${lang}/exercises.json`

function toggle<T>(arr: readonly T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v: T) => v !== value) : [...arr, value]
}

const toggleNum = (arr: number[], value: number): number[] =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

// --- Carte d'exercice (rendu client) ----------------------------------------
function ExerciseCardClient({ exercise, lang }: { exercise: SearchExercise; lang: Lang }) {
  const kindKey = `exercise.kind.${exercise.kind}` as TranslationKey
  const levelLabel = t(lang, 'level.label', { level: exercise.level })
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <a
        href={exercise.url}
        className="text-text hover:text-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
      >
        <h3 className="font-serif text-base font-semibold leading-tight">{exercise.title}</h3>
      </a>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text">
          {t(lang, kindKey)}
        </span>
        <span className="text-xs text-muted">{t(lang, 'exercise.minutes', { count: exercise.estimatedMinutes })}</span>
        <span className="flex gap-1" role="img" aria-label={levelLabel}>
          {LEVELS.map((i: number) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i <= exercise.level ? 'bg-primary' : 'border border-border-strong bg-transparent'}`}
              aria-hidden="true"
            />
          ))}
        </span>
      </div>
    </article>
  )
}

// --- Grille de résultats (rendu client) -------------------------------------
function ResultsGridClient({ exercises, lang }: { exercises: SearchExercise[]; lang: Lang }) {
  const total = exercises.length
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center rounded-lg border border-border bg-surface-2">
        <h3 className="font-serif text-xl font-semibold text-text">{t(lang, 'exercise.empty')}</h3>
        <p className="text-muted max-w-xs">{t(lang, 'catalog.empty.hint')}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">{t(lang, 'common.results.other', { count: total })}</span>
      </div>
      <ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label={t(lang, 'common.results.other', { count: total })}
      >
        {exercises.map((e) => (
          <li key={e.id}>
            <ExerciseCardClient exercise={e} lang={lang} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- Panneau de filtres interactif (pilote le store) -----------------------
function FilterPanelClient({ lang, state }: { lang: Lang; state: ExerciseFilterState }) {
  const set = (next: ExerciseFilterState) => exerciseFilterStore.set(next)

  const clearAll = () =>
    exerciseFilterStore.set({
      q: '',
      subject: [],
      domain: [],
      level: null,
      difficulty: [],
      kind: [],
      sort: 'alpha',
    })

  const chips = [
    state.q && { label: state.q, onRemove: () => set({ ...state, q: '' }) },
    ...state.subject.map((s: string) => ({
      label: t(lang, `subject.${s}` as TranslationKey),
      onRemove: () => set({ ...state, subject: state.subject.filter((v: string) => v !== s) }),
    })),
    ...state.domain.map((d: string) => ({
      label: t(lang, `domain.${d}` as TranslationKey),
      onRemove: () => set({ ...state, domain: state.domain.filter((v: string) => v !== d) }),
    })),
    state.level && {
      label:
        state.level.min === state.level.max
          ? t(lang, 'level.label', { level: state.level.min })
          : t(lang, 'filter.levelRange', { min: state.level.min, max: state.level.max }),
      onRemove: () => set({ ...state, level: null }),
    },
    ...state.difficulty.map((d: number) => ({
      label: t(lang, `difficulty.${d}` as TranslationKey),
      onRemove: () => set({ ...state, difficulty: state.difficulty.filter((v: number) => v !== d) }),
    })),
    ...state.kind.map((k: string) => ({
      label: t(lang, `exercise.kind.${k}` as TranslationKey),
      onRemove: () => set({ ...state, kind: state.kind.filter((v: string) => v !== k) }),
    })),
  ].filter(Boolean) as { label: string; onRemove: () => void }[]

  const isLevelSelected = (level: number): boolean =>
    Boolean(state.level && level >= state.level.min && level <= state.level.max)

  const setLevelMin = (value: string) => {
    const n = Number(value)
    if (!n) return set({ ...state, level: null })
    set({ ...state, level: { min: n, max: state.level ? Math.max(n, state.level.max) : n } })
  }

  const setLevelMax = (value: string) => {
    const n = Number(value)
    if (!n) return set({ ...state, level: null })
    set({ ...state, level: state.level ? { min: state.level.min, max: n } : { min: n, max: n } })
  }

  const kinds: { value: ExerciseKind; label: string }[] = [
    { value: 'qcm', label: t(lang, 'exercise.kind.qcm') },
    { value: 'numeric', label: t(lang, 'exercise.kind.numeric') },
    { value: 'open', label: t(lang, 'exercise.kind.open') },
  ]

  return (
    <section className="space-y-6">
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary-soft text-primary px-3 py-1 text-xs font-medium"
              aria-label={t(lang, 'filter.remove', { label: chip.label })}
            >
              {chip.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface text-text px-3 py-1 text-xs font-medium hover:bg-surface-2"
          >
            {t(lang, 'common.clearAll')}
          </button>
        </div>
      )}

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-2">
          <span className="font-medium text-text">{t(lang, 'filter.subject')}</span>
          <span className="text-xs text-muted ml-2">{state.subject.length}</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {SUBJECTS.map((subject: string) => {
            const active = state.subject.includes(subject)
            return (
              <button
                key={subject}
                onClick={() => set({ ...state, subject: toggle(state.subject, subject) })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text hover:bg-surface-2'}`}
              >
                {t(lang, `subject.${subject}` as TranslationKey)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-2">
          <span className="font-medium text-text">{t(lang, 'filter.domain')}</span>
          <span className="text-xs text-muted ml-2">{state.domain.length}</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {ALL_DOMAINS.map((domain: string) => {
            const active = state.domain.includes(domain)
            return (
              <button
                key={domain}
                onClick={() => set({ ...state, domain: toggle(state.domain, domain) })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text hover:bg-surface-2'}`}
              >
                {t(lang, `domain.${domain}` as TranslationKey)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-2 flex items-center justify-between">
          <span className="font-medium text-text">{t(lang, 'filter.level')}</span>
          <span className="text-xs text-muted">{state.level ? state.level.max - state.level.min + 1 : 0}</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2 items-end">
          <input
            type="number"
            min="1"
            max="7"
            placeholder="min"
            value={state.level?.min ?? ''}
            onChange={(e) => setLevelMin(e.target.value)}
            className="w-12 px-2 py-1 rounded-md border border-border-strong bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min="1"
            max="7"
            placeholder="max"
            value={state.level?.max ?? ''}
            onChange={(e) => setLevelMax(e.target.value)}
            className="w-12 px-2 py-1 rounded-md border border-border-strong bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.level && (
            <button
              onClick={() => set({ ...state, level: null })}
              className="text-xs text-muted underline underline-offset-4 hover:text-primary"
            >
              {t(lang, 'common.reset')}
            </button>
          )}
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {LEVELS.map((level: number) => {
            const active = isLevelSelected(level)
            return (
              <button
                key={level}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text hover:bg-surface-2'}`}
              >
                {level}
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-2">
          <span className="font-medium text-text">{t(lang, 'filter.difficulty')}</span>
          <span className="text-xs text-muted ml-2">{state.difficulty.length}</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {DIFFICULTIES.map((difficulty: number) => {
            const active = state.difficulty.includes(difficulty)
            return (
              <button
                key={difficulty}
                onClick={() => set({ ...state, difficulty: toggleNum(state.difficulty, difficulty) })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text hover:bg-surface-2'}`}
              >
                {t(lang, `difficulty.${difficulty}` as TranslationKey)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-2">
          <span className="font-medium text-text">{t(lang, 'exercise.filter.kind')}</span>
          <span className="text-xs text-muted ml-2">{state.kind.length}</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {kinds.map((kind) => {
            const active = state.kind.includes(kind.value)
            return (
              <button
                key={kind.value}
                onClick={() => set({ ...state, kind: toggle(state.kind, kind.value) })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text hover:bg-surface-2'}`}
                aria-pressed={active}
              >
                {kind.label}
              </button>
            )
          })}
        </div>
      </section>
    </section>
  )
}

// --- Tiroir de filtres mobile ----------------------------------------------
function MobileFilterDrawer({
  lang,
  state,
  open,
  onClose,
}: {
  lang: Lang
  state: ExerciseFilterState
  open: boolean
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
        <h2 id="drawer-title" className="font-serif text-lg font-semibold text-text">
          {t(lang, 'catalog.filters')}
        </h2>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-text hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label={t(lang, 'common.close')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <FilterPanelClient lang={lang} state={state} />
      </div>
    </div>
  )
}

// --- Île principale ---------------------------------------------------------
export default function ExerciseCatalogApp({ lang }: { lang: Lang }) {
  const [index, setIndex] = useState<SearchExercise[]>([])
  const [loading, setLoading] = useState(true)
  const state = useStore(exerciseFilterStore)
  const [mobileOpen, setMobileOpen] = useState(false)
  const focusTarget = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const unbind = bindExerciseFilterStoreToUrl(exerciseFilterStore)
    const shell = document.getElementById('exercise-catalog-shell')
    if (shell) shell.style.display = 'none'
    return () => {
      unbind()
      if (shell) shell.style.display = ''
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mobileOpen && e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
        focusTarget.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    fetch(INDEX_URL(lang))
      .then((r) => {
        if (!r.ok) throw new Error('index introuvable')
        return r.json()
      })
      .then((data: SearchExercise[]) => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [lang])

  const searchIndex = useMemo(() => createExerciseSearchIndex(index), [index])
  const passIds = useMemo(
    () => new Set(filterExercises(index, state).map((e: SearchExercise) => e.id)),
    [index, state],
  )

  let results: SearchExercise[]
  if (state.q) {
    results = searchExercises(searchIndex, state.q).filter((e: SearchExercise) => passIds.has(e.id))
  } else {
    results = filterExercises(index, state)
  }
  results = sortExercises(results, state.sort)

  const set = (next: ExerciseFilterState) => exerciseFilterStore.set(next)

  if (loading) {
    return <p className="text-muted text-center py-4">{t(lang, 'common.loading')}</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 relative">
        <button
          ref={focusTarget}
          className="md:hidden p-3 text-text hover:bg-surface-2 rounded-lg w-full text-left font-medium border border-border"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="exercise-filters-drawer"
        >
          {t(lang, 'catalog.filters')}
          <svg className="ml-2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <MobileFilterDrawer lang={lang} state={state} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </aside>
      <div className="lg:col-span-9 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-border pb-4">
          <div className="flex-1">
            <label className="sr-only">{t(lang, 'exercise.search.placeholder')}</label>
            <input
              value={state.q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ ...state, q: e.target.value })}
              placeholder={t(lang, 'exercise.search.placeholder')}
              className="w-full px-4 py-2 rounded-md border border-border-strong bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={state.sort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set({ ...state, sort: e.target.value as Sort })}
            className="px-3 py-2 rounded-md border border-border-strong bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="alpha">{t(lang, 'catalog.sort.alpha')}</option>
            <option value="levelAsc">{t(lang, 'catalog.sort.levelAsc')}</option>
            <option value="levelDesc">{t(lang, 'catalog.sort.levelDesc')}</option>
            <option value="difficulty">{t(lang, 'catalog.sort.difficulty')}</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-sm text-muted">{t(lang, 'common.results.other', { count: results.length })}</span>
        </div>
        <ResultsGridClient exercises={results} lang={lang} />
      </div>
    </div>
  )
}