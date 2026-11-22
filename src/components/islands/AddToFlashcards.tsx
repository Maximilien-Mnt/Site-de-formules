import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { t, type Lang } from '@/i18n/index'
import { addDeck, progressStore } from '@/lib/progress'
import { DEFAULT_DECK_ID, DIRECTIONS } from '@/lib/srs'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

const checkIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)

interface Props {
  lang: Lang
  formulaId: string
}

/**
 * Bouton « Ajouter aux fiches » sur la page de détail d'une formule.
 *
 * Crée (première utilisation) le paquet par défaut « Mes fiches » ou y ajoute
 * la formule courante, en conservant tous les sens de révision (cohérence avec
 * le paquet généré depuis le catalogue). Retour visuel temporaire « Ajouté ».
 * Aucune dépendance nouvelle ; le moteur FSRS et le store nanostores sont
 * réutilisés tels quels.
 */
export default function AddToFlashcards({ lang, formulaId }: Props) {
  const progress = useStore(progressStore)
  const [added, setAdded] = useState(false)

  const deck = progress.decks[DEFAULT_DECK_ID]
  const inDeck = Boolean(deck && deck.formulaIds.includes(formulaId))

  function add() {
    if (!deck) {
      addDeck({
        id: DEFAULT_DECK_ID,
        name: t(lang, 'review.defaultDeck'),
        createdAt: new Date().toISOString(),
        formulaIds: [formulaId],
        directions: [...DIRECTIONS],
      })
    } else if (!deck.formulaIds.includes(formulaId)) {
      addDeck({
        ...deck,
        formulaIds: [...deck.formulaIds, formulaId],
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (inDeck) {
    return (
      <button
        type="button"
        aria-pressed="true"
        disabled
        className={`${base} border border-success bg-success-soft text-success`}
      >
        {checkIcon}
        {t(lang, 'review.inDeck')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={add}
      className={`${base} bg-primary text-on-primary hover:bg-primary-hover ${added ? 'opacity-70' : ''}`}
    >
      {added ? t(lang, 'common.added') : t(lang, 'formula.addToDeck')}
    </button>
  )
}
