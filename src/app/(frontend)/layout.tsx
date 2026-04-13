import type { Metadata } from 'next'
import './styles.scss'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'

/** Turbopack + next/font/google の解決バグを避けるため、Google Fonts は link で読み込む */
const googleFontsStylesheet =
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&family=Quicksand:wght@500&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap'

export const metadata: Metadata = {
  title: {
    default: 'Sho Sakurai Portfolio',
    template: '%s | Sho Sakurai Portfolio',
  },
  description: 'Web制作の実績・スキル・お問い合わせを掲載したポートフォリオサイトです。',
  icons: {
    icon: '/assets/header/logo.png',
    shortcut: '/assets/header/logo.png',
    apple: '/assets/header/logo.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

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
    </html>
  )
}
