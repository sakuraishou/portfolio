import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Link from 'next/link'
import Title from '@/components/UI/Title'
import styles from './About.module.scss'

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
      <div className="wrap flex">
        <Title en="ABOUT" className={styles.aboutTitle}>
          私について
        </Title>
        <div className={styles.aboutWrap}>
          <figure className={styles.aboutImg}>
            <Image
              src="/assets/about/about-img.png"
              alt="プロフィール画像"
              width={100}
              height={100}
            />
            <figcaption className={styles.aboutImg__name}>Sho Sakurai</figcaption>
          </figure>
          <div className={styles.aboutName}>
            <p className={styles.aboutName__ja}>桜井 翔</p>
            <p className={styles.aboutName__en}>Web Engineer / Tokyo </p>
          </div>
          <p className={styles.aboutContent}>
            アパレルやWebディレクターなど、常に「人」と向き合う仕事をしてきました。<br></br>
            「もっとこうなら使いやすいのに」「自分の手で形にしたい」<br></br>
            その想いが強くなり、技術を習得してエンジニアへ転身しました。<br></br>
            豊富な対人経験をベースにした「ユーザーに寄り添う想像力」を武器に、<br></br>
            使う人が心地よく、信頼できるWebサイトを構築します。
          </p>
          {tags.length > 0 && (
            <ul className={styles.aboutTags}>
              {tags.map((tag) => (
                <li key={tag.id} className={styles.aboutTags__item}>
                  #{tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.aboutCtaWrap}>
          <p className={styles.aboutCtaLead}>もっと深く知りたい方へ</p>
          <Link href="/manual" className={styles.aboutCta}>
            <svg
              className={styles.aboutCtaBook}
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
              className={styles.aboutCtaArrow}
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
    </section>
  )
}
