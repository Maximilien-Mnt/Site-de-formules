import { describe, it, expect } from 'vitest'
import { getFormula, getFormulas, getExercise, getExercises } from '@/lib/content'

describe('getFormulas / getFormula', () => {
  it('retourne toutes les formules publiées en français', () => {
    const formulas = getFormulas('fr')
    expect(formulas.map((f) => f.id).sort()).toEqual([
      'aire-disque',
      'discriminant-trinome',
      'identite-trigonometrique',
      'pythagore',
    ])
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

  it('index inversé : pythagore a trois exercices liés', () => {
    const p = getFormula('fr', 'pythagore')!
    expect(p.exercises.map((e) => e.id).sort()).toEqual([
      'pythagore-hypotenuse-01',
      'pythagore-reciproque-01',
      'trigo-sinus-01',
    ])
  })

  it('index inversé : aire-disque a un seul exercice, pas de faux positifs', () => {
    const a = getFormula('fr', 'aire-disque')!
    expect(a.exercises.map((e) => e.id)).toEqual(['aire-disque-01'])
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
    expect(exs.map((e) => e.id).sort()).toEqual([
      'aire-disque-01',
      'discriminant-calcul-01',
      'pythagore-hypotenuse-01',
      'pythagore-reciproque-01',
      'trigo-sinus-01',
    ])
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
