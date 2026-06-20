'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '@/components/Torisetsu/SectionHeader'
import { WARRANTY } from '../data'
import styles from './Warranty.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Warranty() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const card = container.querySelector<HTMLElement>(`.${styles.certificate}`)
      const reveals = gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`, container)
      const stamp = container.querySelector<HTMLElement>(`.${styles.stamp}`)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        if (stamp) gsap.set(stamp, { scale: 1, opacity: 1, rotate: -8 })
        return
      }

      if (stamp) gsap.set(stamp, { opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 75%' },
      })

      if (card) {
        tl.from(card, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out' })
      }

      tl.from(
        reveals,
        { y: 18, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
        '-=0.4',
      )

      if (stamp) {
        tl.fromTo(
          stamp,
          { scale: 1.6, rotate: 8, opacity: 0 },
          {
            scale: 1,
            rotate: -8,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(2.4)',
          },
          '-=0.1',
        )
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="warranty" className={styles.warranty}>
      <div className="wrap">
        <SectionHeader no="07" en="WARRANTY">
          保証について
        </SectionHeader>

        <div className={styles.certificate}>
          <div className={styles.frame}>
            <p className={`${styles.ribbon} ${styles.reveal}`}>{WARRANTY.ribbon}</p>

            <h3 className={`${styles.docTitle} ${styles.reveal}`}>{WARRANTY.title}</h3>

            <div className={styles.bodyText}>
              {WARRANTY.body.map((paragraph) => (
                <p key={paragraph} className={styles.reveal}>
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className={`${styles.details} ${styles.reveal}`}>
              {WARRANTY.details.map((detail) => (
                <div key={detail.label} className={styles.detailRow}>
                  <dt className={styles.detailLabel}>{detail.label}</dt>
                  <dd className={styles.detailValue}>{detail.value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.stampArea}>
              <span className={styles.stamp} aria-label={`保証印 ${WARRANTY.stampChar}`}>
                <svg viewBox="0 0 100 100" role="img" aria-hidden focusable="false">
                  <circle className={styles.stampRingOuter} cx="50" cy="50" r="46" />
                  <circle className={styles.stampRingInner} cx="50" cy="50" r="38" />
                  <text className={styles.stampChar} x="50" y="54" textAnchor="middle">
                    {WARRANTY.stampChar}
                  </text>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
