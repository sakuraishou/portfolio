import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import FirstView from '@/components/Sections/FirstView'
import About from '@/components/Sections/About'
import Skills from '@/components/Sections/Skills'
import Works from '@/components/Sections/Works'
import Contact from '@/components/Sections/Contact'
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
      <Skills />
      <Works />
      <Contact />
    </>
  )
}
