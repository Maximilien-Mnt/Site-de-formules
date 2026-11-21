import { atom, type WritableAtom } from 'nanostores'
import type { FilterState } from './filters'
import { parseFilters, serializeFilters } from './filters'

export const defaultFilterState: FilterState = {
  q: '',
  subject: [],
  domain: [],
  level: null,
  difficulty: [],
  hasGraph: false,
  hasProof: false,
  hasHistory: false,
  hasExercises: false,
  progress: false,
  sort: 'alpha',
}

function initialState(): FilterState {
  if (typeof location === 'undefined') return defaultFilterState
  try {
    return parseFilters(new URLSearchParams(location.search))
  } catch {
    return defaultFilterState
  }
}

export const filterStore: WritableAtom<FilterState> = atom(initialState())

let urlSyncEnabled = true

export function bindFilterStoreToUrl(store: WritableAtom<FilterState>): () => void {
  const unsub = store.subscribe((state: FilterState) => {
    if (!urlSyncEnabled || typeof location === 'undefined') return
    const serialized = serializeFilters(state)
    const url = new URL(location.href)
    url.search = serialized
    try {
      window.history.replaceState(null, '', url.toString())
    } catch {
      // historique indisponible : l'état reste en mémoire
    }
  })

  const onPop = () => {
    urlSyncEnabled = false
    try {
      store.set(parseFilters(new URLSearchParams(location.search)))
    } catch {
      // restauration impossible : l'état actuel est conservé
    }
    urlSyncEnabled = true
  }

  if (typeof window !== 'undefined') window.addEventListener('popstate', onPop)

  return () => {
    unsub()
    if (typeof window !== 'undefined') window.removeEventListener('popstate', onPop)
  }
}