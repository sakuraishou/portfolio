'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import Link from 'next/link'
import Title from '@/components/UI/Title'
import { PRODUCT } from '../data'
import styles from './Cover.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Cover() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      gsap.from(`.${styles.reveal}`, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15,
      })

      // スクロール時のパララックス（飾りのみ）
      const parallax = {
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      }
      gsap.to(`.${styles.bgWord}`, { yPercent: -30, ...parallax })
      gsap.to(`.${styles.photo}`, { yPercent: -20, ...parallax })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="cover" className={styles.cover}>
      <span className={styles.bgWord} aria-hidden>
        TORISETSU
      </span>

      <nav className={`wrap ${styles.crumb}`} aria-label="現在地">
        <Link href="/" className={styles.crumbLink}>
          <svg
            className={styles.crumbIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            focusable="false"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          ホーム
        </Link>
        <span className={styles.crumbSep} aria-hidden>
          /
        </span>
        <span className={styles.crumbHere} aria-current="page">
          取扱説明書
        </span>
      </nav>

      <div className={`wrap ${styles.inner}`}>
        <div className={styles.head}>
          <p className={`${styles.meta} ${styles.reveal}`}>
            <span>DOCUMENT</span>
            <span>Ver 3.0 — 2026</span>
          </p>

          <Title en="OWNER'S MANUAL" as="h1" className={`${styles.title} ${styles.reveal}`}>
            取扱説明書
          </Title>

          <p className={`${styles.product} ${styles.reveal}`}>
            <span className={styles.productJa}>{PRODUCT.nameJa}</span>
            <span className={styles.productEn}>{PRODUCT.nameEn}</span>
          </p>

          <p className={`${styles.model} ${styles.reveal}`}>型番 / MODEL：{PRODUCT.model}</p>
          <p className={`${styles.catch} ${styles.reveal}`}>{PRODUCT.catch}</p>
          <p className={`${styles.lead} ${styles.reveal}`}>{PRODUCT.lead}</p>
        </div>

        <figure className={`${styles.photo} ${styles.reveal}`}>
          <Image
            src="/assets/manual/human@2x.jpg"
            alt={PRODUCT.nameJa}
            fill
            sizes="(max-width: 767px) 26rem, 27rem"
            className={styles.photoImg}
          />
        </figure>
      </div>

      <a href="#features" className={styles.scrollCue} aria-label="本文へスクロール">
        <span className={styles.scrollText}>OPEN</span>
        <span className={styles.scrollLine} aria-hidden />
      </a>
    </section>
  )
}
