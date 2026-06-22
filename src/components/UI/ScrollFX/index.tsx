'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * トップページのスクロール演出ドライバ（DOM は描画しない）。
 *
 * About / Skills / Works は Server Component のままにしたいので、各セクションには
 * data 属性だけを付け、その属性をページ全体から拾ってここでまとめて GSAP を適用する。
 *
 *  - data-reveal            … ビューポートに入ったら フェード＋わずかな上昇で出現
 *                             値 "fade" を指定すると透明度のみ（大きいブロック向け）
 *  - data-parallax          … スクロール連動の控えめなパララックス（装飾要素向け）
 *      data-parallax-speed  … 移動量(yPercent)。既定 14
 *      data-parallax-anchor … "top" でセクション上端基準（初期表示で見えている要素向け）
 *
 * reveal 完了後は inline transform を消すため、ホバー時の transform 等は壊さない。
 * prefers-reduced-motion 指定時はすべて無効化し、静止状態で表示する。
 */
export default function ScrollFX() {
  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    // ---- 出現（reveal） ----
    const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    const riseEls = reveals.filter((el) => el.dataset.reveal !== 'fade')
    const fadeEls = reveals.filter((el) => el.dataset.reveal === 'fade')

    if (riseEls.length > 0) {
      gsap.set(riseEls, { opacity: 0, y: 24, willChange: 'transform, opacity' })
      ScrollTrigger.batch(riseEls, {
        start: 'top 88%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.09,
            overwrite: 'auto',
            // hover 等の transform を壊さないよう、出現後は inline transform を消す
            clearProps: 'transform,willChange',
          }),
      })
    }

    if (fadeEls.length > 0) {
      gsap.set(fadeEls, { opacity: 0, willChange: 'opacity' })
      ScrollTrigger.batch(fadeEls, {
        start: 'top 90%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.08,
            overwrite: 'auto',
            clearProps: 'willChange',
          }),
      })
    }

    // ---- パララックス ----
    const parallaxEls = gsap.utils.toArray<HTMLElement>('[data-parallax]')
    parallaxEls.forEach((el) => {
      const amount = Number(el.dataset.parallaxSpeed ?? 14)
      const fromTop = el.dataset.parallaxAnchor === 'top'
      const trigger = el.closest('section') ?? el
      gsap.to(el, {
        yPercent: -amount,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: fromTop ? 'top top' : 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    // フォント確定後にトリガー位置を再計算（レイアウトシフト対策）
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
    }
  })

  return null
}
