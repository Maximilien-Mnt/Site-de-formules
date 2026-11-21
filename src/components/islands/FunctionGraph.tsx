// Îlot React « graphique de formule » (P8), hydraté avec client:visible dans FormulaDetail.
// - kind 'function' : courbes évaluées par mathjs (import dynamique) + curseurs
//   pour graph.params, viewport de graph.viewport, erreurs sans crash.
// - kind 'preset'   : schémas paramétrés (triangle rectangle, cercle trigonométrique).
import { useEffect, useState } from 'react'
import type { Lang } from '@/i18n/config'
import { t } from '@/i18n/index'
import { formatNumber, type GraphParam, type FunctionGraphConfig, type GraphConfig, type MathJs } from '@/lib/graph'
import FunctionPlot from './graph/FunctionPlot'
import ParamSlider from './graph/ParamSlider'
import RightTriangle from './graph/RightTriangle'
import UnitCircle from './graph/UnitCircle'
import 'mafs/core.css'
import './graph/graph.css'

interface Props {
  lang: Lang
  config: GraphConfig
}

export default function FunctionGraph({ lang, config }: Props) {
  if (config.kind === 'preset') {
    return config.preset === 'right-triangle' ? <RightTriangle lang={lang} /> : <UnitCircle lang={lang} />
  }
  return <FunctionGraphFunction lang={lang} config={config} />
}

/** Variante « function » : charge mathjs à la demande et pilote les curseurs. */
function FunctionGraphFunction({ lang, config }: { lang: Lang; config: FunctionGraphConfig }) {
  const [math, setMath] = useState<MathJs | null>(null)
  const [failed, setFailed] = useState(false)
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.params.map((p: GraphParam) => [p.name, p.default])),
  )

  useEffect(() => {
    let cancelled = false
    import('mathjs')
      .then((m) => {
        if (!cancelled) setMath(m)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setParam = (name: string, value: number) => setValues((v) => ({ ...v, [name]: value }))

  return (
    <div className="formulo-graph">
      <FunctionPlot lang={lang} config={config} values={values} math={math} failed={failed} />
      {config.params.length > 0 && (
        <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
          {config.params.map((p: GraphParam) => (
            <ParamSlider
              key={p.name}
              label={p.name}
              ariaLabel={t(lang, 'graph.param', { name: p.name })}
              valueText={formatNumber(lang, values[p.name] ?? p.default)}
              min={p.min}
              max={p.max}
              step={p.step}
              value={values[p.name] ?? p.default}
              onChange={(v) => setParam(p.name, v)}
            />
          ))}
        </div>
      )}
    </div>
  )
}