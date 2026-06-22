import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import config from '@/payload.config'
import DeviceShowcase from '@/components/UI/DeviceShowcase'
import type { Media, Project } from '@/payload-types'
import styles from './WorkDetail.module.scss'

function getMediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === 'number') return null
  return media.url ?? null
}

function getMediaAlt(media: number | Media | null | undefined, fallback: string): string {
  if (media && typeof media === 'object' && media.alt) return media.alt
  return fallback
}

function formatYearMonth(dateString?: string | null): string | null {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}.${`${date.getMonth() + 1}`.padStart(2, '0')}`
}

function formatProductionPeriod(start?: string | null, end?: string | null): string | null {
  const s = formatYearMonth(start)
  const e = formatYearMonth(end)
  if (s && e) return `${s}〜${e}`
  if (s) return s
  return null
}

function getScopeName(scope: unknown): string | null {
  if (!scope || typeof scope !== 'object') return null
  const name = (scope as { name?: unknown }).name
  return typeof name === 'string' && name.trim().length > 0 ? name : null
}

function sortByOrder<T extends { sort_order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
}

/** トップ Works と同じ並び（ダミー → DB）の全件リスト。前後ナビ・詳細取得に使う */
async function getProjects(): Promise<Project[]> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const res = await payload
    .find({ collection: 'projects', depth: 1, limit: 100, sort: 'sort_order' })
    .catch(() => null)
  const db = res ? sortByOrder(res.docs) : []
  return db
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const projects = await getProjects()
  const project = projects.find((p) => String(p.id) === id)
  return { title: project?.title ?? '実績', description: project?.description ?? undefined }
}

type CaseSection = { no: string; en: string; label: string; body: string }

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projects = await getProjects()
  const index = projects.findIndex((p) => String(p.id) === id)
  if (index === -1) notFound()

  const project = projects[index]
  const prev = index > 0 ? projects[index - 1] : null
  const next = index < projects.length - 1 ? projects[index + 1] : null

  const desktopUrl = getMediaUrl(project.mainImage)
  const mobileUrl = getMediaUrl(project.mobileImage)
  const desktopAlt = getMediaAlt(project.mainImage, `${project.title} PC表示`)
  const mobileAlt = getMediaAlt(project.mobileImage, `${project.title} SP表示`)
  const confidential = Boolean(project.confidential)
  const period = formatProductionPeriod(project.productionDate, project.productionEndDate)
  const scopeText =
    project.scope && project.scope.length > 0
      ? project.scope.map((v) => getScopeName(v)).filter(Boolean).join(' / ')
      : null
  const techText =
    project.techStack && project.techStack.length > 0
      ? project.techStack.map((t) => t.name).filter(Boolean).join(' / ')
      : null

  const sections: CaseSection[] = (
    [
      { no: '01', en: 'PROBLEM', label: '課題・背景', body: project.challenge },
      { no: '02', en: 'STACK', label: '技術選定・設計判断', body: project.approach },
      { no: '03', en: 'HIGHLIGHT', label: '工夫・詰まった所', body: project.highlights },
      { no: '04', en: 'RESULT', label: '結果・学び', body: project.result },
    ] as const
  )
    .filter((s) => Boolean(s.body && s.body.trim()))
    .map((s) => ({ ...s, body: s.body as string }))

  return (
    <article className={styles.work}>
      <div className="wrap">
        <Link href="/#works" className={styles.back}>
          <span aria-hidden>←</span> WORKS / 実績一覧へ
        </Link>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>CASE STUDY{period ? ` — ${period}` : ''}</p>
          <h1 className={styles.title}>{project.title}</h1>
        </header>

        <div className="w1000">
          <DeviceShowcase
          desktopUrl={desktopUrl}
          desktopAlt={desktopAlt}
          mobileUrl={mobileUrl}
          mobileAlt={mobileAlt}
          confidential={confidential}
          variant="detail"
          className={styles.detailShowcase}
        />

        {(scopeText || techText || period) && (
          <dl className={styles.spec}>
            {scopeText && (
              <div className={styles.specRow}>
                <dt className={styles.specKey}>SCOPE / 担当範囲</dt>
                <dd className={styles.specVal}>{scopeText}</dd>
              </div>
            )}
            {techText && (
              <div className={styles.specRow}>
                <dt className={styles.specKey}>STACK / 使用技術</dt>
                <dd className={styles.specVal}>{techText}</dd>
              </div>
            )}
            {period && (
              <div className={styles.specRow}>
                <dt className={styles.specKey}>DATE / 制作時期</dt>
                <dd className={styles.specVal}>{period}</dd>
              </div>
            )}
          </dl>
        )}

        {sections.map((s) => (
          <section key={s.no} className={styles.section}>
            <h2 className={styles.secHead}>
              <span className={styles.secNo}>{s.no}</span>
              <span className={styles.secEn}>{s.en}</span>
              <span className={styles.secLabel}>{s.label}</span>
            </h2>
            <p className={styles.body}>{s.body}</p>
          </section>
        ))}

        {project.description && <p className={styles.lead}>{project.description}</p>}

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.siteLink}
          >
            サイトを見る
            <svg
              className={styles.siteLinkIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              focusable="false"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
        )}
        </div>

        <nav className={styles.pager} aria-label="実績ナビゲーション">
          <div className={styles.pagerSide}>
            {prev && (
              <Link href={`/works/${prev.id}`} className={styles.pagerLink}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  focusable="false"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                <span className={styles.pagerMeta}>
                  <span className={styles.pagerLabel}>PREV</span>
                  <span className={styles.pagerTitle}>{prev.title}</span>
                </span>
              </Link>
            )}
          </div>

          <Link href="/#works" className={styles.pagerHome}>
            <svg
              className={styles.pagerHomeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              focusable="false"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            実績一覧へ戻る
          </Link>

          <div className={`${styles.pagerSide} ${styles.pagerSideEnd}`}>
            {next && (
              <Link href={`/works/${next.id}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span className={styles.pagerMeta}>
                  <span className={styles.pagerLabel}>NEXT</span>
                  <span className={styles.pagerTitle}>{next.title}</span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  focusable="false"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </article>
  )
}
