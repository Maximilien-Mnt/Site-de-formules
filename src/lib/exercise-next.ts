// « Exercice suivant » : exercice du même domaine et du même niveau dans un
// ordre stable, avec repli sur le même domaine puis sur le même niveau.
// Logique pure (testée) : ne dépend que des données passées en argument.
export interface NextExerciseCandidate {
  id: string
  domain: string
  level: number
  title: string
}

export function getNextExercise(
  exercises: readonly NextExerciseCandidate[],
  currentId: string,
  locale = 'fr',
): NextExerciseCandidate | undefined {
  const current = exercises.find((e) => e.id === currentId)
  if (!current) return undefined

  const others = exercises.filter((e) => e.id !== currentId)
  const byDomainAndLevel = others.filter(
    (e) => e.domain === current.domain && e.level === current.level,
  )
  const byDomain = others.filter((e) => e.domain === current.domain)
  const byLevel = others.filter((e) => e.level === current.level)

  // Priorité : même domaine ET même niveau, puis même domaine, puis même niveau.
  const pool = byDomainAndLevel.length
    ? byDomainAndLevel
    : byDomain.length ? byDomain : byLevel

  if (pool.length === 0) return undefined

  pool.sort(
    (a, b) =>
      a.level - b.level ||
      a.title.localeCompare(b.title, locale, { sensitivity: 'base' }),
  )
  return pool[0]
}