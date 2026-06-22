'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { FaqEntry } from '../data'
import styles from './Faq.module.scss'

type Props = {
  entry: FaqEntry
}

const PROMPT = '>'
const CHAR_INTERVAL = 28

export default function FaqItem({ entry }: Props) {
  const [open, setOpen] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [reduce, setReduce] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const panelId = useId()
  const triggerId = useId()

  const total = entry.lines.length
  const done = lineIndex >= total

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /** 開いたらタイプ開始、閉じたらリセット。reduced-motion 時は全文を即時表示。 */
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!open) {
      setLineIndex(0)
      setCharCount(0)
      return
    }

    if (reduce) {
      setLineIndex(total)
      setCharCount(0)
      return
    }

    setLineIndex(0)
    setCharCount(0)

    let line = 0
    let char = 0
    timerRef.current = setInterval(() => {
      const currentLine = entry.lines[line]
      if (currentLine === undefined) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        return
      }

      if (char < currentLine.length) {
        char += 1
        setCharCount(char)
      } else {
        line += 1
        char = 0
        setLineIndex(line)
        setCharCount(0)
      }
    }, CHAR_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [open, reduce, total, entry.lines])

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((prev) => !prev)
    }
  }

  return (
    <div className={styles.row}>
      <button
        type="button"
        id={triggerId}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span
          className={`${styles.badge} ${
            entry.level === 'error' ? styles.badgeError : styles.badgeWarn
          }`}
        >
          {entry.level === 'error' ? '[ERROR]' : '[WARN]'}
        </span>
        <span className={styles.triggerText}>{entry.label}</span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open && (
        <div className={styles.panel} id={panelId} role="region" aria-labelledby={triggerId}>
          <div className={styles.log}>
            {entry.lines.map((line, i) => {
              if (reduce) {
                return (
                  <p key={i} className={styles.logLine}>
                    <span className={styles.logPrompt}>{PROMPT}</span>
                    <span className={styles.logText}>{line}</span>
                  </p>
                )
              }

              if (i > lineIndex) return null

              const isTyping = i === lineIndex && !done
              const text = isTyping ? line.substring(0, charCount) : line

              return (
                <p key={i} className={styles.logLine}>
                  <span className={styles.logPrompt}>{PROMPT}</span>
                  <span className={styles.logText}>
                    {text}
                    {isTyping && <span className={styles.caret} aria-hidden />}
                  </span>
                </p>
              )
            })}

            {(reduce || done) && <p className={styles.logDone}>-- 対処完了 / DONE --</p>}
          </div>
        </div>
      )}
    </div>
  )
}
