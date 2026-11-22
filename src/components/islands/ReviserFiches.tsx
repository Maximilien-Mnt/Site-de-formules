import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { t, type Lang } from '@/i18n/index'
import { Rating, type Grade } from 'ts-fsrs'
import { progressStore, setFlashcard } from '@/lib/progress'
import { dueForDeck, newCard, review, type Deck, type Direction } from '@/lib/srs'

export interface FlashcardFormula {
  id: string
  title: string
  latexHtml: string
  variableLabels: string[]
}

interface Props {
  lang: Lang
  formulas: FlashcardFormula[]
  deckId?: string
  hubUrl: string
  catalogUrl: string
}

type Cluster = 'again' | 'hard' | 'good' | 'easy'

const btns: { rating: Grade; cluster: Cluster; cls: string }[] = [
  { rating: Rating.Again, cluster: 'again', cls: 'bg-danger' },
  { rating: Rating.Hard, cluster: 'hard', cls: 'bg-warning' },
  { rating: Rating.Good, cluster: 'good', cls: 'bg-success' },
  { rating: Rating.Easy, cluster: 'easy', cls: 'bg-primary' },
]

const clusterOf = (r: Grade): Cluster =>
  r === Rating.Again ? 'again' : r === Rating.Hard ? 'hard' : r === Rating.Good ? 'good' : 'easy'

const frontOf = (d: Direction, f: FlashcardFormula): { html?: string; text?: string } =>
  d === 'nameToFormula'
    ? { text: f.title }
    : d === 'formulaToName'
      ? { html: f.latexHtml }
      : { text: f.variableLabels.join(' · ') }

const backOf = (d: Direction, f: FlashcardFormula): { html?: string; text?: string } =>
  d === 'nameToFormula' ? { html: f.latexHtml } : d === 'formulaToName' ? { text: f.title } : { html: f.latexHtml }

export default function ReviserFiches({ lang, formulas, deckId, hubUrl, catalogUrl }: Props) {
  const progress = useStore(progressStore)
  const [deckKey] = useState<string | null>(deckId ?? null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const counts = useRef<Record<Cluster, number>>({ again: 0, hard: 0, good: 0, easy: 0 })
  const cardRef = useRef<HTMLDivElement | null>(null)

  const formulaById = useMemo(() => new Map(formulas.map((f) => [f.id, f])), [formulas])

  // Paquet actif depuis le store (l'id peut être fourni en prop ou via l'URL).
  const deck: Deck | undefined = deckKey ? progress.decks[deckKey] : undefined

  // Queue des cartes dues, stabilisée une fois (pas de rabat pendant la session).
  const queue = useMemo(
    () => (deck ? dueForDeck(deck, progress.flashcards, new Date()) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck],
  )

  const item = queue[index]
  const formula = item ? formulaById.get(item.formulaId) : undefined

  function rate(rating: Grade) {
    if (!item) return
    const now = new Date()
    const base = progress.flashcards[item.key] ?? newCard(now)
    setFlashcard(item.key, review(base, rating, now))
    counts.current[clusterOf(rating)] += 1
    if (index + 1 < queue.length) {
      setIndex(index + 1)
      setFlipped(false)
      cardRef.current?.focus()
    } else {
      setDone(true)
    }
  }

  function flip() {
    if (item) setFlipped((v) => !v)
  }

  // Raccourcis clavier : Espace/Entrée retournent, 1-4 notent, Échap quitte.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return
      if (e.key === ' ') {
        e.preventDefault()
        flip()
      } else if (e.key === 'Enter' && !flipped) {
        e.preventDefault()
        flip()
      } else if (!flipped && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        rate(btns[Number(e.key) - 1].rating)
      } else if (e.key === 'Escape') {
        window.location.href = hubUrl
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-start gap-6">
        <h2 className="font-serif text-2xl font-semibold text-text">{t(lang, 'review.sessionComplete')}</h2>
        <p className="text-muted">{t(lang, 'review.summary.reviewed', { count: queue.length })}</p>
        <ul className="w-full space-y-2">
          {(['again', 'hard', 'good', 'easy'] as const).map((k) => (
            <li key={k} className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted">{t(lang, `review.summary.${k}` as never)}</span>
              <span className="font-mono text-text">{counts.current[k]}</span>
            </li>
          ))}
        </ul>
        <a
          href={hubUrl}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover"
        >
          {t(lang, 'review.dueToday')}
        </a>
      </div>
    )
  }

  if (!deck || !item || !formula) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-start gap-4">
        <h2 className="font-serif text-2xl font-semibold text-text">{t(lang, 'review.nothingDue')}</h2>
        <a
          href={catalogUrl}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover"
        >
          {t(lang, 'review.createDeck')}
        </a>
      </div>
    )
  }

  const front = frontOf(item.direction, formula)
  const back = backOf(item.direction, formula)

  return (
    <div className="flex flex-col items-stretch gap-6">
      {/* Barre de progression */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)]"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs text-muted" aria-live="polite">
          {t(lang, 'review.progress', { done: index, total: queue.length })}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">{t(lang, `review.direction.${item.direction}` as never)}</span>
        <a href={hubUrl} className="text-sm text-muted underline underline-offset-2 hover:text-text">
          {t(lang, 'review.closeSession')}
        </a>
      </div>

      {/* Carte : recto → verso (retournement 3D, 320 ms) */}
      <button
        type="button"
        onClick={flip}
        aria-expanded={flipped}
        className="mx-auto flex min-h-[16rem] w-full max-w-2xl cursor-pointer items-center justify-center rounded-xl border border-border bg-surface p-10 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <div
          ref={cardRef}
          tabIndex={-1}
          className="relative w-full h-[14rem] outline-none preserve-3d transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)]"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Face recto */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center rounded-xl border border-border bg-surface"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
              {t(lang, 'review.front')}
            </div>
            {front.html ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: front.html }} />
            ) : (
              <div className="font-serif text-2xl font-semibold text-text">{front.text}</div>
            )}
          </div>
          {/* Face verso */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center rounded-xl border border-border bg-surface"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
              {t(lang, 'review.back')}
            </div>
            {back.html ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: back.html }} />
            ) : (
              <div className="font-serif text-2xl font-semibold text-text">{back.text}</div>
            )}
          </div>
        </div>
      </button>

      <p className="text-center text-sm text-muted">{t(lang, 'review.flipHint')}</p>

      {/* Notation (désactivée tant que la carte n'est pas retournée) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label={t(lang, 'review.rate.again') + '/' + t(lang, 'review.rate.easy')}>
        {btns.map((b, i) => (
          <button
            key={b.cluster}
            type="button"
            onClick={() => rate(b.rating)}
            disabled={!flipped}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-50 ${b.cls}`}
          >
            <span className="font-mono text-xs opacity-70">{i + 1}</span>
            {t(lang, `review.rate.${b.cluster}` as never)}
          </button>
        ))}
      </div>
    </div>
  )
}