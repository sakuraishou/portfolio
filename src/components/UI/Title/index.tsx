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
      // 出現演出は ScrollFX が data-title-* を拾って行う（罫線 → 連番デコード → 帯が走って見出し）
      <div className={`${styles.head} ${className}`.trim()} data-title-head>
        {en && (
          <span className={styles.wm} aria-hidden data-parallax data-parallax-speed="22">
            {en}
          </span>
        )}
        <span className={styles.eyebrow} data-title-eyebrow>
          <span className={styles.eyebrowLine} aria-hidden data-title-line />
          <span data-title-label>{en ? `${no} / ${en}` : no}</span>
        </span>
        <Tag className={styles.jp}>
          <span className={styles.jpText}>
            <span data-title-text>{children}</span>
            <span className={styles.jpBar} aria-hidden data-title-bar />
          </span>
        </Tag>
      </div>
    )
  }

  return (
    <Tag className={`${styles.title} ${className}`.trim()} data-en={en || undefined}>
      {children}
    </Tag>
  )
}
