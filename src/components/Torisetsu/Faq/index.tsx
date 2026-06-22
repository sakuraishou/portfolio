'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '@/components/Torisetsu/SectionHeader'
import FaqItem from './FaqItem'
import { FAQ_ENTRIES, FAQ_LEAD } from '../data'
import styles from './Faq.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Faq() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      gsap.from(`.${styles.console}`, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.console}`, start: 'top 82%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="troubleshooting" className={styles.faq}>
      <div className="wrap">
        <SectionHeader no="04" en="TROUBLESHOOTING">
          困ったときは
        </SectionHeader>

        <p className={styles.lead}>{FAQ_LEAD}</p>

        <div className={styles.console}>
          <div className={styles.consoleBar}>
            <span className={styles.consoleDots} aria-hidden>
              <span className={`${styles.consoleDot} ${styles.dotActive}`} />
              <span className={styles.consoleDot} />
              <span className={styles.consoleDot} />
            </span>
            <span className={styles.consoleTitle}>brain — console</span>
          </div>

          <div className={styles.list}>
            {FAQ_ENTRIES.map((entry) => (
              <FaqItem key={entry.label} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
