import styles from './Title.module.scss'

type Props = {
  children: React.ReactNode
  en?: string
  /** 章番号（例: "01"）。指定すると MV 調（mono 連番ラベル＋Fraunces 透かし＋ヘアライン）になる */
  no?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}

export default function Title({ children, en, no, as: Tag = 'h2', className = '' }: Props) {
  // no 指定時：MV と統一した見出し。未指定時：従来の見出し（manual Cover 等）
  if (no) {
    return (
      <div className={`${styles.head} ${className}`.trim()}>
        {en && (
          <span className={styles.wm} aria-hidden>
            {en}
          </span>
        )}
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden />
          {en ? `${no} / ${en}` : no}
        </span>
        <Tag className={styles.jp}>{children}</Tag>
      </div>
    )
  }

  return (
    <Tag className={`${styles.title} ${className}`.trim()} data-en={en || undefined}>
      {children}
    </Tag>
  )
}
