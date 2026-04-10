import styles from './FirstView.module.scss'

export default function FirstView() {
  return (
    <section className={styles.firstView}>
      <div className={`wrap ${styles.firstView__wrap}`}>
        <div className={styles.inner}>
          <h1 className={styles.title}>
            <span className={styles.big}>Code</span>
            <span className={styles.pc}> </span>
            <br className="sp" />
            With Heart.
          </h1>
          <p className={styles.sub}>
            あなたの「作りたい」に、
            <br className="sp" />
            一番近くで寄り添う。
            <br className="sp" />
            言葉にできない想いまで、
            <br className="sp" />
            大切に実装するエンジニア
          </p>
        </div>
        <a href="#about" className={styles.scrollCue} aria-label="Aboutセクションへスクロール">
          <span className={styles.scrollText}>SCROLL</span>
          <span className={styles.scrollMouse} aria-hidden>
            <span className={styles.scrollDot} />
          </span>
        </a>
      </div>
    </section>
  )
}
