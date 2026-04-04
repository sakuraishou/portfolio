'use client'

import styles from './Header.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
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
      <HamburgerButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen((prev) => !prev)} />
      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-en={item.en}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
