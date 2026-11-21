import { describe, it, expect } from 'vitest'
import { getFormula, getFormulas, getExercise, getExercises, getFormulaTitle } from '@/lib/content'

describe('getFormulas / getFormula', () => {
  it('retourne toutes les formules en français (brouillons inclus hors prod)', () => {
    const formulas = getFormulas('fr')
    const ids = formulas.map((f) => f.id)
    expect(formulas.length).toBeGreaterThan(0)
    // Les formules du starter sont toujours présentes.
    for (const id of [
      'aire-disque',
      'discriminant-trinome',
      'identite-trigonometrique',
      'pythagore',
    ]) {
      expect(ids).toContain(id)
    }
    for (const f of formulas) {
      expect(f.isFallback).toBe(false)
      expect(f.lang).toBe('fr')
      expect(f.text).toBeDefined()
    }
  })

  it('détaille une formule avec ses sections détectées', () => {
    const p = getFormula('fr', 'pythagore')!
    expect(p.id).toBe('pythagore')
    expect(p.text?.title).toBe('Théorème de Pythagore')
    expect(p.sections.map((s) => s.kind).sort()).toEqual([
      'applications',
      'explanation',
      'further',
      'history',
      'intuition',
      'methods',
      'mistakes',
      'proof',
    ])
    expect(p.body).toContain('BC^{2}')
  })

  it('index inversé : les exercices liés à pythagore, sans faux positifs', () => {
    const p = getFormula('fr', 'pythagore')!
    const ids = p.exercises.map((e) => e.id)
    expect(ids).toContain('pythagore-hypotenuse-01')
    expect(ids).toContain('pythagore-reciproque-01')
    expect(ids).toContain('trigo-sinus-01')
    expect(ids).not.toContain('aire-disque-01')
  })

  it('index inversé : aire-disque inclut son exercice, pas de faux positifs', () => {
    const a = getFormula('fr', 'aire-disque')!
    const ids = a.exercises.map((e) => e.id)
    expect(ids).toContain('aire-disque-01')
    expect(ids).not.toContain('pythagore-hypotenuse-01')
  })

  it('résout les prérequis en formules légères', () => {
    const tri = getFormula('fr', 'identite-trigonometrique')!
    expect(tri.prerequisites.map((f) => f.id)).toEqual(['pythagore'])
    expect(tri.prerequisites[0]).toMatchObject({
      id: 'pythagore',
      subject: 'math',
      domain: 'geometry',
    })
  })

  it('retourne undefined pour une formule inconnue', () => {
    expect(getFormula('fr', 'n-existe-pas')).toBeUndefined()
  })
})

describe('getExercises / getExercise', () => {
  it('retourne tous les exercices avec texte', () => {
    const exs = getExercises('fr')
    expect(exs.length).toBeGreaterThan(0)
    for (const e of exs) {
      expect(e.text).toBeDefined()
    }
    // Les exercices du starter sont toujours présents.
    const ids = exs.map((e) => e.id)
    for (const id of [
      'aire-disque-01',
      'discriminant-calcul-01',
      'pythagore-hypotenuse-01',
      'pythagore-reciproque-01',
      'trigo-sinus-01',
    ]) {
      expect(ids).toContain(id)
    }
  })

  it('détaille un exercice avec son texte localisé', () => {
    const e = getExercise('fr', 'pythagore-hypotenuse-01')!
    expect(e.id).toBe('pythagore-hypotenuse-01')
    expect(e.text?.title).toBe("Longueur d'une hypoténuse")
    expect(e.kind).toBe('numeric')
  })

  it('retourne undefined pour un exercice inconnu', () => {
    expect(getExercise('fr', 'n-existe-pas')).toBeUndefined()
  })
})

describe('repli de langue sur fr', () => {
  it('formule : repli quand la langue demandée manque', () => {
    const p = getFormula('de', 'pythagore')!
    expect(p.isFallback).toBe(true)
    expect(p.lang).toBe('fr')
    expect(p.text?.title).toBe('Théorème de Pythagore')
    expect(p.sections.length).toBeGreaterThan(0)
  })

  it('exercice : repli quand la langue demandée manque', () => {
    const e = getExercise('de', 'pythagore-hypotenuse-01')!
    expect(e.isFallback).toBe(true)
    expect(e.lang).toBe('fr')
    expect(e.text?.title).toBe("Longueur d'une hypoténuse")
  })

  it('les exercices liés héritent du repli de la formule', () => {
    const p = getFormula('de', 'pythagore')!
    for (const ex of p.exercises) {
      expect(ex.isFallback).toBe(true)
      expect(ex.lang).toBe('fr')
    }
  })

  it('fr demandé n\'est pas un repli', () => {
    const p = getFormula('fr', 'pythagore')!
    expect(p.isFallback).toBe(false)
  })
})

describe('getFormulaTitle', () => {
  it("retourne le titre localisé d'une formule", () => {
    expect(getFormulaTitle('fr', 'pythagore')).toBe('Théorème de Pythagore')
  })

  it('replie sur fr quand la langue demandée manque', () => {
    expect(getFormulaTitle('de', 'pythagore')).toBe('Théorème de Pythagore')
  })

  it('retourne undefined pour une formule inconnue', () => {
    expect(getFormulaTitle('fr', 'n-existe-pas')).toBeUndefined()
  })
})
