import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.scss'

const NAV_ITEMS = [
  { href: '/', ja: 'ホーム', en: 'HOME' },
  { href: '/#about', ja: '私について', en: 'ABOUT' },
  { href: '/#works', ja: '制作実績', en: 'WORKS' },
  { href: '/#blog', ja: 'ブログ', en: 'BLOG' },
  { href: '/#contact', ja: 'お問い合わせ', en: 'CONTACT' },
] as const

const GITHUB_URL = 'https://github.com/sakuraishou'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} aria-label="フッター">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Link className={styles.logoLink} href="/" aria-label="トップへ戻る">
            <span className={styles.logo}>
              <Image src="/assets/header/logo.png" alt="" width={60} height={60} priority={false} />
            </span>
            <span className={styles.siteName}>
              桜井 翔<span className={styles.siteSub}>Sho Sakurai Portfolio</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="フッターナビゲーション">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <Link className={styles.navLink} href={item.href}>
                  <span className={styles.navJa}>{item.ja}</span>
                  <span className={styles.navEn} aria-hidden>
                    {item.en}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.social}>
          <a
            className={styles.githubLink}
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub（新しいタブで開く）"
          >
            <span className={styles.githubLabel}>GitHub</span>
            <span className={styles.githubId} aria-hidden>
              @sakuraishou
            </span>
          </a>
        </div>

        <small className={styles.copy}>© {year} Sho Sakurai</small>
      </div>
    </footer>
  )
}
