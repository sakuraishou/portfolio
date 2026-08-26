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
 *
 * セットアップは2フレーム遅らせて行う。詳細ページから「実績一覧へ」で戻ったときは
 * ブラウザのスクロール復元／#works へのジャンプが effect より先に走るため、
 * 復元前に判定すると画面内の要素まで opacity:0 で隠してしまい、
 * ユーザーがスクロールするまで何も表示されない（実際に起きた不具合）。
 * 復元完了後に判定し、その時点で画面内にある要素はアニメーションせず即時表示する。
 *
 * さらに Next 16 では復元がセットアップより後に走ることがあるため、
 * 「初回スクロールで半画面以上の位置ジャンプ」（＝復元・ハッシュジャンプ）を検知したら、
 * その時点で画面内に残っている非表示要素を出す保険も併用する（E2E で回帰確認）。
 */
export default function ScrollFX() {
  useGSAP((_context, contextSafe) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const setup = contextSafe!(() => {
      // ---- 出現（reveal） ----
      const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      // batch の start（top 88%）と同じ基準。ここより上にある要素は「もう見えている」扱い
      const threshold = window.innerHeight * 0.88
      const pending = reveals.filter((el) => el.getBoundingClientRect().top >= threshold)

      const riseEls = pending.filter((el) => el.dataset.reveal !== 'fade')
      const fadeEls = pending.filter((el) => el.dataset.reveal === 'fade')

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

    // 現在ハッシュが指す要素へ「即時」ジャンプする。
    // CSS の scroll-behavior: smooth をバイパスするため behavior: instant を明示する
    // （smooth だと Next 16 のスクロール復元 scrollTo に途中で潰される）。
    // すでに対象付近にいる場合は何もしない
    const jumpToHash = () => {
      const hash = window.location.hash
      if (!hash) return
      let target: Element | null = null
      try {
        target = document.querySelector(hash)
      } catch {
        return
      }
      if (target && Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 0.5) {
        target.scrollIntoView({ behavior: 'instant' })
      }
    }

    // 位置が飛んだ後に、画面内へ入ったのに opacity:0 のまま残っている要素を出す
    const revealHiddenInView = contextSafe!(() => {
      const threshold = window.innerHeight * 0.88
      const hidden = gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter(
          (el) =>
            Number(gsap.getProperty(el, 'opacity')) < 1 &&
            el.getBoundingClientRect().top < threshold,
        )
      if (hidden.length > 0) {
        gsap.to(hidden, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform,willChange',
        })
      }
    })

    // スクロール復元による大きな位置ジャンプ（半画面以上）を監視する保険。
    // once は使わない（復元前の小さな scroll イベントで消費されてしまうため）。
    // 一度ジャンプを処理するか、5秒経ったら外す
    let y0 = 0
    let jumpTimer = 0
    const onScroll = () => {
      if (Math.abs(window.scrollY - y0) < window.innerHeight * 0.5) {
        y0 = Math.abs(window.scrollY - y0) < 4 ? y0 : window.scrollY
        return
      }
      revealHiddenInView()
      window.removeEventListener('scroll', onScroll)
    }
    const removeScrollWatch = () => window.removeEventListener('scroll', onScroll)

    // スクロール復元・ハッシュジャンプが済むのを待ってから判定する
    let raf2 = 0
    let lateFix = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        jumpToHash()
        setup()
        y0 = window.scrollY
        window.addEventListener('scroll', onScroll, { passive: true })
        jumpTimer = window.setTimeout(removeScrollWatch, 5000)
        // Next 16 のスクロール復元（scrollTo の連打）はこの直後に走り、
        // ハッシュ位置から先頭へ引き戻されることがある。落ち着いた頃に一度だけ再補正する
        lateFix = window.setTimeout(() => {
          jumpToHash()
          revealHiddenInView()
        }, 250)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(lateFix)
      window.clearTimeout(jumpTimer)
      removeScrollWatch()
    }
  })

  return null
}
