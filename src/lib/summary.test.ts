import { describe, expect, it } from 'vitest'
import {
  buildSummaryItems,
  getDefaultSelection,
  groupByDomain,
  type FormulaSummaryItem,
} from '@/lib/summary'
import type { FormulaView } from '@/lib/content'

function makeFormula(overrides: Partial<Omit<FormulaView, 'text'>> & { text?: Partial<FormulaView['text']> }): FormulaView {
  return {
    id: overrides.id ?? 'f1',
    subject: 'math',
    domain: overrides.domain ?? 'geometry',
    topics: [],
    level: 3,
    difficulty: 2,
    latex: 'a^2 + b^2 = c^2',
    status: 'published',
    originYear: undefined,
    variants: [],
    variables: [],
    text: {
      title: overrides.text?.title ?? 'Formule test',
      summary: '',
      aliases: [],
      keywords: [],
      variableNames: {},
      variantLabels: {},
      body: '',
    },
    lang: 'fr',
    isFallback: false,
    sections: [],
    body: '',
    exercises: [],
    prerequisites: [],
    related: [],
    confusedWith: [],
    graph: undefined,
    ...overrides,
  } as FormulaView
}

describe('getDefaultSelection', () => {
  it('sélectionne toutes les formules quand il n\'y a aucune progression', () => {
    const formulas = [makeFormula({ id: 'a' }), makeFormula({ id: 'b' })]
    const selected = getDefaultSelection(formulas, { formulas: {} })
    expect(selected.has('a')).toBe(true)
    expect(selected.has('b')).toBe(true)
    expect(selected.size).toBe(2)
  })

  it('sélectionne uniquement les formules published quand il y a une progression', () => {
    const formulas = [
      makeFormula({ id: 'a', status: 'draft' }),
      makeFormula({ id: 'b', status: 'published' }),
    ]
    const selected = getDefaultSelection(formulas, {
formulas: { a: 'mastered', b: 'new' },
    })
    expect(selected.has('a')).toBe(false)
    expect(selected.has('b')).toBe(true)
    expect(selected.size).toBe(1)
  })
})

describe('buildSummaryItems', () => {
  const formulas = [
    makeFormula({
      id: 'pythagore',
      domain: 'geometry',
      latex: 'a^{2} + b^{2} = c^{2}',
      variables: [{ symbol: 'a' }, { symbol: 'b' }, { symbol: 'c' }],
      variants: [{ id: 'hypotenuse', latex: 'c = \\sqrt{a^{2} + b^{2}}' }],
      text: {
        title: 'Théorème de Pythagore',
        summary: '',
        aliases: [],
        keywords: [],
        variableNames: { a: 'côté a', b: 'côté b', c: 'hypoténuse' },
        variantLabels: { hypotenuse: 'Calculer l\'hypoténuse' },
        body: '',
      },
    }),
  ]

  it('construit les items avec les bonnes propriétés', () => {
    const items = buildSummaryItems(formulas)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('pythagore')
    expect(items[0].title).toBe('Théorème de Pythagore')
    expect(items[0].latex).toBe('a^{2} + b^{2} = c^{2}')
    expect(items[0].variables).toEqual([
      { symbol: 'a', name: 'côté a', unit: undefined },
      { symbol: 'b', name: 'côté b', unit: undefined },
      { symbol: 'c', name: 'hypoténuse', unit: undefined },
    ])
    expect(items[0].variants).toEqual([
      { id: 'hypotenuse', latex: 'c = \\sqrt{a^{2} + b^{2}}', label: 'Calculer l\'hypoténuse' },
    ])
  })

  it('gère l\'absence de texte localisé', () => {
    const items = buildSummaryItems([
      makeFormula({ id: 'x', text: undefined }),
    ])
    expect(items[0].title).toBe('x')
    expect(items[0].variables).toEqual([])
    expect(items[0].variants).toEqual([])
  })
})

describe('groupByDomain', () => {
  const items: FormulaSummaryItem[] = [
    { id: 'b', title: 'B formule', latex: '', domain: 'algebra', level: 1, difficulty: 1, variables: [], variants: [], url: '' },
    { id: 'a', title: 'A formule', latex: '', domain: 'geometry', level: 1, difficulty: 1, variables: [], variants: [], url: '' },
    { id: 'c', title: 'C formule', latex: '', domain: 'geometry', level: 1, difficulty: 1, variables: [], variants: [], url: '' },
  ]

  const groups = groupByDomain(items, (d) => `Label ${d}`)

  it('regroupe par domaine', () => {
    expect(groups).toHaveLength(2)
    const geometry = groups.find((g) => g.domain === 'geometry')
    expect(geometry?.items.map((i) => i.id)).toEqual(['a', 'c'])
    const algebra = groups.find((g) => g.domain === 'algebra')
    expect(algebra?.items.map((i) => i.id)).toEqual(['b'])
  })

  it('trie alphabétiquement à l\'intérieur de chaque domaine', () => {
    const geometry = groups.find((g) => g.domain === 'geometry')
    expect(geometry?.items[0].title).toBe('A formule')
    expect(geometry?.items[1].title).toBe('C formule')
  })
})