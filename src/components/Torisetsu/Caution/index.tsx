'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '@/components/Torisetsu/SectionHeader'
import { CAUTION } from '../data'
import styles from './Caution.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Caution() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`, container)
      const badges = gsap.utils.toArray<HTMLElement>(`.${styles.mark}`, container)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        gsap.set(rows, { opacity: 1, x: 0 })
        return
      }

      gsap.from(rows, {
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.18,
        scrollTrigger: { trigger: container, start: 'top 78%' },
      })

      gsap.to(badges, {
        scale: 1.12,
        duration: 0.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center',
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="caution" className={styles.caution}>
      <div className="wrap">
        <SectionHeader no="03" en="CAUTION">
          ご使用上の注意
        </SectionHeader>

        <div className={styles.body}>
          <aside className={styles.badge}>
            <span className={styles.badgeMark} aria-hidden>
              ⚠
            </span>
            <span className={styles.badgeText}>
              <span className={styles.badgeEn}>SAFETY NOTICE</span>
              <span className={styles.badgeJa}>安全上のご注意</span>
            </span>
            <span className={styles.badgeLead}>{CAUTION.intro}</span>
          </aside>

          <div className={styles.sheet}>
            <p className={styles.sheetHead}>必ずお守りください</p>

            <ul className={styles.notices}>
              {CAUTION.notices.map((notice) => (
                <li key={notice} className={styles.row}>
                  <span className={styles.mark} aria-hidden>
                    ⚠
                  </span>
                  <p className={styles.text}>{notice}</p>
                </li>
              ))}
            </ul>

            <figure className={styles.photo}>
              <span className={styles.photoLabel}>
                画像準備中
                <br />
                {CAUTION.photoNote}
              </span>
              <figcaption className={styles.photoCaption}>{CAUTION.photoCaption}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
