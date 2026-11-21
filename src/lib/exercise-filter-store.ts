import { atom, type WritableAtom } from 'nanostores'
import type { ExerciseFilterState } from './exercise-filters'
import { parseExerciseFilters, serializeExerciseFilters } from './exercise-filters'

export const defaultExerciseFilterState: ExerciseFilterState = {
  q: '',
  subject: [],
  domain: [],
  level: null,
  difficulty: [],
  kind: [],
  sort: 'alpha',
}

function initialState(): ExerciseFilterState {
  if (typeof location === 'undefined') return defaultExerciseFilterState
  try {
    return parseExerciseFilters(new URLSearchParams(location.search))
  } catch {
    return defaultExerciseFilterState
  }
}

export const exerciseFilterStore: WritableAtom<ExerciseFilterState> = atom(initialState())

let urlSyncEnabled = true

export function bindExerciseFilterStoreToUrl(store: WritableAtom<ExerciseFilterState>): () => void {
  const unsub = store.subscribe((state: ExerciseFilterState) => {
    if (!urlSyncEnabled || typeof location === 'undefined') return
    const serialized = serializeExerciseFilters(state)
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
      store.set(parseExerciseFilters(new URLSearchParams(location.search)))
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