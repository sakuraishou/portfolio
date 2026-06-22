import SectionHeader from '@/components/Torisetsu/SectionHeader'
import SpecDashboard from './SpecDashboard'
import styles from './Spec.module.scss'

export default function Spec() {
  return (
    <section id="spec" className={styles.spec}>
      <div className="wrap">
        <SectionHeader no="05" en="SPECIFICATIONS">
          製品仕様
        </SectionHeader>

        <SpecDashboard />
      </div>
    </section>
  )
}
