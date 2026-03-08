import styles from './About.module.scss'
import Image from 'next/image'
import Title from '@/components/UI/Title'

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className="wrap">
        <Title en="ABOUT">私について</Title>
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
            <p>桜井 翔</p>
            <p>Web Engineer / Tokyo </p>
          </div>
          <p className={styles.aboutContent}>
            アパレルやWebディレクターなど、常に「人」と向き合う仕事をしてきました。<br></br>
            「もっとこうなら使いやすいのに」「自分の手で形にしたい」<br></br>
            その想いが強くなり、技術を習得してエンジニアへ転身しました。<br></br>
            豊富な対人経験をベースにした「ユーザーに寄り添う想像力」を武器に、<br></br>
            使う人が心地よく、信頼できるWebサイトを構築します。
          </p>
        </div>
      </div>
    </section>
  )
}
