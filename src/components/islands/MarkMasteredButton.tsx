import { useStore } from '@nanostores/react'
import { t } from '@/i18n/index'
import type { Lang } from '@/i18n/config'
import { progressStore, setFormulaStatus } from '@/lib/progress'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

const checkIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)

/**
 * Bouton « Marquer comme maîtrisée » — réactif au store de progression.
 * Bascule entre « mastered » et « learning » (pour pouvoir retirer le statut).
 */
export default function MarkMasteredButton({ lang, formulaId }: { lang: Lang; formulaId: string }) {
  const progress = useStore(progressStore)
  const mastered = (progress.formulas[formulaId] ?? 'new') === 'mastered'

  if (mastered) {
    return (
      <button
        type="button"
        aria-pressed
        className={`${base} border border-success bg-success-soft text-success`}
        onClick={() => setFormulaStatus(formulaId, 'learning')}
      >
        {checkIcon}
        {t(lang, 'progress.formula.unmarkMastered')}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={false}
      className={`${base} bg-primary text-on-primary hover:bg-primary-hover`}
      onClick={() => setFormulaStatus(formulaId, 'mastered')}
    >
      {checkIcon}
      {t(lang, 'formula.markMastered')}
    </button>
  )
}
