'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SPEC_KEYNOTES, SPEC_BARS, SPEC_CHARGE } from '../data'
import type { SpecCharge } from '../data'
import styles from './Spec.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const DONUT_SIZE = 240
const DONUT_CENTER = DONUT_SIZE / 2
const DONUT_RADIUS = 90
const DONUT_STROKE = 36
const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

/** 各扇の dasharray（描画長）と回転角を計算する */
function buildArcs(items: SpecCharge[]) {
  let acc = 0
  return items.map((item) => {
    const length = (CIRCUMFERENCE * item.value) / 100
    // 12時始点・時計回りにするため -90deg からオフセット
    const rotation = -90 + (acc / 100) * 360
    acc += item.value
    return { ...item, length, rotation }
  })
}

export default function SpecDashboard() {
  const root = useRef<HTMLDivElement>(null)
  const arcs = buildArcs(SPEC_CHARGE)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const keynoteEls = gsap.utils.toArray<HTMLElement>(`.${styles.keynoteValue}`, container)
      const barFills = gsap.utils.toArray<HTMLElement>(`.${styles.barFill}`, container)
      const barValues = gsap.utils.toArray<HTMLElement>(`.${styles.barValue}`, container)
      const arcPaths = gsap.utils.toArray<SVGCircleElement>(`.${styles.donutArc}`, container)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const countTo = (
        el: HTMLElement,
        target: number,
        tl: gsap.core.Timeline,
        at: number | string,
      ) => {
        const counter = { value: 0 }
        tl.to(
          counter,
          {
            value: target,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value))
            },
          },
          at,
        )
      }

      if (reduce) {
        keynoteEls.forEach((el) => (el.textContent = el.dataset.val ?? '0'))
        barValues.forEach((el) => (el.textContent = el.dataset.val ?? '0'))
        barFills.forEach((el) => (el.style.width = `${el.dataset.val ?? 0}%`))
        arcPaths.forEach((el) => el.style.setProperty('stroke-dashoffset', '0'))
        return
      }

      keynoteEls.forEach((el) => (el.textContent = '0'))
      barValues.forEach((el) => (el.textContent = '0'))

      // (a) キーノート数字
      const keynoteTl = gsap.timeline({
        scrollTrigger: { trigger: `.${styles.keynotes}`, start: 'top 80%' },
      })
      keynoteEls.forEach((el, i) => {
        countTo(el, Number(el.dataset.val ?? 0), keynoteTl, i === 0 ? 0 : '<0.12')
      })

      // (b) 横棒バー
      const barsTl = gsap.timeline({
        scrollTrigger: { trigger: `.${styles.bars}`, start: 'top 82%' },
      })
      barFills.forEach((fill, i) => {
        const target = Number(fill.dataset.val ?? 0)
        barsTl.fromTo(
          fill,
          { width: '0%' },
          { width: `${target}%`, duration: 1.1, ease: 'power3.out' },
          i === 0 ? 0 : '<0.1',
        )
        if (barValues[i]) countTo(barValues[i], target, barsTl, '<')
      })

      // (c) ドーナツ円グラフ
      const donutTl = gsap.timeline({
        scrollTrigger: { trigger: `.${styles.donutWrap}`, start: 'top 82%' },
      })
      arcPaths.forEach((arc, i) => {
        donutTl.fromTo(
          arc,
          { strokeDashoffset: arc.dataset.len ?? 0 },
          { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' },
          i === 0 ? 0 : '<0.18',
        )
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className={styles.dashboard}>
      <ul className={styles.keynotes}>
        {SPEC_KEYNOTES.map((item) => (
          <li key={item.label} className={styles.keynote}>
            <span className={styles.keynoteNum}>
              <span className={styles.keynoteValue} data-val={item.value}>
                0
              </span>
              <span className={styles.keynoteSuffix}>{item.suffix}</span>
            </span>
            <span className={styles.keynoteLabel}>{item.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.lower}>
        <div className={styles.bars}>
          <p className={styles.blockCaption}>一緒に働くときのパラメータ</p>
          <ul className={styles.barList}>
            {SPEC_BARS.map((bar) => (
              <li key={bar.label} className={styles.barItem}>
                <span className={styles.barHead}>
                  <span className={styles.barLabel}>{bar.label}</span>
                  <span className={styles.barNum}>
                    <span className={styles.barValue} data-val={bar.value}>
                      0
                    </span>
                    <span className={styles.barUnit}>%</span>
                  </span>
                </span>
                <span className={styles.barTrack}>
                  <span className={styles.barFill} data-val={bar.value} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.donut}>
          <p className={styles.blockCaption}>1日の時間の使い方</p>
          <div className={styles.donutWrap}>
            <svg
              className={styles.donutSvg}
              viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              role="img"
              aria-label="1日の時間の使い方のドーナツ円グラフ"
            >
              <circle
                className={styles.donutBase}
                cx={DONUT_CENTER}
                cy={DONUT_CENTER}
                r={DONUT_RADIUS}
                strokeWidth={DONUT_STROKE}
              />
              {arcs.map((arc) => (
                <circle
                  key={arc.label}
                  className={styles.donutArc}
                  cx={DONUT_CENTER}
                  cy={DONUT_CENTER}
                  r={DONUT_RADIUS}
                  strokeWidth={DONUT_STROKE}
                  stroke={arc.color}
                  strokeDasharray={`${arc.length} ${CIRCUMFERENCE}`}
                  strokeDashoffset={arc.length}
                  data-len={arc.length}
                  transform={`rotate(${arc.rotation} ${DONUT_CENTER} ${DONUT_CENTER})`}
                />
              ))}
            </svg>
            <span className={styles.donutCenter}>
              <span className={styles.donutCenterNum}>24</span>
              <span className={styles.donutCenterUnit}>h / day</span>
            </span>
          </div>

          <ul className={styles.legend}>
            {SPEC_CHARGE.map((item) => (
              <li key={item.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendValue}>{item.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.note}>※自社調べ</p>
    </div>
  )
}
