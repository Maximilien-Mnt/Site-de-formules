import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'

export interface RenderMdOptions {
  inline?: boolean
}

/**
 * Rend une chaîne Markdown (LaTeX inclus via remark-math + rehype-katex) en HTML.
 *
 * Quand `inline` est vrai, la source est traitée comme une seule expression
 * math inline (enveloppée dans `$...$`) : utile pour les champs Markdown des
 * exercices qui contiennent une formule isolée.
 */
export async function renderMd(
  source: string,
  { inline = false }: RenderMdOptions = {},
): Promise<string> {
  const input = inline ? `$${source}$` : source
  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(input)
  return String(file)
}
