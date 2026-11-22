import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@nanostores/react'
import { t, type Lang } from '@/i18n/index'
import { localizedPath } from '@/i18n/config'
import { bindFilterStoreToUrl, filterStore } from '@/lib/filter-store'
import { filterFormulas, type SearchFormula } from '@/lib/filters'
import { addDeck } from '@/lib/progress'
import { cardKey, type Deck, type Direction } from '@/lib/srs'

const INDEX_URL = (lang: Lang) => `/search/${lang}/index.json`
const DIRECTIONS: Direction[] = ['nameToFormula', 'formulaToName', 'variablesToFormula']

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-primary text-on-primary px-4 py-2 text-base font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

export default function DeckBuilder({ lang }: { lang: Lang }) {
  const [index, setIndex] = useState<SearchFormula[]>([])
  const [loading, setLoading] = useState(true)
  const [created, setCreated] = useState<string | null>(null)
  const state = useStore(filterStore)

  useEffect(() => {
    const unbind = bindFilterStoreToUrl(filterStore)
    return () => unbind()
  }, [])

  useEffect(() => {
    fetch(INDEX_URL(lang))
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchFormula[]) => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [lang])

  const filtered = useMemo(
    () => filterFormulas(index, state),
    [index, state],
  )

  function createDeck() {
    if (filtered.length === 0) return
    const id = `deck_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const deck: Deck = {
      id,
      name: `Paquet ${filtered.length} formules`,
      createdAt: new Date().toISOString(),
      formulaIds: filtered.map((f) => f.id),
      directions: DIRECTIONS,
    }
    addDeck(deck)
    setCreated(id)
  }

  if (loading) return <p className="text-muted text-center py-4">{t(lang, 'common.loading')}</p>

  // Après création : redirection vers la session de ce paquet.
  if (created) {
    // Petit délai pour laisser le store se persistre avant navigation.
    setTimeout(() => {
      window.location.href = `${localizedPath(lang, 'reviewFlashcards')}?deck=${created}`
    }, 100)
    return null
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-4">
        {t(lang, 'catalog.empty.hint')}
      </p>
    )
  }

  return (
    <div className="mt-6 flex items-center gap-2">
      <span className="text-sm text-muted">{t(lang, 'review.cardCount', { count: filtered.length })}</span>
      <button
        type="button"
        onClick={createDeck}
        className={btnPrimary}
      >
        {t(lang, 'review.createDeck')}
      </button>
    </div>
  )
}