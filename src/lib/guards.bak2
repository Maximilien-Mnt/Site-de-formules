/**
 * Gardes mathématiques pour s'assurer que les nombres générés
 * ne faussent JAMAIS les exercices (ne violent jamais de contraintes mathématiques).
 * 
 * Ces fonctions sont pures (sans DOM) et testables avec Vitest.
 */
export interface NumericGuardContext {
  formula?: {
    variables: { symbol: string; min?: number; max?: number; step?: number }[]
  }
  level?: number
  difficulty?: number
  constraints?: {
    positive?: boolean
    nonNegative?: boolean
    range?: [min: number, max: number]
    forbiddenValues?: number[]
    greaterThan?: number
    lessThan?: number
  }
}

export interface GuardResult {
  valid: boolean
  reason?: string
  correctedValue?: number
}

/**
 * Valide qu'une valeur numérique ne violette aucune contrainte mathématique.
 */
export function validateNumericValue(
  value: number,
  ctx: NumericGuardContext = {}
): GuardResult {
  const { constraints = {} } = ctx

  // Borne explicite
  if (constraints.range) {
    const [min, max] = constraints.range
    if (value < min || value > max) {
      return {
        valid: false,
        reason: `Valeur ${value} hors intervalle [${min}, ${max}]`,
        correctedValue: Math.max(min, Math.min(max, value)),
      }
    }
  }

  // Valeurs interdites (ex. dénominateur nul)
  if (constraints.forbiddenValues?.includes(value)) {
    return { valid: false, reason: `Valeur ${value} est interdite` }
  }

  // Positif strict
  if (constraints.positive === true && value <= 0) {
    return {
      valid: false,
      reason: `Valeur doit être stricto sensu positive, reçue: ${value}`,
      correctedValue: Math.abs(value) || 1,
    }
  }

  // Non-négatif
  if (constraints.nonNegative === true && value < 0) {
    return {
      valid: false,
      reason: `Valeur doit être non-négative, reçue: ${value}`,
      correctedValue: Math.abs(value),
    }
  }

  // Comparaisons
  if (constraints.greaterThan !== undefined && value <= constraints.greaterThan) {
    return {
      valid: false,
      reason: `Valeur doit être supérieure à ${constraints.greaterThan}, reçue: ${value}`,
    }
  }

  if (constraints.lessThan !== undefined && value >= constraints.lessThan) {
    return {
      valid: false,
      reason: `Valeur doit être inférieure à ${constraints.lessThan}, reçue: ${value}`,
    }
  }

  return { valid: true }
}

/**
 * Valide qu'une question QCM a un bon répondant correct et des distrayeurs plausibles.
 */
export function validateQCMQuestion(
  choices: readonly string[],
  correct: readonly string[],
  formulaOptionnel?: { variables: { symbol: string }[]; constraints?: NumericGuardContext['constraints'] }
): GuardResult {
  if (choices.length === 0) {
    return { valid: false, reason: 'Aucun choix proposé' }
  }
  if (correct.length === 0) {
    return { valid: false, reason: 'Aucune réponse correcte' }
  }
  if (choices.length !== correct.length && correct.length !== 1) {
    return { valid: false, reason: 'Mauvais nombre de bonnes réponses' }
  }

  const choiceSet = new Set(choices)
  for (const c of correct) {
    if (!choiceSet.has(c)) {
      return { valid: false, reason: `Bonne réponse ${c} non présente dans les choix` }
    }
  }

  if (new Set(choices).size !== choices.length) {
    return { valid: false, reason: 'Doublons dans les choix' }
  }

  if (formulaOptionnel && formulaOptionnel.constraints) {
    for (const choice of choices) {
      const s = choice.trim().replace('−', '-')
      if (s.includes('/')) {
        const parts = s.replace(/[\s\u2009\u202f\u00a0]/g, '').split('/')
        if (parts.length === 2) {
          const denom = Number(parts[1])
          if (denom === 0) {
            return { valid: false, reason: `Choix "${choice}": dénominateur nul` }
          }
        }
      } else {
        const v = Number(s.replace(',', '.'))
        if (!Number.isFinite(v)) {
          return { valid: false, reason: `Choix "${choice}": nombre invalide` }
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Valide qu'un exercice ouvert a du sens mathématique.
 */
export function validateOpenExerciseStatement(
  statement: string,
  generatedValues: Record<string, number>
): GuardResult {
  const issues: string[] = []

  // Vérifier les racines carrées de nombres négatifs
  const sqrtPattern = /sqrt[^a-zA-Z]*\{?([\w]+)\}/gi
  const sqrtMatches = statement.match(sqrtPattern)
  if (sqrtMatches) {
    for (const match of sqrtMatches) {
      const varName = match.replace('sqrt', '').replace('{', '').replace('}', '').trim()
      if (generatedValues[varName] !== undefined && generatedValues[varName] < 0) {
        issues.push(`Racine carrée de ${varName} = ${generatedValues[varName]}`)
      }
    }
  }

  // Vérifier les logarithmes d'arguments non positifs
  const logPattern = /log[^a-zA-Z]*\{?([\w]+)\}/gi
  const logMatches = statement.match(logPattern)
  if (logMatches) {
    for (const match of logMatches) {
      const varName = match.replace('log', '').replace('{', '').replace('}', '').trim()
      if (generatedValues[varName] !== undefined && generatedValues[varName] <= 0) {
        issues.push(`Logarithme de ${varName} = ${generatedValues[varName]}`)
      }
    }
  }

  // Vérifier les divisions par des variables
  const divPattern = /[\s(/*]-?\d*\.?\d+\s*\/\s*[\w]+/g
  const divMatches = statement.match(divPattern) || []
  for (const match of divMatches) {
    const afterSlash = match.split('/').pop()?.trim()
    if (afterSlash && generatedValues[afterSlash] !== undefined) {
      if (generatedValues[afterSlash] === 0) {
        issues.push(`Division par zéro par ${afterSlash}`)
      }
    }
  }

  if (issues.length > 0) {
    return { valid: false, reason: `Problèmes: ${issues.join('; ')}` }
  }

  return { valid: true }
}
