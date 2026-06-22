import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Title from '@/components/UI/Title'
import DeviceShowcase from '@/components/UI/DeviceShowcase'
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

/** 使用技術を「 · 」区切りで全部つなぐ */
function getTechLine(techStack: Project['techStack']): string | null {
  if (!techStack || techStack.length === 0) return null
  const names = techStack.map((t) => t.name).filter(Boolean)
  return names.length > 0 ? names.join(' · ') : null
}

function sortByOrder<T extends { sort_order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
}

export default async function Works() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs: rawProjects } = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    sort: 'sort_order',
  })
  const projects = sortByOrder(rawProjects)

  return (
    <section id="works" className={styles.works}>
      <div className="wrap">
        <Title en="WORKS" no="03" className={styles.worksTitle}>
          制作実績
        </Title>
        {projects.length > 0 ? (
          <ul className={styles.worksList}>
            {projects.map((project, i) => {
              const desktopUrl = getMediaUrl(project.mainImage)
              const mobileUrl = getMediaUrl(project.mobileImage)
              const desktopAlt = getMediaAlt(project.mainImage, `${project.title} PC表示`)
              const mobileAlt = getMediaAlt(project.mobileImage, `${project.title} SP表示`)
              const confidential = Boolean(project.confidential)
              const techLine = getTechLine(project.techStack)
              const no = String(i + 1).padStart(2, '0')
              // PC では奇数（01・03…）を左右反転
              const reverse = i % 2 === 0

              return (
                <li key={project.id} className={styles.worksList__item}>
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
                        <span className={styles.cardTag}>CASE STUDY</span>
                      </p>
                      <h3 className={styles.cardTitle}>{project.title}</h3>
                      {techLine && <p className={styles.cardStack}>{techLine}</p>}
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
