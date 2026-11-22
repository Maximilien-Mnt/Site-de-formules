import { useMemo } from 'react'
import { useStore } from '@nanostores/react'
import { t, type Lang } from '@/i18n/index'
import { progressStore, removeDeck } from '@/lib/progress'
import { deckSize, dueForDeck, type Deck } from '@/lib/srs'

interface Props {
  lang: Lang
  sessionUrl: string
  catalogUrl: string
}

export default function ReviewHubApp({ lang, sessionUrl, catalogUrl }: Props) {
  const progress = useStore(progressStore)

  const decks = useMemo(() => Object.values(progress.decks), [progress.decks])
  const now = useMemo(() => new Date(), [])

  if (decks.length === 0) {
    return (
      <div className="flex max-w-md flex-col items-start gap-4">
        <h2 className="font-serif text-xl font-semibold text-text">{t(lang, 'review.noDecks')}</h2>
        <a
          href={catalogUrl}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover"
        >
          {t(lang, 'review.createDeck')}
        </a>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {decks.map((deck: Deck) => {
        const total = deckSize(deck)
        const due = dueForDeck(deck, progress.flashcards, now).length
        return (
          <li key={deck.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-text">{deck.name}</h3>
              <button
                type="button"
                onClick={() => removeDeck(deck.id)}
                aria-label={t(lang, 'review.removeDeck')}
                className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 6l-1 14H6L5 6m5 0V4h4v2m-6 0h8" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-muted">
              {t(lang, 'review.cardCount', { count: total })} · {t(lang, 'review.dueCards', { count: due })}
            </p>
            <a
              href={`${sessionUrl}?deck=${deck.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover"
            >
              {t(lang, 'review.startSession')}
            </a>
          </li>
        )
      })}
    </ul>
  )
}