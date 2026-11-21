// Preset « right-triangle » : triangle rectangle avec les trois carrés de Pythagore.
// Curseurs a et b, affiche c, les aires a²/b²/c² et l'égalité a² + b² = c².
import { useState } from 'react'
import { Mafs, Coordinates, Line, Polygon, Text } from 'mafs'
import type { Lang } from '@/i18n/config'
import { t } from '@/i18n/index'
import { formatNumber, niceStep, polygonCenter, rightTriangleGeometry } from '@/lib/graph'
import ParamSlider from './ParamSlider'

const CANVAS_HEIGHT = 380
const SIDE_MIN = 1
const SIDE_MAX = 5
const STEP = 0.5
// Viewport couvrant le triangle et ses carrés pour a, b ≤ SIDE_MAX.
const VIEWBOX_X: [number, number] = [-5.5, 11]
const VIEWBOX_Y: [number, number] = [-5.5, 10.5]

export default function RightTriangle({ lang }: { lang: Lang }) {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const geo = rightTriangleGeometry(a, b)

  const a2 = a * a
  const b2 = b * b
  const c2 = geo.c * geo.c
  const centerA = polygonCenter(geo.squareA)
  const centerB = polygonCenter(geo.squareB)
  const centerC = polygonCenter(geo.squareC)

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

        {/* Les trois carrés : a² (primaire), b² (neutre), c² (accent — le résultat). */}
        <Polygon
          points={geo.squareA}
          color="var(--primary)"
          weight={1.5}
          fillOpacity={1}
          svgPolygonProps={{ style: { fill: 'var(--primary-soft)' } }}
        />
        <Polygon
          points={geo.squareB}
          color="var(--text)"
          weight={1.5}
          fillOpacity={1}
          svgPolygonProps={{ style: { fill: 'var(--surface-2)' } }}
        />
        <Polygon
          points={geo.squareC}
          color="var(--accent)"
          weight={1.5}
          fillOpacity={1}
          svgPolygonProps={{ style: { fill: 'var(--accent-soft)' } }}
        />

        {/* Triangle : cathètes neutres, hypoténuse en accent. */}
        <Line.Segment point1={geo.o} point2={geo.a} color="var(--text)" weight={2.5} />
        <Line.Segment point1={geo.o} point2={geo.b} color="var(--text)" weight={2.5} />
        <Line.Segment point1={geo.a} point2={geo.b} color="var(--accent)" weight={2.5} />

        {/* Étiquettes des côtés. */}
        <Text x={a / 2} y={0} attach="n" size={20} color="var(--text)">
          a
        </Text>
        <Text x={0} y={b / 2} attach="e" size={20} color="var(--text)">
          b
        </Text>
        <Text x={a / 2} y={b / 2} attach="ne" size={20} color="var(--accent)">
          c
        </Text>

        {/* Étiquettes des carrés. */}
        <Text
          x={centerA[0]}
          y={centerA[1]}
          size={16}
          color="var(--text)"
          svgTextProps={{ className: 'graph-label' }}
        >
          a²
        </Text>
        <Text
          x={centerB[0]}
          y={centerB[1]}
          size={16}
          color="var(--text)"
          svgTextProps={{ className: 'graph-label' }}
        >
          b²
        </Text>
        <Text
          x={centerC[0]}
          y={centerC[1]}
          size={16}
          color="var(--text)"
          svgTextProps={{ className: 'graph-label' }}
        >
          c²
        </Text>
      </Mafs>

      <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2 print:hidden">
        <ParamSlider
          label={t(lang, 'graph.sideA')}
          valueText={formatNumber(lang, a)}
          min={SIDE_MIN}
          max={SIDE_MAX}
          step={STEP}
          value={a}
          onChange={setA}
        />
        <ParamSlider
          label={t(lang, 'graph.sideB')}
          valueText={formatNumber(lang, b)}
          min={SIDE_MIN}
          max={SIDE_MAX}
          step={STEP}
          value={b}
          onChange={setB}
        />
      </div>

      <div
        className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-border bg-surface-2 px-4 py-3"
        aria-label={t(lang, 'graph.values')}
      >
        <span className="text-sm font-medium text-text">
          {t(lang, 'graph.hypotenuse')} <strong className="tabular-nums">{formatNumber(lang, geo.c)}</strong>
        </span>
        <span className="text-sm tabular-nums text-muted">
          a<sup>2</sup> = {formatNumber(lang, a2)}
        </span>
        <span className="text-sm tabular-nums text-muted">
          b<sup>2</sup> = {formatNumber(lang, b2)}
        </span>
        <span className="text-sm tabular-nums text-muted">
          c<sup>2</sup> = {formatNumber(lang, c2)}
        </span>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium tabular-nums text-on-accent">
          {t(lang, 'graph.areaEq', {
            x: formatNumber(lang, a2),
            y: formatNumber(lang, b2),
            z: formatNumber(lang, c2),
          })}
        </span>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {t(lang, 'graph.live.triangle', {
          a: formatNumber(lang, a),
          b: formatNumber(lang, b),
          c: formatNumber(lang, geo.c),
        })}
      </span>
    </div>
  )
}