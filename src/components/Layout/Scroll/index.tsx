'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

export default function Scroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()

    mm.add('(min-width: 992px)', () => {
      gsap.to(gsap.utils.toArray('section'), {
        xPercent: -100 * (gsap.utils.toArray('section').length - 1),
        ease: 'none',
        scrollTrigger: { trigger: 'main', pin: true, scrub: 1, end: '+=3000' },
      })
    })
    return () => {
      mm.revert()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return <div className="pc-side-scroll">{children}123</div>
}
