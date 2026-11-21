// Canvas Mafs d'un graph de type « function » : grille/axes discrets, courbes Plot.OfX.
// mathjs est chargé en amont (import dynamique) ; chaque expression est compilée
// une fois, puis évaluée point par point avec le scope { x, ...paramètres }.
import { useMemo } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import type { EvalFunction } from 'mathjs'
import type { Lang } from '@/i18n/config'
import { t } from '@/i18n/index'
import {
  formatNumber,
  niceStep,
  toFiniteNumber,
  type FunctionGraphConfig,
  type MathJs,
} from '@/lib/graph'
import GraphError from './GraphError'

interface Props {
  lang: Lang
  config: FunctionGraphConfig
  values: Record<string, number>
  math: MathJs | null
  failed: boolean
}

const CANVAS_HEIGHT = 380

export default function FunctionPlot({ lang, config, values, math, failed }: Props) {
  const compiled = useMemo(() => {
    if (!math) return null
    try {
      return config.expressions.map((expr) => math.compile(expr))
    } catch {
      return undefined
    }
  }, [math, config])

  const [xMin, xMax] = config.viewport.x
  const [yMin, yMax] = config.viewport.y
  const xStep = niceStep(xMax - xMin)
  const yStep = niceStep(yMax - yMin)
  const labels = (n: number): string => formatNumber(lang, n, 2)

  return (
    <>
      {config.expressions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3 print:hidden">
          <span className="sr-only">{t(lang, 'graph.expressions')}</span>
          {config.expressions.map((expr, i) => (
            <code key={i} className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">
              f{i + 1}(x) = {expr}
            </code>
          ))}
        </div>
      )}

      {failed || compiled === undefined ? (
        <div className="p-4">
          <GraphError lang={lang} />
        </div>
      ) : compiled === null ? (
        <div className="flex items-center justify-center" style={{ height: CANVAS_HEIGHT }}>
          <p className="text-sm text-muted">{t(lang, 'common.loading')}</p>
        </div>
      ) : (
        <Mafs
          viewBox={{ x: config.viewport.x, y: config.viewport.y }}
          pan={false}
          zoom={false}
          height={CANVAS_HEIGHT}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: xStep, subdivisions: 2, axis: true, labels }}
            yAxis={{ lines: yStep, subdivisions: 2, axis: true, labels }}
          />
          {compiled.map((node: EvalFunction, i: number) => (
            <Plot.OfX
              key={i}
              y={(x) => {
                try {
                  return toFiniteNumber(node.evaluate({ x, ...values }))
                } catch {
                  return NaN
                }
              }}
              color="var(--primary)"
              weight={2.5}
            />
          ))}
        </Mafs>
      )}
    </>
  )
}