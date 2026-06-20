import SectionHeader from '../SectionHeader'
import { FEATURES, HUMAN_SPEC } from '../data'
import RadarChart from './RadarChart'
import styles from './Features.module.scss'

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className="wrap">
        <SectionHeader no="01" en="FEATURES">
          主な機能・特長
        </SectionHeader>

        <div className={styles.body}>
          <ul className={styles.list}>
            {FEATURES.map((feature) => (
              <li key={feature.title} className={styles.item}>
                <h3 className={styles.itemTitle}>{feature.title}</h3>
                <p className={styles.itemBody}>{feature.body}</p>
              </li>
            ))}
          </ul>

          <div className={styles.chart}>
            <p className={styles.chartCaption}>ヒューマンスペック</p>
            <RadarChart data={HUMAN_SPEC} />
          </div>
        </div>
      </div>
    </section>
  )
}
