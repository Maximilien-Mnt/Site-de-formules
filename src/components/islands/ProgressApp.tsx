import { useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { t, type TranslationKey } from '@/i18n/index'
import type { Lang } from '@/i18n/config'
import { ALL_DOMAINS, LEVELS } from '@/data/taxonomy'
import {
  dayKey,
  exportProgress,
  getStreak,
  importProgress,
  progressStore,
  resetProgress,
  type ImportMode,
} from '@/lib/progress'

export interface ProgressFormula {
  id: string
  domain: string
  level: number
}

const panel = 'rounded-lg border border-border bg-surface p-4'
const panelTitle = 'text-sm font-semibold uppercase tracking-wide text-subtle'
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-primary text-on-primary px-4 py-2 text-base font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'
const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2 text-base font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

export default function ProgressApp({ lang, formulas }: { lang: Lang; formulas: ProgressFormula[] }) {
  const progress = useStore(progressStore)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const pendingMode = useRef<ImportMode>('merge')

  const total = formulas.length
  const mastered = formulas.filter((f) => (progress.formulas[f.id] ?? 'new') === 'mastered').length
  const learning = formulas.filter((f) => (progress.formulas[f.id] ?? 'new') === 'learning').length
  const pct = total ? Math.round((mastered / total) * 100) : 0
  const streak = getStreak(progress.activityDays)
  const attemptCount = progress.attempts.length
  const activitySet = useMemo(() => new Set(progress.activityDays), [progress.activityDays])

  function triggerImport(mode: ImportMode) {
    pendingMode.current = mode
    fileInput.current?.click()
  }

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const outcome = await importProgress(file, pendingMode.current)
    setImportStatus(outcome.ok ? 'success' : 'error')
  }

  // --- Barres par niveau et par domaine ----------------------------------
  const levelBars = LEVELS.map((level) => {
    const atLevel = formulas.filter((f) => f.level === level)
    const done = atLevel.filter((f) => (progress.formulas[f.id] ?? 'new') === 'mastered').length
    return { level, total: atLevel.length, done }
  }).filter((b) => b.total > 0)
  const domainBars = ALL_DOMAINS.map((domain) => {
    const atDomain = formulas.filter((f) => f.domain === domain)
    const done = atDomain.filter((f) => (progress.formulas[f.id] ?? 'new') === 'mastered').length
    return { domain, total: atDomain.length, done }
  }).filter((b) => b.total > 0)

  function Bars({ items }: { items: { label: string; done: number; total: number }[] }) {
    return (
      <ul className="space-y-2">
        {items.map((item) => {
          const pct2 = item.total ? Math.round((item.done / item.total) * 100) : 0
          return (
            <li key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text">{item.label}</span>
                <span className="text-xs text-muted">
                  {item.done} / {item.total}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={item.total}
                aria-valuenow={item.done}
                aria-label={item.label}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)]"
                  style={{ width: `${pct2}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  // --- Calendrier d'activite (12 semaines) ------------------------------
  const weeks: { key: string; active: boolean }[][] = []
  {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 83)
    let column: { key: string; active: boolean }[] = []
    for (let i = 0; i < 84; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const key = dayKey(d)
      column.push({ key, active: activitySet.has(key) })
      if (column.length === 7) {
        weeks.push(column)
        column = []
      }
    }
  }

  const weekMonths = weeks.map((week) => {
    const [y, m, d] = week[0].key.split('-').map(Number)
    return new Intl.DateTimeFormat(lang, { month: 'short' }).format(new Date(y, m - 1, d))
  })

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble : anneau + scores */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${panel} flex flex-col items-center gap-3`}>
          <h2 className={panelTitle}>{t(lang, 'progress.global')}</h2>
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t(lang, 'progress.global')}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-3xl font-semibold text-text">{pct}%</span>
            </div>
          </div>
          <p className="text-sm text-muted">{t(lang, 'progress.masteredOf', { mastered, total })}</p>
        </div>

        <div className={`${panel} flex flex-col gap-4`}>
          <h2 className={panelTitle}>{t(lang, 'progress.stats')}</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">{t(lang, 'progress.streak')}</dt>
              <dd className="font-serif text-2xl font-semibold text-text">{streak}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">{t(lang, 'progress.formulas')}</dt>
              <dd className="font-serif text-2xl font-semibold text-text">
                {mastered}
                <span className="text-base font-normal text-muted"> / {total}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">{t(lang, 'progress.learning')}</dt>
              <dd className="font-serif text-2xl font-semibold text-text">{learning}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">{t(lang, 'progress.exercises')}</dt>
              <dd className="font-serif text-2xl font-semibold text-text">{attemptCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Barres */}
      <section className={`${panel} space-y-6`}>
        <h2 className={panelTitle}>{t(lang, 'progress.byLevel')}</h2>
        <Bars
          items={levelBars.map((b) => ({
            label: t(lang, `level.${b.level}` as TranslationKey),
            done: b.done,
            total: b.total,
          }))}
        />
        <h2 className={panelTitle}>{t(lang, 'progress.byDomain')}</h2>
        <Bars
          items={domainBars.map((b) => ({
            label: t(lang, `domain.${b.domain}` as TranslationKey),
            done: b.done,
            total: b.total,
          }))}
        />
      </section>

      {/* Calendrier d'activite */}
      <section className={`${panel}`}>
        <h2 className={panelTitle}>{t(lang, 'progress.activity')}</h2>
        <p className="mt-1 text-xs text-muted">{t(lang, 'progress.calendar.legend')}</p>
        {weeks.length ? (
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                <div className="h-4 text-center text-[var(--text-xs)] text-subtle">
                  {weekMonths[wi] ?? ''}
                </div>
                {week.map((cell) => (
                  <div
                    key={cell.key}
                    title={cell.key}
                    className={`h-3 w-3 rounded-sm ${cell.active ? 'bg-primary' : 'bg-surface-2'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">{t(lang, 'progress.noActivity')}</p>
        )}
      </section>

      {/* Données : export / import / reset */}
      <section className={`${panel} space-y-4`}>
        <h2 className={panelTitle}>{t(lang, 'progress.data')}</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={() => exportProgress()}>
            {t(lang, 'progress.export')}
          </button>
          <button type="button" className={btnSecondary} onClick={() => triggerImport('merge')}>
            {t(lang, 'progress.import.merge')}
          </button>
          <button type="button" className={btnSecondary} onClick={() => triggerImport('replace')}>
            {t(lang, 'progress.import.replace')}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-danger bg-surface px-4 py-2 text-base font-medium text-danger transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            onClick={() => setConfirmReset(true)}
          >
            {t(lang, 'progress.reset')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label={t(lang, 'progress.import.choose')}
            onChange={onFilePick}
          />
        </div>

        {importStatus === 'success' && (
          <p role="status" className="text-sm text-success">{t(lang, 'progress.import.success')}</p>
        )}
        {importStatus === 'error' && (
          <p role="status" className="text-sm text-danger">{t(lang, 'progress.import.invalid')}</p>
        )}

        {confirmReset && (
          <div className="rounded-md border border-danger bg-danger-soft p-4">
            <p className="text-sm font-medium text-text">{t(lang, 'progress.resetConfirm')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 text-base font-medium text-on-primary transition-colors duration-[var(--dur-fast)] hover:bg-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                }}
              >
                {t(lang, 'progress.reset.confirm')}
              </button>
              <button type="button" className={btnSecondary} onClick={() => setConfirmReset(false)}>
                {t(lang, 'common.cancel')}
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-sm text-muted">{t(lang, 'progress.localNotice')}</p>
    </div>
  )
}
