'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrambleCharsFor, scrambleDuration } from './scramble'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin)

/**
 * トップページのスクロール演出ドライバ（DOM は描画しない）。
 *
 * About / Skills / Works は Server Component のままにしたいので、各セクションには
 * data 属性だけを付け、その属性をページ全体から拾ってここでまとめて GSAP を適用する。
 *
 *  - data-reveal            … ビューポートに入ったら出現。値で動きを選ぶ（REVEAL_VARIANTS 参照）
 *                             値なし＝ピントが合う / "fade"＝透明度のみ / "flip"＝タイルが裏返る /
 *                             "mask"＝横から切り抜くように開く
 *  - data-title-*           … UI/Title（no 指定版）の見出し。罫線 → 連番デコード → 帯が走って文字が出る
 *  - data-parallax          … スクロール連動の控えめなパララックス（装飾要素向け）
 *      data-parallax-speed  … 移動量(yPercent)。既定 14
 *      data-parallax-anchor … "top" でセクション上端基準（初期表示で見えている要素向け）
 *  - data-scramble          … ビューポートに入ったら、記号から本来の文字へデコードする
 *                             （中身がテキストだけの要素に付ける。子要素があると消える）
 *  - data-depth             … Works のデバイス表示。スクロールに合わせて PC 枠が奥から起き上がり、
 *                             スマホが逆方向に流れて奥行きを出す。枠内の画像は上→下へ送る
 *      data-depth-pc / data-depth-sp … 動かす PC 枠・スマホ枠
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
type RevealVariant = 'focus' | 'fade' | 'flip' | 'mask'

type RevealSpec = {
  from: gsap.TweenVars
  to: gsap.TweenVars
  start: string
  /** 出現後に消す inline style（clearProps） */
  clear: string
}

/**
 * data-reveal の値ごとの出現のしかた。どれも「下から上がる」だけにはしない。
 *  - （値なし）focus … ピントが合うように、ぼかしと僅かな拡大が戻る
 *  - fade           … 透明度のみ（大きいブロック向け）
 *  - flip           … タイルが横に回転して裏返る（グリッドの項目向け）
 *  - mask           … 横から切り抜くように開く（写真向け。中の画像は寄りから落ち着く）
 */
const REVEAL_VARIANTS: Record<RevealVariant, RevealSpec> = {
  focus: {
    from: { opacity: 0, scale: 0.965, filter: 'blur(10px)' },
    to: { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: 0.08 },
    start: 'top 88%',
    clear: 'transform,filter',
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08 },
    start: 'top 90%',
    clear: 'opacity',
  },
  flip: {
    from: { opacity: 0, rotationY: -80, transformPerspective: 900, transformOrigin: '0% 50%' },
    to: { opacity: 1, rotationY: 0, duration: 1, ease: 'power3.out', stagger: 0.05 },
    start: 'top 92%',
    clear: 'transform',
  },
  mask: {
    from: { clipPath: 'inset(0% 0% 0% 100%)' },
    to: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
    start: 'top 85%',
    clear: 'clipPath',
  },
}

function toVariant(value: string | undefined): RevealVariant {
  return value === 'fade' || value === 'flip' || value === 'mask' ? value : 'focus'
}

export default function ScrollFX() {
  useGSAP((_context, contextSafe) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const setup = contextSafe!(() => {
      // ---- 出現（reveal） ----
      // batch の start（top 88%）と同じ基準。ここより上にある要素は「もう見えている」扱い
      const threshold = window.innerHeight * 0.88
      const isAlreadyVisible = (el: Element) => el.getBoundingClientRect().top < threshold
      const pending = gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter((el) => !isAlreadyVisible(el))

      ;(Object.keys(REVEAL_VARIANTS) as RevealVariant[]).forEach((variant) => {
        const els = pending.filter((el) => toVariant(el.dataset.reveal) === variant)
        if (els.length === 0) return
        const { from, to, start, clear } = REVEAL_VARIANTS[variant]
        gsap.set(els, { ...from, willChange: 'transform, opacity, filter' })
        ScrollTrigger.batch(els, {
          start,
          onEnter: (batch) => {
            gsap.to(batch, {
              ...to,
              overwrite: 'auto',
              // hover 等の transform を壊さないよう、出現後は inline の transform 等を消す
              clearProps: `${clear},willChange`,
            })
            // mask：枠が開くのに合わせ、中の画像が少し寄った状態から落ち着く
            if (variant === 'mask') {
              batch.forEach((el) => {
                const img = el.querySelector('img')
                if (img) {
                  gsap.fromTo(
                    img,
                    { scale: 1.25 },
                    { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform' },
                  )
                }
              })
            }
          },
        })
      })

      // ---- セクション見出し（UI/Title の no 指定版） ----
      // 罫線が伸びる → 連番ラベルがデコード → アクセント色の帯が走り抜けて、見出しの文字が現れる
      gsap.utils.toArray<HTMLElement>('[data-title-head]').forEach((head) => {
        if (isAlreadyVisible(head)) return
        const eyebrow = head.querySelector<HTMLElement>('[data-title-eyebrow]')
        const line = head.querySelector<HTMLElement>('[data-title-line]')
        const label = head.querySelector<HTMLElement>('[data-title-label]')
        const text = head.querySelector<HTMLElement>('[data-title-text]')
        const bar = head.querySelector<HTMLElement>('[data-title-bar]')
        if (!eyebrow || !text || !bar) return

        gsap.set([eyebrow, text], { opacity: 0 })
        const labelText = label?.textContent?.trim() ?? ''
        const tl = gsap.timeline({ paused: true })
        tl.set(eyebrow, { opacity: 1 })
        if (line) {
          tl.fromTo(
            line,
            { scaleX: 0, transformOrigin: '0% 50%' },
            { scaleX: 1, duration: 0.7, ease: 'expo.out', clearProps: 'transform' },
            0,
          )
        }
        if (label && labelText) {
          tl.to(
            label,
            {
              duration: scrambleDuration(labelText),
              ease: 'none',
              scrambleText: { text: labelText, chars: scrambleCharsFor(labelText), speed: 0.6 },
            },
            0.1,
          )
        }
        tl.fromTo(
          bar,
          { scaleX: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, duration: 0.5, ease: 'expo.inOut' },
          0.2,
        )
          .set(text, { opacity: 1 })
          .set(bar, { transformOrigin: '100% 50%' })
          .to(bar, { scaleX: 0, duration: 0.55, ease: 'expo.inOut' })
          // 終わったら CSS の初期状態（幅 0）に戻す
          .set(bar, { clearProps: 'transform,transformOrigin' })

        ScrollTrigger.create({ trigger: head, start: 'top 88%', once: true, onEnter: () => tl.play() })
      })

      // ---- スクランブル（記号 → 本来の文字へデコード） ----
      // すでに画面内にある要素は、復元直後に文字が乱れて見えないよう演出しない
      gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
        const text = el.textContent?.trim() ?? ''
        if (!text || el.getBoundingClientRect().top < threshold) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(el, {
              duration: scrambleDuration(text),
              ease: 'none',
              scrambleText: { text, chars: scrambleCharsFor(text), speed: 0.6, revealDelay: 0.2 },
            }),
        })
      })

      // ---- 奥行き（Works のデバイス表示） ----
      // 1枚のタイムラインを「画面下端に入る → 画面上端から出る」までスクロールに同期させる
      // SP は文字がデバイス表示の真下に来る（静止状態でもスマホ枠と文字がほぼ接している）。
      // 下方向へ動かすと文字に重なるため、SP では起き上がり・回転を弱め、上方向にだけ流す
      const isSp = window.matchMedia('(max-width: 767px)').matches
      gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((el) => {
        const pc = el.querySelector<HTMLElement>('[data-depth-pc]')
        const sp = el.querySelector<HTMLElement>('[data-depth-sp]')
        const shots = el.querySelectorAll<HTMLImageElement>('img')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        })
        if (pc) {
          tl.fromTo(
            pc,
            {
              rotateX: isSp ? 10 : 18,
              y: isSp ? 0 : 56,
              scale: isSp ? 0.96 : 0.92,
              transformPerspective: 1200,
              transformOrigin: '50% 100%',
            },
            { rotateX: 0, y: 0, scale: 1, ease: 'power2.out', duration: 0.5 },
            0,
          ).to(pc, { y: isSp ? -10 : -28, ease: 'none', duration: 0.5 }, 0.5)
        }
        if (sp) {
          // CSS の translateY(-50%)（上下中央寄せ）を yPercent で引き継いだまま y だけ動かす
          gsap.set(sp, { yPercent: -50 })
          tl.fromTo(
            sp,
            { y: isSp ? 0 : 110, rotate: isSp ? 2 : 5 },
            { y: isSp ? -28 : -36, rotate: isSp ? -1 : -2, ease: 'none', duration: 1 },
            0,
          )
        }
        // 枠より縦長のスクリーンショットは、スクロールに合わせて上から下へ送る
        if (shots.length > 0) {
          tl.fromTo(
            shots,
            { objectPosition: '50% 0%' },
            { objectPosition: '50% 100%', ease: 'none', duration: 1 },
            0,
          )
        }
      })

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
        .toArray<HTMLElement>('[data-reveal], [data-title-eyebrow], [data-title-text]')
        .filter(
          (el) =>
            Number(gsap.getProperty(el, 'opacity')) < 1 &&
            el.getBoundingClientRect().top < threshold,
        )
      if (hidden.length > 0) {
        // 位置・ぼかし・切り抜きはすぐに消し、透明度だけを短く戻す。
        // （まとめて tween すると、後から来た通常の出現 tween に上書きされて
        //   clearProps が走らず、inline の clip-path 等が残ることがあった）
        gsap.set(hidden, { clearProps: 'transform,filter,clipPath,willChange' })
        gsap.to(hidden, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'opacity',
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

    // Works の絞り込み（#works の data-filter を FilterTabs が書き換える）を監視する。
    // 表示が切り替わるとカードの位置が大きく動くが、ScrollTrigger は古い位置のままなので、
    // それまで display:none だった（または下の方にあった）カードが opacity:0 のまま残る
    // （実際に起きた不具合）。切り替わったらトリガー位置を測り直し、画面内のものは確実に出す
    let filterRaf = 0
    let filterFix = 0
    const onFilterChange = () => {
      cancelAnimationFrame(filterRaf)
      window.clearTimeout(filterFix)
      filterRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        // refresh で通過済みになったトリガーは onEnter が走って通常どおり出現する。
        // 出現 tween（fade 0.9 秒）が終わる頃に、取り残しがあれば出す
        filterFix = window.setTimeout(revealHiddenInView, 1000)
      })
    }
    const filterObserver = new MutationObserver(onFilterChange)
    document.querySelectorAll('[data-filter]').forEach((el) => {
      filterObserver.observe(el, { attributes: true, attributeFilter: ['data-filter'] })
    })

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
      filterObserver.disconnect()
      cancelAnimationFrame(filterRaf)
      window.clearTimeout(filterFix)
    }
  })

  return null
}
