// Précédent / suivant d'une formule au sein de son domaine.
// Logique pure (testée) : le tri ne dépend que des données passées en argument.
export interface NeighborFormula {
  id: string
  domain: string
  level: number
  title: string
}

export interface FormulaNeighbors {
  prev: NeighborFormula | undefined
  next: NeighborFormula | undefined
}

/**
 * Voisins d'une formule : précédent et suivant dans le même domaine,
 * triés par niveau croissant puis par titre (ordre alphabétique localisé).
 * Aux extrémités, le voisin manquant est `undefined` (pas de bouclage).
 */
export function getFormulaNeighbors(
  formulas: readonly NeighborFormula[],
  currentId: string,
  locale = 'fr',
): FormulaNeighbors {
  const current = formulas.find((f) => f.id === currentId)
  if (!current) return { prev: undefined, next: undefined }

  const sameDomain = formulas
    .filter((f) => f.domain === current.domain)
    .sort(
      (a, b) =>
        a.level - b.level ||
        a.title.localeCompare(b.title, locale, { sensitivity: 'base' }),
    )

  const index = sameDomain.findIndex((f) => f.id === currentId)
  return {
    prev: index > 0 ? sameDomain[index - 1] : undefined,
    next:
      index >= 0 && index < sameDomain.length - 1
        ? sameDomain[index + 1]
        : undefined,
  }
}
