import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Title from '@/components/UI/Title'
import styles from './Works.module.css'
import type { Media } from '@/payload-types'

function getMediaUrl(media: (number | null) | Media): string | null {
  if (!media || typeof media === 'number') return null
  return media.url ?? null
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
          実績
        </Title>
        {projects.length > 0 ? (
          <ul className={styles.worksList}>
            {projects.map((project) => {
              const imageUrl = project.mainImage ? getMediaUrl(project.mainImage) : null
              const alt =
                project.mainImage && typeof project.mainImage === 'object'
                  ? project.mainImage.alt
                  : project.title

              return (
                <li key={project.id} className={styles.worksList__item}>
                  {imageUrl && (
                    <div className={styles.workImage}>
                      <Image
                        src={imageUrl}
                        alt={alt}
                        width={400}
                        height={250}
                        className={styles.workImage__img}
                      />
                    </div>
                  )}
                  <div className={styles.workBody}>
                    <h3 className={styles.workTitle}>{project.title}</h3>
                    {project.description && (
                      <p className={styles.workDescription}>{project.description}</p>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.workLink}
                      >
                        サイトを見る →
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
