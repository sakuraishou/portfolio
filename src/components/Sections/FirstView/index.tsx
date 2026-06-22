'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import styles from './FirstView.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type SpecRow = {
  label: string
  value: string
  status?: boolean
}

const SPEC_ROWS: SpecRow[] = [
  { label: 'MODEL', value: 'Web Engineer' },
  { label: 'BASE', value: 'Tokyo, JP' },
  { label: 'CORE', value: 'WordPress' },
  { label: 'BUILDING', value: 'Next.js · Nuxt × Supabase' },
  { label: 'STATUS', value: 'Open to Work', status: true },
]

export default function FirstView() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
      tl.from(`.${styles.reveal}`, { y: 24, opacity: 0, stagger: 0.09, delay: 0.1 })
        .from(
          `.${styles.specRow}`,
          { x: -14, opacity: 0, duration: 0.5, stagger: 0.07 },
          '-=0.5',
        )
        .from(`.${styles.scrollCue}`, { y: 10, opacity: 0, duration: 0.6 }, '-=0.2')
    },
    { scope: root },
  )

  return (
    <section ref={root} className={styles.firstView}>
      <span className={styles.watermark} aria-hidden>
        No.001
      </span>
      <div className={styles.crops} aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>
          <span className={styles.eyebrowKey}>PRODUCT SHEET</span>
          <span className={styles.eyebrowSep} aria-hidden>
            /
          </span>
          <span className={styles.eyebrowName}>SHO SAKURAI</span>
          <span className={styles.eyebrowNo}>No.001</span>
        </p>

        <div className={styles.body}>
          <div className={styles.lead}>
            <h1 className={`${styles.title} ${styles.reveal}`}>
              <span className={styles.titleLine}>Code With</span>{' '}
              <span className={styles.titleAccent}>Heart.</span>
            </h1>
            <p className={`${styles.sub} ${styles.reveal}`}>
              あなたの「作りたい」に、一番近くで
              <br className="sp" />
              寄り添うエンジニア
            </p>
          </div>

          <dl className={styles.spec}>
            {SPEC_ROWS.map((row) => (
              <div key={row.label} className={styles.specRow}>
                <dt className={styles.specKey}>{row.label}</dt>
                <dd className={styles.specValue}>
                  {row.status ? (
                    <span className={styles.specStatus}>
                      <span className={styles.specDot} aria-hidden />
                      {row.value}
                    </span>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className={`${styles.footMeta} ${styles.reveal}`}>
          <span>Apparel → Director → Engineer</span>
          <span>v4.0 — 2026</span>
        </p>

        <a href="#about" className={styles.scrollCue} aria-label="Aboutセクションへスクロール">
          <span className={styles.scrollText}>SCROLL</span>
          <span className={styles.scrollLine} aria-hidden />
        </a>
      </div>
    </section>
  )
}
