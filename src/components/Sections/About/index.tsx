import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import Title from '@/components/UI/Title'
import styles from './About.module.css'

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
      </div>
    </section>
  )
}
