import Link from 'next/link'
import Title from '@/components/UI/Title'
import FilterTabs from './FilterTabs'
import DeviceShowcase from '@/components/UI/DeviceShowcase'
import {
  getSortedProjects,
  getStatusLabel,
  getWorkTypeLabel,
} from '@/lib/projects'
import styles from './Works.module.scss'
import type { Media, Project } from '@/payload-types'

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return media.url ?? null
}

function getMediaAlt(media: number | Media | null | undefined, fallback: string): string {
  if (media && typeof media === 'object' && media.alt) return media.alt
  return fallback
}

/** カードに出す使用技術チップ */
function getTechChips(techStack: Project['techStack']): string[] {
  return (techStack ?? []).map((t) => t.name).filter(Boolean)
}

type WorksProps = {
  /** null = 全件表示 */
  filterType: 'case-study' | 'site-work' | null
}

export default async function Works({ filterType }: WorksProps) {
  // 常に全件を描画し、絞り込みは <section> の data-filter 属性 + CSS で行う。
  // ページ遷移を挟まないので一瞬白くならない（FilterTabs 参照）。
  // ?type= 付きの直リンク・JS 無効時はサーバー側でこの属性を初期設定するため、そのまま絞り込まれて見える。
  const projects = await getSortedProjects()
  const siteCount = projects.filter((p) => p.workType === 'site-work').length

  const tabs = [
    { label: 'ALL', count: projects.length, value: null },
    { label: 'CASE STUDY', count: projects.length - siteCount, value: 'case-study' },
    { label: 'SITE WORK', count: siteCount, value: 'site-work' },
  ] as const

  return (
    <section id="works" className={styles.works} data-filter={filterType ?? 'all'}>
      <div className="wrap">
        <Title en="WORKS" no="03" className={styles.worksTitle}>
          制作実績
        </Title>

        <FilterTabs tabs={[...tabs]} initial={filterType} />

        {projects.length > 0 ? (
          <ul className={styles.worksList}>
            {projects.map((project, i) => {
              const desktopUrl = getMediaUrl(project.mainImage)
              const mobileUrl = getMediaUrl(project.mobileImage)
              const desktopAlt = getMediaAlt(project.mainImage, `${project.title} PC表示`)
              const mobileAlt = getMediaAlt(project.mobileImage, `${project.title} SP表示`)
              const confidential = Boolean(project.confidential)
              const techChips = getTechChips(project.techStack)
              const workTypeLabel = getWorkTypeLabel(project.workType)
              const statusLabel = getStatusLabel(project.status)
              const summary = project.summary?.trim()
              const no = String(i + 1).padStart(2, '0')
              // PC では奇数（01・03…）を左右反転
              const reverse = i % 2 === 0

              return (
                <li
                  key={project.id}
                  className={styles.worksList__item}
                  data-reveal
                  data-worktype={project.workType === 'site-work' ? 'site-work' : 'case-study'}
                >
                  <Link
                    href={`/works/${project.id}`}
                    className={`${styles.card} ${reverse ? styles.cardReverse : ''}`.trim()}
                  >
                    <div className={styles.cardShowcase}>
                      <DeviceShowcase
                        desktopUrl={desktopUrl}
                        desktopAlt={desktopAlt}
                        mobileUrl={mobileUrl}
                        mobileAlt={mobileAlt}
                        confidential={confidential}
                      />
                    </div>

                    <div className={styles.cardText}>
                      <p className={styles.cardTop}>
                        <span className={styles.cardNo}>{no}</span>
                        <span
                          className={`${styles.cardTag} ${
                            project.workType === 'site-work' ? styles.cardTagSite : ''
                          }`.trim()}
                        >
                          {workTypeLabel}
                        </span>
                        {project.isFeatured && (
                          <span className={styles.cardFeatured}>FEATURED</span>
                        )}
                        {statusLabel && <span className={styles.cardStatus}>{statusLabel}</span>}
                      </p>
                      <h3 className={styles.cardTitle}>{project.title}</h3>
                      {summary && <p className={styles.cardSummary}>{summary}</p>}
                      {techChips.length > 0 && (
                        <ul className={styles.cardChips} aria-label="使用技術">
                          {techChips.map((name) => (
                            <li key={name} className={styles.cardChip}>
                              {name}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className={styles.cardMore}>
                        詳細を見る
                        <span className={styles.cardMore__circle} aria-hidden>
                          <svg
                            className={styles.cardMore__icon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            focusable="false"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={styles.empty}>実績が登録されていません</p>
        )}
      </div>
    </section>
  )
}
