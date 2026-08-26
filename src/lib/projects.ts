import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Project } from '@/payload-types'

/**
 * Works 一覧と Works 詳細で共有する Projects の取得・整列・表示ロジック。
 *
 * 一覧と詳細で並び順がずれると詳細ページの PREV／NEXT が一覧と食い違うため、
 * 並び替えは必ずこのモジュールの `sortProjects` を通す。
 */

/** 代表案件を先頭グループへ、その中と以降は sort_order 昇順 */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    if (featuredDiff !== 0) return featuredDiff
    return (a.sort_order ?? 999) - (b.sort_order ?? 999)
  })
}

/** トップと詳細で同じ並びの全件を返す */
export async function getSortedProjects(): Promise<Project[]> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const res = await payload
    .find({ collection: 'projects', depth: 1, limit: 100, sort: 'sort_order' })
    .catch(() => null)
  return res ? sortProjects(res.docs) : []
}

/** 案件種別ラベル。未設定の既存データは従来表示（CASE STUDY）にフォールバックする */
export function getWorkTypeLabel(workType: Project['workType']): string {
  return workType === 'site-work' ? 'SITE WORK' : 'CASE STUDY'
}

const STATUS_LABELS: Record<NonNullable<Project['status']>, string> = {
  'in-development': '開発中',
  'in-verification': '検証中',
  'in-production': '本番稼働中',
  completed: '完了',
  internal: '社内利用',
}

/** 状態ラベル。未設定なら null（ラベルを出さない） */
export function getStatusLabel(status: Project['status']): string | null {
  return status ? STATUS_LABELS[status] : null
}

export type CaseSection = { no: string; en: string; label: string; body: string }

/**
 * 詳細ページに出す章を返す。
 * `caseSections` が1件でもあればそれを順番どおりに使い、
 * 無ければ既存の固定4項目（challenge／approach／highlights／result）へフォールバックする。
 */
export function getCaseSections(project: Project): CaseSection[] {
  const custom = project.caseSections ?? []
  if (custom.length > 0) {
    return custom
      .filter((s) => Boolean(s.body?.trim()))
      .map((s, i) => ({
        no: String(i + 1).padStart(2, '0'),
        en: s.en,
        label: s.label,
        body: s.body,
      }))
  }

  const fallback: { en: string; label: string; body?: string | null }[] = [
    { en: 'PROBLEM', label: '課題・背景', body: project.challenge },
    { en: 'STACK', label: '技術選定・設計判断', body: project.approach },
    { en: 'HIGHLIGHT', label: '工夫・詰まった所', body: project.highlights },
    { en: 'RESULT', label: '結果・学び', body: project.result },
  ]

  return fallback
    .filter((s): s is { en: string; label: string; body: string } => Boolean(s.body?.trim()))
    .map((s, i) => ({ no: String(i + 1).padStart(2, '0'), en: s.en, label: s.label, body: s.body }))
}

/** relationship で返る値から Project を取り出す（ID だけの場合は捨てる） */
export function toProjectRefs(related: Project['relatedProjects']): Project[] {
  if (!related) return []
  return related.filter((v): v is Project => typeof v === 'object' && v !== null)
}
