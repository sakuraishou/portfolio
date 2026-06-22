'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import styles from './SectionHeader.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Props = {
  no: string
  en: string
  children: React.ReactNode
}

export default function SectionHeader({ no, en, children }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const ghost = container.querySelector(`.${styles.ghost}`)
      const noEl = container.querySelector(`.${styles.no}`)

      if (ghost) {
        gsap.fromTo(
          ghost,
          { yPercent: 38 },
          {
            yPercent: -38,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
      if (noEl) {
        gsap.fromTo(
          noEl,
          { yPercent: 18 },
          {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className={styles.header}>
      <span className={styles.ghostClip} aria-hidden>
        <span className={styles.ghost}>{en}</span>
      </span>
      <span className={styles.no}>{no}</span>
      <span className={styles.divider} aria-hidden />
      <span className={styles.texts}>
        <span className={styles.en}>{en}</span>
        <h2 className={styles.ja}>{children}</h2>
      </span>
    </div>
  )
}
