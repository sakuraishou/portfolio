'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Scroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 992px)', () => {
      let st: ScrollTrigger | null = null

      const init = () => {
        const sections = gsap.utils.toArray<HTMLElement>('main > section')
        if (sections.length === 0) return false

        const scrollDistance = (sections.length - 1) * window.innerWidth

        const tl = gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: 'main',
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${scrollDistance}`,
            invalidateOnRefresh: true,
          },
        })
        st = tl.scrollTrigger ?? null
        ScrollTrigger.refresh()
        return true
      }

      if (!init()) {
        const id = setTimeout(() => {
          init()
          ScrollTrigger.refresh()
        }, 300)
        return () => {
          clearTimeout(id)
          st?.kill()
        }
      }
      return () => st?.kill()
    })

    return () => mm.revert()
  }, [])

  return <main>{children}</main>
}
