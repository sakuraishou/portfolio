import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import Title from '@/components/UI/Title'
import styles from './About.module.scss'

/** スペック表（基本情報）。文言はここを直すだけでOK */
const SPEC: { label: string; value: string }[] = [
  { label: '背景 / BG', value: 'アパレル販売（約10年）→ Web ディレクター → エンジニア' },
  { label: '強み / STR', value: '相手の本音を汲み取り、一歩先を提案する力' },
  { label: '姿勢 / WAY', value: 'まず作って見せる。納得いくまで一緒に磨く' },
]

export default async function About() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs: tags } = await payload.find({
    collection: 'tags',
    sort: 'sort_order',
    limit: 100,
  })

  return (
    <section id="about" className={styles.about}>
      <div className="wrap">
        <Title en="ABOUT" no="01" className={styles.aboutTitle}>
          私について
        </Title>

        <div className="w1000">
          {/* 氏名ヘッダー（全幅・横広） */}
          <div className={styles.idHeader}>
            <p className={styles.idEyebrow}>PROFILE</p>
            <div className={styles.idRow}>
              <h3 className={styles.idName}>桜井 翔</h3>
              <p className={styles.idMeta}>
                <span>Web Engineer / Tokyo</span>
                <span className={styles.idStatus}>
                  <span className={styles.idDot} aria-hidden />
                  Open to Work
                </span>
              </p>
            </div>
          </div>

          {/* 本文ボディ（写真｜詳細） */}
          <div className={styles.body}>
            <figure className={styles.photo}>
              <Image
                src="/assets/about/about-img.png"
                alt="桜井 翔のプロフィール写真"
                width={400}
                height={500}
                className={styles.photoImg}
              />
              <figcaption className={styles.photoCap}>
                <span>FIG.1</span>
                <span>PORTRAIT</span>
              </figcaption>
            </figure>

            <div className={styles.detail}>
              <p className={styles.lead}>「作りたい」を、一番近くで形にするエンジニア。</p>
              <p className={styles.text}>
                アパレルやWebディレクターなど、常に「人」と向き合う仕事をしてきました。その対人経験をベースにした「ユーザーに寄り添う想像力」を武器に、使う人が心地よく、信頼できるWebサイトを構築します。
              </p>

              <dl className={styles.spec}>
                {SPEC.map((row) => (
                  <div key={row.label} className={styles.specRow}>
                    <dt className={styles.specKey}>{row.label}</dt>
                    <dd className={styles.specVal}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* タグ（全幅・横広） */}
          {tags.length > 0 && (
            <div className={styles.tagsRow}>
              <span className={styles.tagsLabel}>KEYWORDS</span>
              <ul className={styles.tags}>
                {tags.map((tag) => (
                  <li key={tag.id} className={styles.tagItem}>
                    #{tag.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA フッター帯（全幅） */}
          <div className={styles.footer}>
            <p className={styles.ctaLead}>もっと深く知りたい方へ</p>
            <Link href="/manual" className={styles.cta}>
              <svg
                className={styles.ctaBook}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                focusable="false"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              わたしの取扱説明書を見る
              <svg
                className={styles.ctaArrow}
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
          </div>
        </div>
      </div>
    </section>
  )
}
