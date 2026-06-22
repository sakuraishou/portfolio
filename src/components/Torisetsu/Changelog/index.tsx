'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '@/components/Torisetsu/SectionHeader'
import { CHANGELOG_RELEASES } from '../data'
import styles from './Changelog.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Changelog() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const line = container.querySelector<HTMLElement>(`.${styles.line}`)
      const items = gsap.utils.toArray<HTMLElement>(`.${styles.entry}`, container)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        if (line) gsap.set(line, { scaleY: 1 })
        gsap.set(items, { opacity: 1, x: 0 })
        return
      }

      gsap.set(items, { opacity: 0, x: -24 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 75%' },
      })

      if (line) {
        tl.from(line, {
          scaleY: 0,
          transformOrigin: 'top center',
          duration: 0.9,
          ease: 'power2.out',
        })
      }

      tl.to(items, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.18 }, '-=0.5')
    },
    { scope: root },
  )

  return (
    <section ref={root} id="changelog" className={styles.changelog}>
      <div className="wrap">
        <SectionHeader no="06" en="CHANGELOG">
          改訂履歴
        </SectionHeader>

        <ol className={styles.timeline}>
          <span className={styles.line} aria-hidden />
          {CHANGELOG_RELEASES.map((release) => (
            <li
              key={release.version}
              className={`${styles.entry} ${release.current ? styles.entryCurrent : ''}`}
            >
              <span className={styles.node} aria-hidden />
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.version}>{release.version}</span>
                  <span className={styles.badge}>{release.badge}</span>
                  {release.current && <span className={styles.now}>現在</span>}
                </div>
                <h3 className={styles.entryTitle}>{release.title}</h3>
                <p className={styles.entryBody}>{release.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
