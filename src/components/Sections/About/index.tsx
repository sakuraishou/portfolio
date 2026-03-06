import styles from './About.module.scss'

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.wrap}>
        <h2 className={styles.title} data-en="ABOUT">
          私について
        </h2>
        <div className={styles.content}>
          <p>
            テキストをここに記載します。
          </p>
        </div>
      </div>
    </section>
  )
}
