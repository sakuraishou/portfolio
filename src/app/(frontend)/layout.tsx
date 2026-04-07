import { Zen_Kaku_Gothic_New, Dancing_Script, Quicksand } from 'next/font/google'
import './styles.scss'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen-kaku',
  display: 'swap',
})

// サブ1
const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-dancing',
})

// サブ2
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-quicksand',
})

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html
      lang="ja"
      className={`${zenKaku.variable} ${dancingScript.variable} ${quicksand.variable}`}
    >
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
