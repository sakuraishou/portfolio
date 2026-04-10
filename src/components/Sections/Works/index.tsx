import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Title from '@/components/UI/Title'
import styles from './Works.module.scss'
import type { Media } from '@/payload-types'

function getMediaUrl(media: (number | null) | Media): string | null {
  if (!media || typeof media === 'number') return null
  return media.url ?? null
}

function formatYearMonth(dateString?: string | null): string | null {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${y}.${m}`
}

function formatProductionPeriod(startDate?: string | null, endDate?: string | null): string | null {
  const start = formatYearMonth(startDate)
  const end = formatYearMonth(endDate)

  if (start && end) return `${start}〜${end}`
  if (start) return start
  return null
}

function getScopeName(scope: unknown): string | null {
  if (!scope || typeof scope !== 'object') return null
  const name = (scope as { name?: unknown }).name
  return typeof name === 'string' && name.trim().length > 0 ? name : null
}

export default async function Works() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs: projects } = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <section id="works" className={styles.works}>
      <div className="wrap">
        <Title en="WORKS" className={styles.worksTitle}>
          制作実績
        </Title>
        {projects.length > 0 ? (
          <ul className={styles.worksList}>
            {projects.map((project) => {
              const desktopImageUrl = project.mainImage ? getMediaUrl(project.mainImage) : null
              const mobileImageUrl = project.mobileImage ? getMediaUrl(project.mobileImage) : null
              const hasAnyImage = Boolean(desktopImageUrl || mobileImageUrl)
              const hasBothImages = Boolean(desktopImageUrl && mobileImageUrl)
              const productionYM = formatProductionPeriod(
                project.productionDate,
                project.productionEndDate,
              )
              const scopeText =
                project.scope && project.scope.length > 0
                  ? project.scope.map((v) => getScopeName(v)).filter(Boolean).join(' / ')
                  : null
              const techText =
                project.techStack && project.techStack.length > 0
                  ? project.techStack
                      .map((t) => t.name)
                      .filter(Boolean)
                      .join(' / ')
                  : null
              const desktopAlt =
                project.mainImage && typeof project.mainImage === 'object'
                  ? project.mainImage.alt || `${project.title} PC表示`
                  : `${project.title} PC表示`
              const mobileAlt =
                project.mobileImage && typeof project.mobileImage === 'object'
                  ? project.mobileImage.alt || `${project.title} SP表示`
                  : `${project.title} SP表示`

              return (
                <li key={project.id} className={styles.worksList__item}>
                  <h3 className={styles.workTitle}>{project.title}</h3>
                  {hasAnyImage && (
                    <div
                      className={`${styles.workVisual} ${hasBothImages ? styles.workVisual__pair : styles.workVisual__single}`}
                    >
                      {desktopImageUrl && (
                        <figure className={styles.workDeviceDesktop}>
                          <div className={styles.workDeviceDesktop__frame}>
                            <Image
                              src={desktopImageUrl}
                              alt={desktopAlt}
                              width={1440}
                              height={686}
                              className={styles.workDeviceDesktop__img}
                            />
                          </div>
                        </figure>
                      )}
                      {mobileImageUrl && (
                        <figure className={styles.workDeviceMobile}>
                          <div className={styles.workDeviceMobile__frame}>
                            <Image
                              src={mobileImageUrl}
                              alt={mobileAlt}
                              width={540}
                              height={960}
                              className={styles.workDeviceMobile__img}
                            />
                          </div>
                        </figure>
                      )}
                    </div>
                  )}
                  <div className={styles.workBody}>
                    {project.description && (
                      <p className={styles.workDescription}>{project.description}</p>
                    )}
                    {(scopeText || techText || productionYM) && (
                      <dl className={styles.workMeta}>
                        {scopeText && (
                          <div className={styles.workMeta__row}>
                            <dt className={styles.workMeta__label}>担当範囲</dt>
                            <dd className={styles.workMeta__value}>{scopeText}</dd>
                          </div>
                        )}
                        {techText && (
                          <div className={styles.workMeta__row}>
                            <dt className={styles.workMeta__label}>使用技術</dt>
                            <dd className={styles.workMeta__value}>{techText}</dd>
                          </div>
                        )}
                        {productionYM && (
                          <div className={styles.workMeta__row}>
                            <dt className={styles.workMeta__label}>制作時期</dt>
                            <dd className={styles.workMeta__value}>{productionYM}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.workLink}
                      >
                        サイトを見る
                      </a>
                    )}
                  </div>
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
