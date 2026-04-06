'use client'

import styles from './Header.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import { type CSSProperties, useState } from 'react'
import HamburgerButton from './Hamburger'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const NAV_ITEMS = [
    { href: '#about', label: '私について', en: 'ABOUT' },
    { href: '#skills', label: 'できること', en: 'SKILLS' },
    { href: '#works', label: '制作実績', en: 'WORKS' },
    { href: '#contact', label: 'お問い合わせ', en: 'CONTACT' },
  ]

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        <Image src="/assets/header/logo.png" alt="Logo" width={100} height={100} />
      </Link>
      <HamburgerButton
        isOpen={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        controlsId="global-navigation"
      />
      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`} id="global-navigation">
        {NAV_ITEMS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            data-en={item.en}
            className={styles.navLink}
            style={{ '--delay': `${index * 80}ms` } as CSSProperties}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.navIndex}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.navText}>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navEn}>{item.en}</span>
            </span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
