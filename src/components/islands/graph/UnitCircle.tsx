// Preset « unit-circle » : point mobile sur le cercle trigonométrique.
// Curseur θ, affiche cos θ, sin θ et l'identité cos² θ + sin² θ = 1.
import { useState } from 'react'
import { Mafs, Coordinates, Circle, Line, Point, Text } from 'mafs'
import type { Lang } from '@/i18n/config'
import { t } from '@/i18n/index'
import { formatNumber, niceStep, unitCirclePoint } from '@/lib/graph'
import ParamSlider from './ParamSlider'

const CANVAS_HEIGHT = 380
const DEG_MIN = 0
const DEG_MAX = 360
const DEG_STEP = 1
const VIEWBOX_X: [number, number] = [-1.6, 1.6]
const VIEWBOX_Y: [number, number] = [-1.3, 1.3]

export default function UnitCircle({ lang }: { lang: Lang }) {
  const [theta, setTheta] = useState(45)
  const p = unitCirclePoint(theta)

  const xStep = niceStep(VIEWBOX_X[1] - VIEWBOX_X[0])
  const yStep = niceStep(VIEWBOX_Y[1] - VIEWBOX_Y[0])
  const labels = (n: number): string => formatNumber(lang, n, 2)

  return (
    <div className="formulo-graph">
      <Mafs
        viewBox={{ x: VIEWBOX_X, y: VIEWBOX_Y }}
        pan={false}
        zoom={false}
        height={CANVAS_HEIGHT}
      >
        <Coordinates.Cartesian
          xAxis={{ lines: xStep, subdivisions: 2, axis: true, labels }}
          yAxis={{ lines: yStep, subdivisions: 2, axis: true, labels }}
        />

        <Circle center={[0, 0]} radius={1} color="var(--text)" weight={1.5} fillOpacity={0} />

        {/* Projections : cos sur l'axe x (primary), sin sur l'axe y (accent). */}
        <Line.Segment
          point1={[0, p.y]}
          point2={[p.x, p.y]}
          color="var(--primary)"
          weight={1.5}
          style="dashed"
        />
        <Line.Segment
          point1={[p.x, 0]}
          point2={[p.x, p.y]}
          color="var(--accent)"
          weight={1.5}
          style="dashed"
        />

        {/* Rayon et point mobile. */}
        <Line.Segment point1={[0, 0]} point2={[p.x, p.y]} color="var(--primary)" weight={2.5} />
        <Point x={p.x} y={p.y} color="var(--primary)" />

        <Text x={p.x / 2} y={p.y} attach="s" attachDistance={10} size={18} color="var(--primary)">
          cos θ
        </Text>
        <Text x={p.x} y={p.y / 2} attach="w" attachDistance={10} size={18} color="var(--accent)">
          sin θ
        </Text>
      </Mafs>

      <div className="border-t border-border px-4 py-4 print:hidden">
        <ParamSlider
          label={t(lang, 'graph.angle')}
          valueText={t(lang, 'graph.degrees', { value: formatNumber(lang, theta, 0) })}
          min={DEG_MIN}
          max={DEG_MAX}
          step={DEG_STEP}
          value={theta}
          onChange={setTheta}
        />
      </div>

      <div
        className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-border bg-surface-2 px-4 py-3"
        aria-label={t(lang, 'graph.values')}
      >
        <span className="text-sm text-muted">
          {t(lang, 'graph.cos')} ={' '}
          <strong className="tabular-nums text-text">{formatNumber(lang, p.cos, 3)}</strong>
        </span>
        <span className="text-sm text-muted">
          {t(lang, 'graph.sin')} ={' '}
          <strong className="tabular-nums text-text">{formatNumber(lang, p.sin, 3)}</strong>
        </span>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium tabular-nums text-on-accent">
          {t(lang, 'graph.identity', {
            sum: formatNumber(lang, p.cos * p.cos + p.sin * p.sin, 3),
          })}
        </span>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {t(lang, 'graph.live.circle', {
          theta: formatNumber(lang, theta, 0),
          cos: formatNumber(lang, p.cos, 3),
          sin: formatNumber(lang, p.sin, 3),
        })}
      </span>
    </div>
  )
}