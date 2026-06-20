'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeader from '@/components/Torisetsu/SectionHeader'
import { USAGE_STEPS, USAGE_QUOTES } from '../data'
import styles from './Usage.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Usage() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const container = root.current
      if (!container) return

      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`, container)
      const lines = gsap.utils.toArray<HTMLElement>(`.${styles.line}`, container)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        gsap.set(steps, { opacity: 1, y: 0 })
        gsap.set(lines, { scaleX: 1, scaleY: 1 })
        return
      }

      gsap.set(steps, { opacity: 0, y: 28 })
      gsap.set(lines, { scaleX: 0, scaleY: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: 'top 72%' },
      })

      steps.forEach((step, i) => {
        tl.to(step, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
        const line = lines[i]
        if (line) {
          tl.to(line, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'power2.inOut' }, '-=0.1')
        }
      })

      gsap.from(`.${styles.quoteItem}`, {
        y: 16,
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: 'back.out(1.8)',
        stagger: 0.08,
        scrollTrigger: { trigger: `.${styles.quotes}`, start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="usage" className={styles.usage}>
      <div className="wrap">
        <SectionHeader no="02" en="HOW TO USE">
          ご使用方法
        </SectionHeader>

        <ol className={styles.flow}>
          {USAGE_STEPS.map((step, i) => (
            <li key={step.no} className={styles.node}>
              <div className={styles.step}>
                <span className={styles.stepNo} aria-hidden>
                  <span className={styles.stepNoLabel}>STEP</span>
                  <span className={styles.stepNoNum}>{step.no}</span>
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>

              {i < USAGE_STEPS.length - 1 && (
                <span className={styles.connector} aria-hidden>
                  <span className={styles.line} />
                  <span className={styles.arrow} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className={styles.quotes}>
          <span className={styles.quotesLabel}>口ぐせ</span>
          <ul className={styles.quoteList}>
            {USAGE_QUOTES.map((quote) => (
              <li key={quote} className={styles.quoteItem}>
                {quote}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
