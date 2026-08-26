import type { Metadata } from 'next'
import './styles.scss'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { GoogleAnalytics } from '@next/third-parties/google'

/** Turbopack + next/font/google の解決バグを避けるため、Google Fonts は link で読み込む */
const googleFontsStylesheet =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap'

const SITE_URL = 'https://shou0831.com'
const SITE_NAME = 'Sho Sakurai Portfolio'
const SITE_DESCRIPTION =
  'Web／プロダクト開発エンジニア 桜井翔のポートフォリオ。Next.js、TypeScript、Nuxt、WordPress、Headless CMS、API・DB連携を用いたWebアプリ、業務システム、Web基盤の設計・開発事例を掲載しています。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    // OG 画像を用意していないため large ではなく summary を使う
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: '/assets/header/logo.png',
    shortcut: '/assets/header/logo.png',
    apple: '/assets/header/logo.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // GA4: 本番ビルドかつ測定IDがある時だけ読み込む（開発中の誤送信を防ぐ）
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsStylesheet} rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
      {isProduction && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  )
}
