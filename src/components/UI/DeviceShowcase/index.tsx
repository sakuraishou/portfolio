import Image from 'next/image'
import styles from './DeviceShowcase.module.scss'

type Props = {
  desktopUrl: string | null
  desktopAlt: string
  mobileUrl: string | null
  mobileAlt: string
  /** true = 社外秘。画像があっても出さず「非公開」表示にする */
  confidential?: boolean
  /** list = トップ一覧（中央揃え・はみ出し） / detail = 詳細（PC小さめ・SP下揃え） */
  variant?: 'list' | 'detail'
  className?: string
}

/** PC ブラウザ枠 ＋ 暖色ベゼルのスマホを重ねた制作実績ビジュアル（Works 一覧・詳細で共用） */
export default function DeviceShowcase({
  desktopUrl,
  desktopAlt,
  mobileUrl,
  mobileAlt,
  confidential = false,
  variant = 'list',
  className,
}: Props) {
  const sizes =
    variant === 'detail'
      ? { pc: '(max-width: 767px) 92vw, 70vw', sp: '(max-width: 767px) 28vw, 14vw' }
      : { pc: '(max-width: 767px) 90vw, 45vw', sp: '(max-width: 767px) 25vw, 12vw' }

  // 社外秘のときはスマホ枠（はみ出し余白も）を出さない
  const showSp = !confidential && Boolean(mobileUrl)

  return (
    <div
      className={[
        styles.showcase,
        showSp ? styles.withSp : '',
        variant === 'detail' ? styles.detail : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.pc}>
        <div className={styles.pc__bar} aria-hidden>
          <span className={styles.pc__dot} />
          <span className={styles.pc__dot} />
          <span className={styles.pc__dot} />
        </div>
        <div className={styles.pc__screen}>
          {confidential ? (
            <span className={styles.confidential} aria-hidden>
              <svg
                className={styles.confidentialIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className={styles.confidentialEn}>CONFIDENTIAL</span>
              <span className={styles.confidentialJa}>社外秘のため画像は非公開</span>
            </span>
          ) : desktopUrl ? (
            <Image
              src={desktopUrl}
              alt={desktopAlt}
              fill
              sizes={sizes.pc}
              className={styles.shotImg}
            />
          ) : (
            <span className={styles.shotPlaceholder} aria-hidden>
              NO IMAGE
            </span>
          )}
        </div>
      </div>
      {!confidential && mobileUrl && (
        <div className={styles.sp}>
          <div className={styles.sp__screen}>
            <Image
              src={mobileUrl}
              alt={mobileAlt}
              fill
              sizes={sizes.sp}
              className={styles.shotImg}
            />
          </div>
        </div>
      )}
    </div>
  )
}
