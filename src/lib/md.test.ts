import { describe, it, expect } from 'vitest'
import { renderMd } from '@/lib/md'

describe('renderMd', () => {
  it('rend une formule inline avec KaTeX (application/x-tex)', async () => {
    const html = await renderMd('x^{2} + y^{2} = z^{2}', { inline: true })
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
    expect(html).toContain('application/x-tex')
  })

  it('rend du Markdown classique sans mode inline', async () => {
    const html = await renderMd('Bonjour *le monde*')
    expect(html).toContain('<em>le monde</em>')
  })

  it('n\'enveloppe pas en math quand inline est faux', async () => {
    const html = await renderMd('x^{2} + y^{2}')
    expect(html).not.toContain('application/x-tex')
  })
})
