'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  SyntheticEvent,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import styles from './Skills.module.scss'

const LEARNING_ICON_SRC = '/assets/skills/learning.svg'

export type SkillListItemProps = {
  iconUrl: string | null
  iconAlt: string
  isStudying: boolean
  name: string
  description: string | null | undefined
}

export default function SkillListItem({
  iconUrl,
  iconAlt,
  isStudying,
  name,
  description,
}: SkillListItemProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const dialogId = useId()
  const dialogTitleId = useId()

  const closeModal = useCallback(() => setModalOpen(false), [])

  /** SP では overlay の click が効かない端末があるため pointerdown も使う（白いパネル以外＝暗い部分のみ） */
  const handleBackdropDismiss = useCallback(
    (e: SyntheticEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      e.preventDefault()
      closeModal()
    },
    [closeModal],
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modalOpen, closeModal])

  const hasDescription = Boolean(description?.trim())

  const openModalIfSp = useCallback(
    (_e: MouseEvent<HTMLLIElement>) => {
      if (!hasDescription || !isNarrow) return
      setModalOpen(true)
    },
    [hasDescription, isNarrow],
  )

  const onRowKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLLIElement>) => {
      if (!hasDescription || !isNarrow) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setModalOpen(true)
      }
    },
    [hasDescription, isNarrow],
  )

  const rowInteractive = hasDescription && isNarrow

  return (
    <li
      className={`${styles.skillsList__item} ${hasDescription ? styles.itemHasDesc : ''}`}
      onClick={openModalIfSp}
      onKeyDown={onRowKeyDown}
      role={rowInteractive ? 'button' : undefined}
      tabIndex={rowInteractive ? 0 : undefined}
      aria-haspopup={rowInteractive ? 'dialog' : undefined}
      aria-expanded={rowInteractive ? modalOpen : undefined}
      aria-label={rowInteractive ? `${name}の説明を表示` : undefined}
    >
      {(iconUrl || isStudying) && (
        <div className={styles.skillIconWrap}>
          {iconUrl && (
            <div className={styles.skillIcon}>
              <Image src={iconUrl} alt={iconAlt} width={64} height={64} />
            </div>
          )}
          {isStudying && (
            <div className={styles.skillLearning}>
              <Image src={LEARNING_ICON_SRC} alt="勉強中" width={40} height={40} />
            </div>
          )}
        </div>
      )}

      <div className={styles.skillMeta}>
        <span className={styles.skillName}>{name}</span>
      </div>

      {hasDescription && (
        <>
          <div className={styles.skillDescHover} role="tooltip">
            <p className={styles.skillDescription}>{description}</p>
          </div>

          {modalOpen &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                className={styles.skillDescModalRoot}
                role="presentation"
                onClick={handleBackdropDismiss}
                onPointerDown={handleBackdropDismiss}
              >
                <div
                  id={dialogId}
                  className={styles.skillDescModal}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={dialogTitleId}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.skillDescModalHeader}>
                    <h4 className={styles.skillDescModalTitle} id={dialogTitleId}>
                      {name}
                    </h4>
                    <button
                      type="button"
                      className={styles.skillDescModalClose}
                      onClick={closeModal}
                      aria-label="閉じる"
                    >
                      ×
                    </button>
                  </div>
                  <p className={styles.skillDescription}>{description}</p>
                </div>
              </div>,
              document.body,
            )}
        </>
      )}
    </li>
  )
}
