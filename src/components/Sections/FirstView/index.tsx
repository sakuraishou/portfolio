'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { scrambleCharsFor, scrambleDuration } from '@/components/UI/ScrollFX/scramble'
import { FX_READY_ATTR, waitForBoot } from '@/components/UI/BootSequence/boot'
import styles from './FirstView.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, SplitText)

type SpecRow = {
  label: string
  value: string
  status?: boolean
}

const SPEC_ROWS: SpecRow[] = [
  { label: 'MODEL', value: 'Web / Product Engineer' },
  { label: 'BASE', value: 'Tokyo, JP' },
  { label: 'CORE', value: 'Frontend · Web Application' },
  { label: 'BUILDING', value: 'Next.js · Nuxt · TypeScript' },
  { label: 'STATUS', value: 'Open to Work', status: true },
]

/** 四隅のトンボを、それぞれの角を起点に描き出す */
const CROP_ORIGINS = ['0% 0%', '100% 0%', '0% 100%', '100% 100%']

/** Web フォントの読み込みを待つ上限。これを過ぎたら待たずに始める（文字の分割位置がずれないよう待つ） */
const FONT_WAIT_MS = 1200

function waitForFonts(): Promise<void> {
  const ready = document.fonts?.ready.then(() => undefined) ?? Promise.resolve()
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, FONT_WAIT_MS))
  return Promise.race([ready, timeout])
}

export default function FirstView() {
  const root = useRef<HTMLElement>(null)

  /**
   * 起動シーケンス:「仕様書が立ち上がる」流れを 1 本のタイムラインで組む。
   *  トンボが引かれる → 型番ヘッダーがデコード → 見出しが 1 文字ずつせり上がる
   *  → スペックカードが開いてスキャンが走る → 各行の罫線が伸び、値がデコードされる → 経歴行・誘導
   * PC（マウス操作）ではスペックカードと透かしが、カーソルにわずかに追従して奥行きを出す。
   */
  useGSAP(
    (_context, contextSafe) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const el = root.current
      if (reduce || !el) return

      const q = gsap.utils.selector(el)
      const [title] = q(`.${styles.title}`)
      const [sub] = q(`.${styles.sub}`)
      const [spec] = q(`.${styles.spec}`)
      const [scan] = q(`.${styles.specScan}`)
      const [watermark] = q(`.${styles.watermark}`)

      // フォント待ちの間に完成形が一瞬見えないよう、先に隠しておく。
      // 描画前は CSS（html[data-fx]）が同じ要素を隠しているので、inline で隠し終えたら
      // section に印を付けて CSS 側の非表示を外す（以降は GSAP だけが表示を握る）
      gsap.set(
        [
          title,
          sub,
          spec,
          watermark,
          ...q(`.${styles.crops} span`),
          ...q(`.${styles.eyebrow}`),
          ...q(`.${styles.footMeta}`),
          ...q(`.${styles.scrollCue}`),
        ].filter(Boolean),
        { autoAlpha: 0 },
      )
      el.setAttribute(FX_READY_ATTR, '')

      const play = contextSafe!(() => {
        const split = SplitText.create(title, { type: 'words,chars' })
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        // 1. トンボ・透かし
        // （先に autoAlpha:0 で隠してあるので、from ではなく終点を明示した fromTo で出す）
        tl.fromTo(
          q(`.${styles.crops} span`),
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1,
            stagger: 0.07,
            transformOrigin: (i: number) => CROP_ORIGINS[i] ?? '50% 50%',
            clearProps: 'transform,transformOrigin',
          },
        )
        if (watermark) {
          tl.fromTo(
            watermark,
            { autoAlpha: 0, scale: 1.12 },
            { autoAlpha: 1, scale: 1, duration: 2.4, ease: 'power2.out' },
            0,
          )
        }

        // 2. 型番ヘッダー（PRODUCT SHEET / SHO SAKURAI / No.001）をデコード
        tl.to(q(`.${styles.eyebrow}`), { autoAlpha: 1, duration: 0.3 }, 0.15)
        q(`.${styles.eyebrow} > span`).forEach((part, i) => {
          const text = part.textContent ?? ''
          if (!text.trim() || text.trim() === '/') return
          tl.to(
            part,
            {
              duration: scrambleDuration(text),
              ease: 'none',
              scrambleText: { text, chars: scrambleCharsFor(text), speed: 0.5 },
            },
            0.2 + i * 0.08,
          )
        })

        // 3. 見出し：1 文字ずつ奥から起き上がる（X 軸回転）。同時に見出し全体の
        //    太さ（可変フォントの wght）が細→太へ、字間が広→詰めへ締まっていく。
        //    最後に「Heart.」だけ太さが一拍脈打つ
        const accentChars = split.chars.filter((c) => c.closest(`.${styles.titleAccent}`))
        tl.set(title, { autoAlpha: 1 }, 0.35)
          .from(
            split.chars,
            {
              autoAlpha: 0,
              rotationX: -100,
              transformPerspective: 700,
              transformOrigin: '50% 100% -0.3em',
              duration: 1.4,
              stagger: 0.04,
            },
            0.35,
          )
          .fromTo(
            title,
            { fontVariationSettings: "'wght' 300", letterSpacing: '0.06em' },
            {
              fontVariationSettings: "'wght' 600",
              letterSpacing: '-0.01em',
              duration: 1.9,
              ease: 'power3.out',
              clearProps: 'fontVariationSettings,letterSpacing',
            },
            0.35,
          )
        if (accentChars.length > 0) {
          tl.to(
            accentChars,
            {
              keyframes: [
                { fontVariationSettings: "'wght' 700", scale: 1.06, duration: 0.22, ease: 'power2.out' },
                { fontVariationSettings: "'wght' 600", scale: 1, duration: 0.6, ease: 'power3.inOut' },
              ],
              stagger: 0.05,
              transformOrigin: '50% 80%',
              clearProps: 'fontVariationSettings,transform',
            },
            1.55,
          )
        }

        // 4. サブコピー：ぼかしが晴れるように
        tl.fromTo(
          sub,
          { autoAlpha: 0, y: 18, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
          0.85,
        )

        // 5. スペックカード：上から開く → スキャンが走る → 行の罫線が伸びる → 値がデコード
        tl.fromTo(
          spec,
          { autoAlpha: 1, clipPath: 'inset(0% 0% 100% 0% round 1rem)' },
          { clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: 0.9, ease: 'power4.inOut' },
          0.55,
        )
        if (scan) {
          tl.fromTo(
            scan,
            { y: 0, autoAlpha: 1 },
            { y: () => spec.offsetHeight, duration: 1.1, ease: 'power2.inOut' },
            0.75,
          ).to(scan, { autoAlpha: 0, duration: 0.25 }, '>-0.15')
        }
        const rows = q(`.${styles.specRow}`)
        tl.from(
          rows,
          { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.7, stagger: 0.09, ease: 'power3.inOut' },
          0.85,
        )
        q(`.${styles.specText}`).forEach((valueEl, i) => {
          const text = valueEl.textContent ?? ''
          tl.to(
            valueEl,
            {
              duration: scrambleDuration(text),
              ease: 'none',
              scrambleText: { text, chars: scrambleCharsFor(text), speed: 0.6, revealDelay: 0.15 },
            },
            1.0 + i * 0.09,
          )
        })

        // 6. 経歴行（上の罫線ごと左から引かれる）・スクロール誘導
        tl.fromTo(
          q(`.${styles.footMeta}`),
          { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' },
          1.25,
        ).fromTo(
          q(`.${styles.scrollCue}`),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          1.8,
        )
      })

      // フォント待ちの間にページを離れたら始めない。
      // 初回ローディング（BootSequence）が出ているときは、パネルが割れ始めるまで待つ
      let alive = true
      Promise.all([waitForFonts(), waitForBoot()]).then(() => {
        if (alive) play()
      })

      // 背面の巨大透かしを、中央寄せ(translate(-50%,-50%))を保ったまま控えめにパララックス
      if (watermark) {
        gsap.set(watermark, { xPercent: -50, yPercent: -50 })
        gsap.to(watermark, {
          y: 110,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // PC（マウス操作）だけ：スペックカードと透かしがカーソルにわずかに追従する
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      let removePointer = () => {}
      if (finePointer && spec) {
        gsap.set(spec, { transformPerspective: 900 })
        const tiltX = gsap.quickTo(spec, 'rotationX', { duration: 0.9, ease: 'power3' })
        const tiltY = gsap.quickTo(spec, 'rotationY', { duration: 0.9, ease: 'power3' })
        const driftX = watermark
          ? gsap.quickTo(watermark, 'x', { duration: 1.6, ease: 'power3' })
          : null
        const onMove = contextSafe!((e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          tiltY(nx * 9)
          tiltX(-ny * 7)
          driftX?.(nx * -48)
        })
        const onLeave = contextSafe!(() => {
          tiltX(0)
          tiltY(0)
          driftX?.(0)
        })
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        removePointer = () => {
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
        }
      }

      return () => {
        alive = false
        removePointer()
      }
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

          <div className={styles.spec}>
            {/* 起動時に上から下へ走るスキャンライン（装飾） */}
            <span className={styles.specScan} aria-hidden />
            <dl className={styles.specList}>
              {SPEC_ROWS.map((row) => (
                <div key={row.label} className={styles.specRow}>
                  <dt className={styles.specKey}>{row.label}</dt>
                  <dd className={styles.specValue}>
                    {row.status ? (
                      <span className={styles.specStatus}>
                        <span className={styles.specDot} aria-hidden />
                        <span className={styles.specText}>{row.value}</span>
                      </span>
                    ) : (
                      <span className={styles.specText}>{row.value}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
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
