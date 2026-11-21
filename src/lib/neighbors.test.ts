import { describe, it, expect } from 'vitest'
import {
  getFormulaNeighbors,
  type NeighborFormula,
} from './neighbors'

const f = (
  id: string,
  domain: string,
  level: number,
  title: string,
): NeighborFormula => ({ id, domain, level, title })

describe('getFormulaNeighbors', () => {
  const list = [
    f('pythagore', 'geometry', 3, 'Théorème de Pythagore'),
    f('aire-rectangle', 'geometry', 2, 'Aire du rectangle'),
    f('thales', 'geometry', 3, 'Théorème de Thalès'),
    f('distributivite', 'arithmetic', 2, 'Distributivité'),
  ]

  it('renvoie le précédent et le suivant dans le même domaine', () => {
    const { prev, next } = getFormulaNeighbors(list, 'pythagore')
    expect(prev?.id).toBe('aire-rectangle')
    expect(next?.id).toBe('thales')
  })

  it('renvoie undefined aux extrémités du domaine (pas de bouclage)', () => {
    const first = getFormulaNeighbors(list, 'aire-rectangle')
    expect(first.prev).toBeUndefined()
    expect(first.next?.id).toBe('pythagore')

    const last = getFormulaNeighbors(list, 'thales')
    expect(last.prev?.id).toBe('pythagore')
    expect(last.next).toBeUndefined()
  })

  it('trie par niveau croissant puis par titre', () => {
    // aire-rectangle (niveau 2) < pythagore (3) < thales (3, « P » < « T »)
    const { prev, next } = getFormulaNeighbors(list, 'pythagore')
    expect(prev?.id).toBe('aire-rectangle')
    expect(next?.id).toBe('thales')
  })

  it('ignore les formules des autres domaines', () => {
    const { prev, next } = getFormulaNeighbors(list, 'distributivite')
    expect(prev).toBeUndefined()
    expect(next).toBeUndefined()
  })

  it('gère une liste vide et un identifiant inconnu', () => {
    expect(getFormulaNeighbors([], 'pythagore')).toEqual({
      prev: undefined,
      next: undefined,
    })
    expect(getFormulaNeighbors(list, 'inconnu')).toEqual({
      prev: undefined,
      next: undefined,
    })
  })
})
