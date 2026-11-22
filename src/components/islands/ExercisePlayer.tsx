import { useState } from 'react'
import { t, type Lang } from '@/i18n/index'
import { checkQcm, checkNumeric } from '@/lib/exercise-check'
import { recordAttempt } from '@/lib/progress'

interface QcmChoice {
  id: string
  html: string
}

export interface ExercisePlayerProps {
  lang: Lang
  exerciseId: string
  kind: 'numeric' | 'qcm' | 'open'
  answer?: { value: number; tolerance: number; unit?: string }
  choices?: QcmChoice[]
  correct?: string[]
  isMultiple: boolean
  hintsHtml: string[]
  solutionHtml: string
  next?: { url: string; title: string }
}

/** Affichage d'un nombre en français (virgule décimale). */
function formatFr(n: number): string {
  return String(n).replace('.', ',')
}

const btnPrimary =
  'inline-flex items-center gap-2 rounded-md bg-primary text-on-primary px-4 py-2 text-base font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

const btnSecondary =
  'inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2 text-base font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

export default function ExercisePlayer(props: ExercisePlayerProps) {
  const { lang, kind } = props
  const [qcmSelected, setQcmSelected] = useState<string[]>([])
  const [numericInput, setNumericInput] = useState('')
  // attempt : état du dernier retour ; « locked » : réponse correcte (objectif atteint).
  const [attempt, setAttempt] = useState<'correct' | 'wrong' | 'invalid' | null>(null)
  const [locked, setLocked] = useState(false)
  const [wrongParsed, setWrongParsed] = useState<number | undefined>(undefined)
  const [selfAssessed, setSelfAssessed] = useState<'yes' | 'no' | null>(null)
  const [revealed, setRevealed] = useState(0)
  const [solutionOpen, setSolutionOpen] = useState(false)

  const answered = locked || selfAssessed !== null

  function onChoiceToggle(id: string, value: boolean) {
    if (locked) return
    if (!props.isMultiple) {
      setQcmSelected(value ? [id] : [])
    } else {
      setQcmSelected(value ? [...qcmSelected, id] : qcmSelected.filter((v) => v !== id))
    }
  }

  function verify() {
    if (kind === 'qcm') {
      const ok = checkQcm(qcmSelected, props.correct ?? [])
      setAttempt(ok ? 'correct' : 'wrong')
      setLocked(ok)
      recordAttempt({ exerciseId: props.exerciseId, result: ok ? 'correct' : 'wrong' })
      return
    }
    const result = checkNumeric(numericInput, props.answer ?? { value: 0, tolerance: 0 })
    if (result.ok) {
      setAttempt('correct')
      setLocked(true)
      recordAttempt({ exerciseId: props.exerciseId, result: 'correct' })
    } else if (result.reason === 'invalid') {
      setAttempt('invalid')
      setLocked(false)
    } else {
      setAttempt('wrong')
      setLocked(false)
      recordAttempt({ exerciseId: props.exerciseId, result: 'wrong' })
      setWrongParsed(result.parsed)
    }
  }

  function assess(outcome: 'yes' | 'no') {
    setSelfAssessed(outcome)
    setAttempt(outcome === 'yes' ? 'correct' : 'wrong')
    setLocked(true)
    recordAttempt({ exerciseId: props.exerciseId, result: outcome === 'yes' ? 'correct' : 'wrong' })
  }

  // --- Zone de réponse ---

  let answerArea: React.ReactNode = null

  if (kind === 'qcm' && props.choices) {
    const single = !props.isMultiple
    answerArea = (
      <fieldset className="space-y-3">
        <p className="text-sm text-muted">
          {single ? t(lang, 'exercise.qcm.single') : t(lang, 'exercise.qcm.multiple')}
        </p>
        {props.choices.map((choice) => {
          const selected = qcmSelected.includes(choice.id)
          const isCorrect = props.correct?.includes(choice.id) ?? false
          let stateCls = 'border border-border-strong bg-surface hover:bg-surface-2'
          if (attempt === 'wrong' && selected) stateCls = 'border-danger bg-danger-soft'
          if (locked) {
            if (isCorrect) stateCls = 'border-success bg-success-soft'
            else if (selected) stateCls = 'border-danger bg-danger-soft'
            else stateCls = 'border border-border bg-surface'
          }
          return (
            <label
              key={choice.id}
              className={`flex items-center gap-3 rounded-md p-3 transition-colors duration-[var(--dur-fast)] ${stateCls}`}
            >
              <input
                type={single ? 'radio' : 'checkbox'}
                value={choice.id}
                checked={selected}
                disabled={locked}
                onChange={(e) => onChoiceToggle(choice.id, e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span
                className="min-w-0 text-base text-text"
                dangerouslySetInnerHTML={{ __html: choice.html }}
              />
            </label>
          )
        })}
      </fieldset>
    )
  } else if (kind === 'numeric') {
    answerArea = (
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="exercise-numeric-input" className="text-sm font-medium text-text">
          {t(lang, 'exercise.numeric.label')}
        </label>
        <input
          id="exercise-numeric-input"
          type="text"
          autoComplete="off"
          value={numericInput}
          onChange={(e) => setNumericInput(e.target.value)}
          placeholder={t(lang, 'exercise.numeric.placeholder')}
          className="w-40 px-4 py-2 rounded-md border border-border-strong bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {props.answer?.unit && (
          <span className="text-sm font-medium text-muted">{props.answer.unit}</span>
        )}
        {props.answer && props.answer.tolerance > 0 && (
          <span className="text-xs text-muted">
            {t(lang, 'exercise.numeric.tolerance', { tolerance: formatFr(props.answer.tolerance) })}
          </span>
        )}
      </div>
    )
  } else if (kind === 'open') {
    answerArea = (
      <div className="space-y-3">
        <p className="text-sm text-muted">{t(lang, 'exercise.selfAssess')}</p>
        <div className="flex gap-2">
          <button type="button" className={btnPrimary} onClick={() => assess('yes')}>
            {t(lang, 'exercise.selfAssess.yes')}
          </button>
          <button type="button" className={btnSecondary} onClick={() => assess('no')}>
            {t(lang, 'exercise.selfAssess.no')}
          </button>
        </div>
      </div>
    )
  }

  return (
<div className="mt-8 space-y-6">
      {answerArea}

      {kind !== 'open' && !locked && (
        <button type="button" className={btnPrimary} onClick={verify}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {t(lang, 'exercise.check')}
        </button>
      )}

      {/* Retour visuel ET textuel : encadré + icône + texte. */}
      {attempt === 'invalid' ? (
        <div className="flex items-start gap-3 rounded-md border border-warning bg-warning-soft p-4" role="status">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l9 17H3L12 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v3M12 16.5h.01" />
          </svg>
          <p className="text-sm text-text">{t(lang, 'exercise.numeric.invalid')}</p>
        </div>
      ) : attempt ? (
        <div
          className={`flex items-start gap-3 rounded-md border p-4 ${attempt === 'correct' ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft'}`}
          role="status"
        >
          {attempt === 'correct' ? (
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 12.5l2 2 4-4.5" />
            </svg>
          ) : (
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
            </svg>
          )}
          <div>
            <p className="text-sm font-medium text-text">
              {attempt === 'correct' ? t(lang, 'exercise.correct') : t(lang, 'exercise.incorrect')}
            </p>
            {wrongParsed !== undefined && (
              <p className="text-sm text-muted">
                {t(lang, 'exercise.yourAnswer')} : <span className="font-mono">{formatFr(wrongParsed)}</span>
                {props.answer?.unit ? ` ${props.answer.unit}` : ''}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Indices progressifs : révélés un par un. */}
      {props.hintsHtml.length > 0 && (
        <div className="space-y-3">
          {revealed < props.hintsHtml.length && (
            <button type="button" className={btnSecondary} onClick={() => setRevealed(revealed + 1)}>
              <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3a6 6 0 016 6c0 3-2.5 5-4 6h-4c-1.5-1-4-2.5-4-6a6 6 0 016-6zM10 19h4M10 21h4" />
              </svg>
              {t(lang, 'exercise.showHint')}
            </button>
          )}
          {props.hintsHtml.slice(0, revealed).map((html, i) => (
            <div key={i} className="rounded-md border border-border bg-surface-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t(lang, 'exercise.hint')} {i + 1}
              </p>
              <div className="text-sm text-text" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))}
        </div>
      )}

      {/* Solution repliée. */}
      {props.solutionHtml && (
        <div className="space-y-3">
          <button type="button" className={btnSecondary} onClick={() => setSolutionOpen(!solutionOpen)}>
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {t(lang, 'exercise.showSolution')}
          </button>
          {solutionOpen && (
            <div className="rounded-md border border-border bg-surface p-4" dangerouslySetInnerHTML={{ __html: props.solutionHtml }} />
          )}
        </div>
      )}

      {/* Exercice suivant : même domaine / même niveau, calculé au build. */}
      {answered && props.next && (
        <div className="pt-2">
          <a href={props.next.url} className={btnPrimary}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {t(lang, 'exercise.next')}
          </a>
        </div>
      )}
    </div>
  )
}