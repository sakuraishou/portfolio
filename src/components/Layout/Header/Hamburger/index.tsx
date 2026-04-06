'use client'
import styles from './Hamburger.module.scss'

type Props = {
  isOpen: boolean
  onClick: () => void
  controlsId?: string
}

export default function HamburgerButton({ isOpen, onClick, controlsId }: Props) {
  return (
    <button
      className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
      aria-expanded={isOpen}
      aria-controls={controlsId}
    >
      <span className={styles.line} />
      <span className={styles.line} />
      <span className={styles.line} />
    </button>
  )
}
