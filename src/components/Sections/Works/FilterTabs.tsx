'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import styles from './Works.module.scss'

export type FilterValue = 'case-study' | 'site-work' | null

type Tab = {
  label: string
  count: number
  value: FilterValue
}

type FilterTabsProps = {
  tabs: Tab[]
  /** サーバー側で ?type= から解決した初期値 */
  initial: FilterValue
}

/**
 * WORKS の絞り込みタブ。
 *
 * ページ遷移で絞り込むと SSR の往復で一瞬白くなるため、クリックは preventDefault して
 * <section id="works"> の data-filter 属性を書き換える（CSS が非対称の表示切替を行う）。
 * URL は replaceState で同期するので、絞り込み状態の共有・リロード復元はそのまま効く。
 * JS が無効な環境では素の <Link> として動き、サーバー側の絞り込みにフォールバックする。
 */
export default function FilterTabs({ tabs, initial }: FilterTabsProps) {
  const [active, setActive] = useState<FilterValue>(initial)

  const apply = useCallback((value: FilterValue) => {
    setActive(value)
    document.getElementById('works')?.setAttribute('data-filter', value ?? 'all')
    const url = value ? `/?type=${value}#works` : '/#works'
    window.history.replaceState(null, '', url)
  }, [])

  return (
    <nav className={styles.filter} aria-label="実績の絞り込み" data-reveal="fade">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.value ? `/?type=${tab.value}#works` : '/#works'}
          className={`${styles.filterLink} ${active === tab.value ? styles.filterActive : ''}`.trim()}
          aria-current={active === tab.value ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault()
            apply(tab.value)
          }}
        >
          {tab.label}
          <span className={styles.filterCount}>{tab.count}</span>
        </Link>
      ))}
    </nav>
  )
}
