'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { HumanSpec } from '../data'
import styles from './Features.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const SIZE = 400
const CENTER = SIZE / 2
const RADIUS = 140
const LEVELS = 4
const LABEL_GAP = 28

type Props = {
  data: HumanSpec[]
}

/** index 番目の頂点座標（真上始点・時計回り） */
function vertex(index: number, total: number, radius: number) {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180)
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

function polygonPoints(radii: number[], total: number) {
  return radii
    .map((radius, index) => {
      const point = vertex(index, total, radius)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

export default function RadarChart({ data }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const total = data.length
  const gridLevels = Array.from({ length: LEVELS }, (_, i) => (RADIUS * (i + 1)) / LEVELS)
  const dataRadii = data.map((d) => (RADIUS * d.value) / 100)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const polygon = container.querySelector<SVGPolygonElement>(`.${styles.radarData}`)
      const dots = gsap.utils.toArray<SVGCircleElement>(`.${styles.radarDot}`, container)
      const valueEls = gsap.utils.toArray<HTMLElement>(`.${styles.specValue}`, container)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        valueEls.forEach((el) => (el.textContent = el.dataset.val ?? '0'))
        return
      }

      valueEls.forEach((el) => (el.textContent = '0'))

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 78%' },
      })

      if (polygon) {
        tl.from(polygon, {
          scale: 0,
          opacity: 0,
          svgOrigin: `${CENTER} ${CENTER}`,
          duration: 0.9,
          ease: 'back.out(1.7)',
        })
      }

      tl.from(dots, { scale: 0, transformOrigin: 'center', duration: 0.4, stagger: 0.06 }, '-=0.4')

      valueEls.forEach((el) => {
        const target = Number(el.dataset.val ?? 0)
        const counter = { value: 0 }
        tl.to(
          counter,
          {
            value: target,
            duration: 1,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value))
            },
          },
          '<',
        )
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className={styles.radarWrap}>
      <svg
        className={styles.radar}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="ヒューマンスペックのレーダーチャート"
      >
        {gridLevels.map((radius, i) => (
          <polygon
            key={i}
            className={styles.radarGrid}
            points={polygonPoints(Array<number>(total).fill(radius), total)}
          />
        ))}

        {data.map((_, i) => {
          const point = vertex(i, total, RADIUS)
          return (
            <line
              key={i}
              className={styles.radarAxis}
              x1={CENTER}
              y1={CENTER}
              x2={point.x}
              y2={point.y}
            />
          )
        })}

        <polygon className={styles.radarData} points={polygonPoints(dataRadii, total)} />

        {dataRadii.map((radius, i) => {
          const point = vertex(i, total, radius)
          return <circle key={i} className={styles.radarDot} cx={point.x} cy={point.y} r={4.5} />
        })}

        {data.map((d, i) => {
          const point = vertex(i, total, RADIUS + LABEL_GAP)
          return (
            <text
              key={d.label}
              className={styles.radarLabel}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          )
        })}
      </svg>

      <ul className={styles.specList}>
        {data.map((d) => (
          <li key={d.label} className={styles.specItem}>
            <span className={styles.specMain}>
              <span className={styles.specName}>{d.label}</span>
              <span className={styles.specDesc}>{d.desc}</span>
            </span>
            <span className={styles.specNum}>
              <span className={styles.specValue} data-val={d.value}>
                0
              </span>
              <span className={styles.specUnit}>%</span>
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.specNote}>※自社調べ（本人の体感です）</p>
    </div>
  )
}
