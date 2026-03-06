import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import FirstView from '@/components/Sections/FirstView'
import About from '@/components/Sections/About'
import './styles.scss'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <>
      <FirstView />
      <About />
      <section>ポートフォリオ２</section>
      <section>ポートフォリオ３</section>
      <section>ポートフォリオ４</section>
    </>
  )
}
