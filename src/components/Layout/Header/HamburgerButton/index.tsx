'use client'

type Props = {
  isOpen: boolean
  onClick: () => void
}

export default function HamburgerButton({ isOpen, onClick }: Props) {
  return (
    <button
      className={`hamburger${isOpen ? ' hamburger--open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
      aria-expanded={isOpen}
    >
      <span className="hamburger__line" />
      <span className="hamburger__line" />
      <span className="hamburger__line" />
    </button>
  )
}
