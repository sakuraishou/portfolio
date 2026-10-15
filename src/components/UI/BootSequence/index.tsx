'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { scrambleCharsFor, scrambleDuration } from '@/components/UI/ScrollFX/scramble'
import { BOOT_AT_ATTR, BOOT_ATTR, BOOT_FAILSAFE_MS, releaseBoot } from './boot'
import styles from './BootSequence.module.scss'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin, SplitText)

type LogLine = {
  id: string
  key: string
  status: string
}

const LOG_LINES: LogLine[] = [
  { id: 'sheet', key: 'PRODUCT SHEET No.001', status: 'INIT' },
  { id: 'subject', key: 'SUBJECT  SHO SAKURAI', status: 'OK' },
  { id: 'frontend', key: 'LOAD  frontend', status: 'OK' },
  { id: 'backend', key: 'LOAD  backend', status: 'OK' },
  { id: 'heart', key: 'LOAD  heart', status: 'OK' },
  { id: 'system', key: 'SYSTEM', status: 'READY' },
]

/** 四隅のトンボ・コーナーの注記。パネルの上下 2 枚それぞれに描く */
const CORNER_META = [
  { id: 'tl', cls: 'metaTl', text: 'PRODUCT SHEET' },
  { id: 'tr', cls: 'metaTr', text: 'No.001 / BOOT' },
  { id: 'bl', cls: 'metaBl', text: 'v4.0 — 2026' },
  { id: 'br', cls: 'metaBr', text: 'TAP / KEY → SKIP' },
]
const CROP_ORIGINS = ['0% 0%', '100% 0%', '0% 100%', '100% 100%']

/** カウンターの桁リール（0〜9 と、桁上がり用の末尾の 0） */
const REEL = Array.from({ length: 11 }, (_, i) => ({ id: `n${i}`, n: i % 10 }))
const DIGITS = ['hundreds', 'tens', 'ones'] as const

/** ルーラーの目盛り（0〜100 を 10 刻み） */
const TICKS = Array.from({ length: 11 }, (_, i) => `t${i * 10}`)

/** フォント待ちの上限（ローディング自体の文字組みがずれないよう、少しだけ待つ） */
const FONT_WAIT_MS = 700
/** マウントがこれより遅れたら（開発時の初回コンパイル等）演出せずに素早く抜ける */
const LATE_MS = 3000
/** JS の保険: 何があってもこの時間で必ず抜ける */
const HARD_LIMIT_MS = 7000

/** Strict Mode の「アンマウント → 即再マウント」と、本当の離脱を見分けるためのタイマー */
let pendingFinish = 0

/** 値 v（0〜100）から各桁リールの位置（0〜10）を求める。下の桁が 9→0 に回る間だけ上の桁も回る */
function reelPositions(v: number): [number, number, number] {
  if (v >= 100) return [1, 10, 10]
  const ones = v % 10
  const carry = Math.max(0, ones - 9)
  const tens = Math.floor(v / 10) + carry
  const hundreds = v >= 99 ? v - 99 : 0
  return [hundreds, tens, ones]
}

function waitForFonts(): Promise<void> {
  const ready = document.fonts?.ready.then(() => undefined) ?? Promise.resolve()
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, FONT_WAIT_MS))
  return Promise.race([ready, timeout])
}

/** 上下に割れるパネル 1 枚分の中身（トンボ・コーナー注記・型番スタンプ） */
function Sheet() {
  return (
    <div className={styles.sheet}>
      <div className={styles.crops}>
        <span />
        <span />
        <span />
        <span />
      </div>
      {CORNER_META.map((meta) => (
        <span key={meta.id} className={`${styles.meta} ${styles[meta.cls]}`} data-meta>
          {meta.text}
        </span>
      ))}
      <div className={styles.stamp}>
        <p className={styles.stampNo} data-stamp>
          No.<span className={styles.stampNum}>001</span>
        </p>
        <p className={styles.stampCaption} data-stamp-caption>
          SHO SAKURAI — ENGINEER, TOKYO
        </p>
      </div>
    </div>
  )
}

/**
 * トップ初回だけのローディング（「仕様書 No.001 の起動シーケンス」）。
 *
 * 表示するかどうかは layout.tsx のインラインスクリプトが描画前に決め、
 * <html data-boot="play"> のときだけ CSS で表示される（詳細は ./boot.ts）。
 * 流れ: トンボ → ブートログのデコード ＋ 000→100 の桁リール ＋ 目盛りの進捗バー
 *  → 表示が畳まれ、Fraunces の No.001 が太さを変えながら締まる → 中央に罫線が走り、
 *  パネルが上下に割れて（裏のオレンジが追いかけて）FirstView が現れる。
 * タップ／クリック／キー入力／ホイールで締めの部分へスキップする。
 */
export default function BootSequence() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const html = document.documentElement
      const el = root.current
      const state = html.getAttribute(BOOT_ATTR)
      if (!el || (state !== 'play' && state !== 'run')) return
      window.clearTimeout(pendingFinish)

      let finished = false
      let hardLimit = 0
      const finish = () => {
        if (finished) return
        finished = true
        window.clearTimeout(hardLimit)
        removeSkip()
        html.removeAttribute(BOOT_ATTR)
        html.removeAttribute(BOOT_AT_ATTR)
        releaseBoot()
        // スクロールロック（スクロールバーの有無）で幅が変わる環境向けに位置を測り直す
        ScrollTrigger.refresh()
      }

      let removeSkip = () => {}

      // 開発時の初回コンパイル等でマウントが大幅に遅れたら、演出せずに素早く抜ける
      const bootAt = Number(html.getAttribute(BOOT_AT_ATTR) ?? 0)
      const elapsed = performance.now() - bootAt
      if (elapsed > BOOT_FAILSAFE_MS - 400) {
        finish()
        return
      }
      html.setAttribute(BOOT_ATTR, 'run')
      if (elapsed > LATE_MS) {
        gsap.to(el, { autoAlpha: 0, duration: 0.35, ease: 'power2.out', onComplete: finish })
        return
      }
      hardLimit = window.setTimeout(finish, HARD_LIMIT_MS)

      const q = gsap.utils.selector(el)
      let tl: gsap.core.Timeline | null = null

      // ---- スキップ（オーバーレイ自体は pointer-events: none。window で入力を拾う） ----
      const onSkip = contextSafe!(() => {
        removeSkip()
        if (!tl) {
          finish()
          return
        }
        const outro = tl.labels.outro ?? 0
        const exit = tl.labels.exit ?? 0
        if (tl.time() < outro) tl.seek('outro')
        if (tl.time() < exit) tl.timeScale(1.9)
      })
      const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
      skipEvents.forEach((type) => window.addEventListener(type, onSkip, { passive: true }))
      removeSkip = () =>
        skipEvents.forEach((type) => window.removeEventListener(type, onSkip))

      const play = contextSafe!(() => {
        const stamps = q('[data-stamp]')
        // 上下のパネルに 1 つずつある No.001 を、同じタイミングで動かす（割れ目で字がずれないように）
        const splits = stamps.map((stamp) => SplitText.create(stamp, { type: 'chars' }))
        const reels = q('[data-reel]')
        const fills = q(`.${styles.rulerFill}`)
        const counter = { v: 0 }
        const renderCounter = () => {
          const pos = reelPositions(counter.v)
          reels.forEach((reel, i) => {
            gsap.set(reel, { yPercent: (-(pos[i] ?? 0) * 100) / REEL.length })
          })
          gsap.set(fills, { scaleX: counter.v / 100 })
        }

        tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: finish })

        // 1. 待機カーソルを消し、四隅のトンボを角から引く・コーナー注記をデコード
        tl.set(q(`.${styles.cursor}`), { autoAlpha: 0 }, 0.05)
          .fromTo(
            q(`.${styles.crops} span`),
            { autoAlpha: 1, scale: 0 },
            {
              scale: 1,
              duration: 0.8,
              stagger: 0.05,
              transformOrigin: (i: number) => CROP_ORIGINS[i % 4] ?? '50% 50%',
            },
            0,
          )
        q('[data-meta]').forEach((meta) => {
          const text = meta.textContent ?? ''
          tl!
            .set(meta, { autoAlpha: 1 }, 0.1)
            .to(
              meta,
              {
                duration: scrambleDuration(text),
                ease: 'none',
                // 記号（— →）を含んでも英字ラベルなので、カナではなく英数字で崩す
                scrambleText: { text, chars: scrambleCharsFor('A'), speed: 0.5 },
              },
              0.1,
            )
        })

        // 2. 進捗：目盛りが立ち、000 → 100 を桁リールで回す（途中で一拍ためる）
        tl.set(q(`.${styles.stage}`), { autoAlpha: 1 }, 0.1)
          .fromTo(
            q(`.${styles.rulerTrack}`),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.7, transformOrigin: '0% 50%' },
            0.12,
          )
          .fromTo(
            q(`.${styles.rulerTick}`),
            { scaleY: 0 },
            { scaleY: 1, duration: 0.4, stagger: 0.025, transformOrigin: '50% 0%' },
            0.18,
          )
          .fromTo(
            q(`.${styles.counter}`),
            { autoAlpha: 0, filter: 'blur(10px)' },
            { autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
            0.1,
          )
          .to(
            counter,
            {
              keyframes: [
                { v: 42, duration: 0.45, ease: 'power2.out' },
                { v: 71, duration: 0.4, ease: 'power1.inOut' },
                { v: 100, duration: 0.45, ease: 'power3.inOut' },
              ],
              onUpdate: renderCounter,
              onComplete: renderCounter,
            },
            0.15,
          )

        // 3. ブートログ：行ごとに キー → 点線リーダー → ステータス の順でデコード
        q(`.${styles.logLine}`).forEach((line, i) => {
          const at = 0.12 + i * 0.18
          const keyEl = line.querySelector<HTMLElement>('[data-log-key]')
          const statusEl = line.querySelector<HTMLElement>('[data-log-status]')
          const leader = line.querySelector<HTMLElement>('[data-log-leader]')
          tl!.set(line, { autoAlpha: 1 }, at)
          if (keyEl) {
            const text = keyEl.textContent ?? ''
            tl!.to(
              keyEl,
              {
                duration: Math.min(0.4, scrambleDuration(text)),
                ease: 'none',
                scrambleText: { text, chars: scrambleCharsFor(text), speed: 0.7 },
              },
              at,
            )
          }
          if (leader) {
            tl!.fromTo(
              leader,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.3, ease: 'power2.inOut', transformOrigin: '0% 50%' },
              at + 0.12,
            )
          }
          if (statusEl) {
            const text = statusEl.textContent ?? ''
            tl!
              .set(statusEl, { autoAlpha: 1 }, at + 0.32)
              .to(
                statusEl,
                {
                  duration: 0.22,
                  ease: 'none',
                  scrambleText: { text, chars: scrambleCharsFor(text), speed: 1 },
                },
                at + 0.32,
              )
          }
        })

        // 4. 畳む：桁が上へ回り抜け、ログは右から切り取られ、目盛りは右へ縮む
        tl.addLabel('outro', 1.48)
          .to(
            reels,
            { yPercent: -100, duration: 0.3, stagger: 0.03, ease: 'expo.in' },
            'outro',
          )
          .to(
            q(`.${styles.counterUnit}, .${styles.counterLabel}`),
            { autoAlpha: 0, duration: 0.2, ease: 'power2.in' },
            'outro',
          )
          .to(
            q(`.${styles.logLine}`),
            {
              clipPath: 'inset(0% 0% 0% 100%)',
              duration: 0.35,
              stagger: 0.03,
              ease: 'power3.in',
            },
            'outro',
          )
          .to(
            q(`.${styles.ruler}`),
            { scaleX: 0, transformOrigin: '100% 50%', duration: 0.45, ease: 'expo.in' },
            'outro+=0.05',
          )

        // 5. 型番スタンプ：Fraunces の No.001 が、細く広い字間 → 太く詰まった字間へ締まる
        tl.set(stamps, { autoAlpha: 1 }, 'outro+=0.36')
          .fromTo(
            stamps,
            { fontVariationSettings: "'wght' 300", letterSpacing: '0.2em' },
            {
              keyframes: [
                { fontVariationSettings: "'wght' 700", letterSpacing: '-0.03em', duration: 0.55 },
                { fontVariationSettings: "'wght' 600", letterSpacing: '-0.01em', duration: 0.3 },
              ],
              ease: 'power3.out',
            },
            'outro+=0.36',
          )
          .fromTo(
            q('[data-stamp-caption]'),
            { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut' },
            'outro+=0.5',
          )

        splits.forEach((split) => {
          tl!.fromTo(
            split.chars,
            { autoAlpha: 0, filter: 'blur(14px)', scaleY: 1.5, transformOrigin: '50% 100%' },
            {
              autoAlpha: 1,
              filter: 'blur(0px)',
              scaleY: 1,
              duration: 0.7,
              stagger: { each: 0.045, from: 'center' },
            },
            'outro+=0.36',
          )
        })

        // 6. 中央に罫線が走り、パネルが上下に割れる（裏のオレンジが少し遅れて追う）
        tl.fromTo(
          q(`.${styles.seam}`),
          { autoAlpha: 1, scaleX: 0 },
          { scaleX: 1, duration: 0.35, ease: 'expo.inOut' },
          'outro+=0.62',
        )
          .addLabel('exit', 'outro+=0.92')
          .to(q(`.${styles.panelTop}`), { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, 'exit')
          .to(
            q(`.${styles.panelBottom}`),
            { yPercent: 100, duration: 0.8, ease: 'power3.inOut' },
            'exit',
          )
          .to(
            q(`.${styles.underTop}`),
            { yPercent: -100, duration: 0.7, ease: 'power3.inOut' },
            'exit+=0.1',
          )
          .to(
            q(`.${styles.underBottom}`),
            { yPercent: 100, duration: 0.7, ease: 'power3.inOut' },
            'exit+=0.1',
          )
          .to(q(`.${styles.seam}`), { autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 'exit+=0.1')
          // パネルが開き始めたら FirstView の起動シーケンスを走らせる
          .call(() => releaseBoot(), [], 'exit+=0.12')
      })

      let alive = true
      waitForFonts().then(() => {
        if (alive && !finished) play()
      })

      return () => {
        alive = false
        removeSkip()
        window.clearTimeout(hardLimit)
        // Strict Mode の再マウントならここで取り消される。本当の離脱なら必ずロックを外す
        pendingFinish = window.setTimeout(finish, 0)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className={styles.boot} aria-hidden>
      <div className={`${styles.under} ${styles.underTop}`} />
      <div className={`${styles.under} ${styles.underBottom}`} />
      <div className={`${styles.panel} ${styles.panelTop}`}>
        <Sheet />
      </div>
      <div className={`${styles.panel} ${styles.panelBottom}`}>
        <Sheet />
      </div>
      <span className={styles.seam} />

      <div className={styles.stage}>
        <ol className={styles.log}>
          {LOG_LINES.map((line) => (
            <li key={line.id} className={styles.logLine}>
              <span className={styles.logPrompt}>&gt;</span>
              <span className={styles.logKey} data-log-key>
                {line.key}
              </span>
              <span className={styles.logLeader} data-log-leader />
              <span className={styles.logStatus} data-log-status>
                {line.status}
              </span>
            </li>
          ))}
        </ol>

        <div className={styles.counter}>
          {DIGITS.map((digit) => (
            <span key={digit} className={styles.digit}>
              <span className={styles.reel} data-reel>
                {REEL.map((item) => (
                  <span key={item.id}>{item.n}</span>
                ))}
              </span>
            </span>
          ))}
          <span className={styles.counterUnit}>%</span>
          <span className={styles.counterLabel}>
            <span>LOADING</span>
            <span>SPEC SHEET</span>
          </span>
        </div>

        <div className={styles.ruler}>
          <span className={styles.rulerTrack} />
          <span className={styles.rulerFill} />
          <span className={styles.rulerTicks}>
            {TICKS.map((tick) => (
              <span key={tick} className={styles.rulerTick} />
            ))}
          </span>
        </div>
      </div>

      {/* JS が引き継ぐまでの待機表示（点滅カーソル） */}
      <span className={styles.cursor} />
    </div>
  )
}
