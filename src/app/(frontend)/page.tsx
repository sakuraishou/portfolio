import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.scss'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <section>ポートフォリオ</section>
      <section>ポートフォリオ１</section>
      <section>ポートフォリオ２</section>
      <section>ポートフォリオ３</section>
      <section>ポートフォリオ４</section>
    </div>
  )
}
