import Link from 'next/link'
import styles from './BackHome.module.scss'

export default function BackHome() {
  return (
    <div className={styles.backHome}>
      <div className="wrap">
        <Link href="/" className={styles.button}>
          <svg
            className={styles.icon}
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
          トップに戻る
        </Link>
      </div>
    </div>
  )
}
