'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  SyntheticEvent,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Skills.module.scss'

export type RelatedWork = {
  id: number
  title: string
}

export type SkillListItemProps = {
  iconUrl: string | null
  isStudying: boolean
  isFeatured: boolean
  name: string
  description: string | null | undefined
  /** この技術を使った実績（Projects の skills relationship 逆引き） */
  relatedWorks: RelatedWork[]
}

type TooltipPlacement = 'top' | 'bottom'

type TooltipLayout = {
  placement: TooltipPlacement
  /** 出す側の余白に収まらないときだけ高さを絞る（中身はスクロール） */
  maxHeight: number | null
}

/** 行とツールチップの隙間（SCSS の 0.8rem と合わせる） */
const TOOLTIP_GAP_PX = 8

/**
 * ツールチップを行の上下どちらに出すか、どこまでの高さに収めるかを決める。
 * セクションは overflow: hidden で、固定ヘッダーも上に被さるため、
 * 「セクション内かつ画面内」で上に収まらなければ、広いほう（多くは下）へ出す。
 * どちらにも収まらなければ、広いほうの余白まで高さを絞る。
 */
function decideLayout(row: HTMLElement): TooltipLayout {
  const tooltip = row.querySelector<HTMLElement>('[role="tooltip"]')
  if (!tooltip) return { placement: 'top', maxHeight: null }
  const rowRect = row.getBoundingClientRect()
  const sectionRect = row.closest('section')?.getBoundingClientRect()
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  const upperLimit = Math.max(sectionRect?.top ?? 0, headerBottom, 0)
  const lowerLimit = Math.min(sectionRect?.bottom ?? window.innerHeight, window.innerHeight)
  // 前回絞った高さに引きずられないよう、内側の本来の高さ（scrollHeight）＋外側の余白で測る
  const inner = tooltip.firstElementChild as HTMLElement | null
  const chrome = inner ? tooltip.offsetHeight - inner.offsetHeight : 0
  const needed = (inner?.scrollHeight ?? tooltip.offsetHeight) + chrome + TOOLTIP_GAP_PX
  const above = rowRect.top - upperLimit
  const below = lowerLimit - rowRect.bottom
  if (above >= needed) return { placement: 'top', maxHeight: null }
  if (below >= needed) return { placement: 'bottom', maxHeight: null }
  const placement = below > above ? 'bottom' : 'top'
  const room = Math.max(below, above) - TOOLTIP_GAP_PX
  return { placement, maxHeight: Math.max(room, 0) }
}

export default function SkillListItem({
  iconUrl,
  isStudying,
  isFeatured,
  name,
  description,
  relatedWorks,
}: SkillListItemProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [tooltipLayout, setTooltipLayout] = useState<TooltipLayout>({
    placement: 'top',
    maxHeight: null,
  })
  const dialogId = useId()
  const dialogTitleId = useId()
  const tooltipId = useId()

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

  const hasDescription = Boolean(description?.trim()) || relatedWorks.length > 0

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

  /** PC のツールチップを出す直前に、上下どちらに出すかを測る */
  const updatePlacement = useCallback(
    (e: MouseEvent<HTMLLIElement> | FocusEvent<HTMLLIElement>) => {
      if (!hasDescription || isNarrow) return
      setTooltipLayout(decideLayout(e.currentTarget))
    },
    [hasDescription, isNarrow],
  )

  /** 「この技術を使った実績」リンク。JSなしでも辿れる素の Link にする */
  const worksLinks = relatedWorks.length > 0 && (
    <div className={styles.skillWorks}>
      <p className={styles.skillWorksLabel}>WORKS / この技術を使った実績</p>
      <ul className={styles.skillWorksList}>
        {relatedWorks.map((w) => (
          <li key={w.id}>
            <Link href={`/works/${w.id}`} className={styles.skillWorksLink}>
              {w.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <li
      className={`${styles.skillsList__item} ${hasDescription ? styles.itemHasDesc : ''}`}
      data-reveal="flip"
      onClick={openModalIfSp}
      onKeyDown={onRowKeyDown}
      onMouseEnter={updatePlacement}
      onFocus={updatePlacement}
      role={rowInteractive ? 'button' : undefined}
      // PC はホバーでツールチップを出すため、キーボードでも読めるようフォーカス可能にする
      tabIndex={hasDescription ? 0 : undefined}
      aria-haspopup={rowInteractive ? 'dialog' : undefined}
      aria-expanded={rowInteractive ? modalOpen : undefined}
      aria-label={rowInteractive ? `${name}の説明を表示` : undefined}
      aria-describedby={hasDescription && !isNarrow ? tooltipId : undefined}
    >
      {iconUrl && (
        <span className={styles.skillIcon}>
          {/* スキル名はすぐ隣にテキストで出ているため、アイコンは装飾扱い（alt 空） */}
          <Image src={iconUrl} alt="" width={64} height={64} />
        </span>
      )}

      <span className={styles.skillBody}>
        <span className={styles.skillName}>{name}</span>
        {(isFeatured || isStudying) && (
          <span className={styles.skillBadges}>
            {isFeatured && (
              <span className={`${styles.badge} ${styles.badgeFeatured}`}>得意</span>
            )}
            {isStudying && (
              <span className={`${styles.badge} ${styles.badgeStudying}`}>学習中</span>
            )}
          </span>
        )}
      </span>

      {hasDescription && (
        <>
          <div
            id={tooltipId}
            className={`${styles.skillDescHover} ${
              tooltipLayout.placement === 'bottom' ? styles.skillDescHoverBottom : ''
            }`.trim()}
            style={
              tooltipLayout.maxHeight !== null
                ? ({ '--tooltip-max-height': `${tooltipLayout.maxHeight}px` } as CSSProperties)
                : undefined
            }
            role="tooltip"
          >
            {/* スクロールは内側だけにする（外側を overflow させると、行との隙間を埋める ::after まで切れる） */}
            <div className={styles.skillDescHoverInner}>
              {description?.trim() && <p className={styles.skillDescription}>{description}</p>}
              {worksLinks}
            </div>
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
                  {description?.trim() && (
                    <p className={styles.skillDescription}>{description}</p>
                  )}
                  {worksLinks}
                </div>
              </div>,
              document.body,
            )}
        </>
      )}
    </li>
  )
}
