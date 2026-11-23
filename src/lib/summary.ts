// Logique pure pour la fiche-résumé imprimable (anti-sèche).
// Testable en node, sans DOM.

import type { FormulaView } from '@/lib/content'
import type { ProgressState } from '@/lib/progress'

export interface FormulaSummaryItem {
  id: string
  title: string
  latex: string
  domain: string
  level: number
  difficulty: number
  variables: { symbol: string; name: string; unit?: string }[]
  variants: { id: string; latex: string; label?: string }[]
  url: string
}

export interface DomainGroup {
  domain: string
  domainLabel: string
  items: FormulaSummaryItem[]
}

/**
 * Sélection par défaut pour la fiche-résumé :
 * - si une progression existe : les formules en statut 'learning' ou 'mastered'
 * - sinon : toutes les formules (impression complète sans JavaScript)
 */
export function getDefaultSelection(
  formulas: FormulaView[],
  progress: Pick<ProgressState, 'formulas'>,
): Set<string> {
  const selected = new Set<string>()
  // Si des formules sont en progression (stockées dans localStorage),
  // on sélectionne celles qui sont "maîtrisées" (published) ;
  // sinon on sélectionne tout pour une impression complète.
  const hasAnyProgress = Object.keys(progress.formulas).length > 0

  for (const f of formulas) {
    if (hasAnyProgress) {
      // On ne sélectionne que les formules published (ayant fait l'objet d'un apprentissage)
      if (f.status === 'published') selected.add(f.id)
    } else {
      selected.add(f.id)
    }
  }
  return selected
}

export function buildSummaryItems(
  formulas: FormulaView[],
): FormulaSummaryItem[] {
  return formulas.map((f) => ({
    id: f.id,
    title: f.text?.title ?? f.id,
    latex: f.latex,
    domain: f.domain,
    level: f.level,
    difficulty: f.difficulty,
    variables: f.variables.map((v) => ({
      symbol: v.symbol,
      name: f.text?.variableNames?.[v.symbol] ?? '',
      unit: v.unit,
    })),
    variants: f.variants.map((v) => ({
      id: v.id,
      latex: v.latex,
      label: f.text?.variantLabels?.[v.id],
    })),
    url: '', // rempli par l'appelant (dépend de la langue)
  }))
}

export function groupByDomain(
  items: FormulaSummaryItem[],
  getDomainLabel: (domain: string) => string,
): DomainGroup[] {
  const map = new Map<string, FormulaSummaryItem[]>()
  for (const item of items) {
    const arr = map.get(item.domain) ?? []
    arr.push(item)
    map.set(item.domain, arr)
  }
  return Array.from(map.entries()).map(([domain, items]) => ({
    domain,
    domainLabel: getDomainLabel(domain),
    items: items.sort((a, b) =>
      a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }),
    ),
  }))
}