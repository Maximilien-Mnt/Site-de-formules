import { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { t } from '@/i18n/index'
import type { Lang } from '@/i18n/config'
import { progressStore, type FormulaStatus } from '@/lib/progress'

interface Props {
  lang: Lang
  itemIds: string[]
}

const SELECTED_CLASS = 'summary-selected'

export default function FormulaSummaryApp({ lang, itemIds }: Props) {
  const progress = useStore(progressStore)
  const [printing, setPrinting] = useState(false)
  const initialized = useRef(false)

  // Sélection initiale : learning/mastered si progression existe, sinon tout.
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const hasAnyProgress = Object.keys(progress.formulas).length > 0
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      '.summary-checkbox',
    )

    checkboxes.forEach((cb) => {
      const card = cb.closest<HTMLElement>('.summary-card')
      const formulaId = card?.dataset.id
      if (!formulaId) return

      let checked = true
      if (hasAnyProgress) {
        const status = progress.formulas[formulaId]
        checked =
          status === 'learning' || status === 'mastered'
      }

      cb.checked = checked
      if (checked) {
        card?.classList.add(SELECTED_CLASS)
      } else {
        card?.classList.remove(SELECTED_CLASS)
      }
    })

    updateCount()

    // Écouteurs sur les cases à cocher
    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const card = cb.closest<HTMLElement>('.summary-card')
        if (cb.checked) {
          card?.classList.add(SELECTED_CLASS)
        } else {
          card?.classList.remove(SELECTED_CLASS)
        }
        updateCount()
      })
    })

    // Boutons Tout sélectionner / Tout désélectionner
    const btnAll = document.getElementById('summary-select-all')
    const btnNone = document.getElementById('summary-select-none')
    const btnPrint = document.getElementById('summary-print')

    btnAll?.addEventListener('click', () => {
      checkboxes.forEach((cb) => {
        cb.checked = true
        const card = cb.closest<HTMLElement>('.summary-card')
        card?.classList.add(SELECTED_CLASS)
      })
      updateCount()
    })

    btnNone?.addEventListener('click', () => {
      checkboxes.forEach((cb) => {
        cb.checked = false
        const card = cb.closest<HTMLElement>('.summary-card')
        card?.classList.remove(SELECTED_CLASS)
      })
      updateCount()
    })

    btnPrint?.addEventListener('click', () => {
      setPrinting(true)
      window.print()
      setPrinting(false)
    })
  }, [])

  // Mise à jour du compteur de sélection
  function updateCount() {
    const count = document.querySelectorAll<HTMLInputElement>(
      '.summary-checkbox:checked',
    ).length
    const el = document.getElementById('summary-count')
    if (el) {
      el.textContent = t(lang, 'summary.count', { count })
    }
  }

  // Réagir aux changements de progression (ex. marquage maîtrisée depuis une autre page)
  useEffect(() => {
    if (!initialized.current) return
    const hasAnyProgress = Object.keys(progress.formulas).length > 0
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      '.summary-checkbox',
    )
    checkboxes.forEach((cb) => {
      const card = cb.closest<HTMLElement>('.summary-card')
      const formulaId = card?.dataset.id
      if (!formulaId) return
      let checked = true
      if (hasAnyProgress) {
        const status = progress.formulas[formulaId]
        checked = status === 'learning' || status === 'mastered'
      }
      cb.checked = checked
      if (checked) {
        card?.classList.add(SELECTED_CLASS)
      } else {
        card?.classList.remove(SELECTED_CLASS)
      }
    })
    updateCount()
  }, [progress.formulas])

  if (printing) {
    return (
      <div role="status" aria-live="polite" className="sr-only">
        {t(lang, 'summary.printing')}
      </div>
    )
  }

  return null
}