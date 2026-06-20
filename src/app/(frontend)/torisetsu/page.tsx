import type { Metadata } from 'next'
import Cover from '@/components/Torisetsu/Cover'
import Features from '@/components/Torisetsu/Features'
import Usage from '@/components/Torisetsu/Usage'
import Caution from '@/components/Torisetsu/Caution'
import Faq from '@/components/Torisetsu/Faq'
import Spec from '@/components/Torisetsu/Spec'
import Changelog from '@/components/Torisetsu/Changelog'
import Warranty from '@/components/Torisetsu/Warranty'

export const metadata: Metadata = {
  title: '取扱説明書',
  description:
    '桜井 翔の人柄・マインド・働き方を「取扱説明書」としてまとめたページです。スペックも人柄も、できるだけ正直に。',
}

export default function TorisetsuPage() {
  return (
    <>
      <Cover />
      <Features />
      <Usage />
      <Caution />
      <Faq />
      <Spec />
      <Changelog />
      <Warranty />
    </>
  )
}
