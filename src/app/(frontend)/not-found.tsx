import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './not-found.module.scss'

export const metadata: Metadata = {
  title: 'ページが見つかりません',
}

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <div className="wrap">
        <div className={styles.inner}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>ページが見つかりません</h1>
          <p className={styles.description}>
            お探しのページは移動または削除された可能性があります。
            <br />
            トップページからもう一度お試しください。
          </p>
          <Link href="/" className={styles.link}>
            トップページへ戻る
          </Link>
        </div>
      </div>
    </section>
  )
}
