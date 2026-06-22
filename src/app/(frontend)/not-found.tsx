import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './not-found.module.scss'

export const metadata: Metadata = {
  title: 'ページが見つかりません',
}

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <div className={styles.inner}>
        <p className={styles.code}>404</p>
        <p className={styles.label}>NOT FOUND</p>
        <h1 className={styles.title}>ページが見つかりません</h1>
        <p className={styles.description}>
          お探しのページは移動または削除された可能性があります。
          <br className="sp" />
          トップページからもう一度お試しください。
        </p>
        <Link href="/" className={styles.link}>
          <svg
            className={styles.linkIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            focusable="false"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          トップページへ戻る
        </Link>
      </div>
    </section>
  )
}
