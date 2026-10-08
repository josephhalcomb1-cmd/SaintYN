import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { usePreload } from './usePreload'
import Loader from './components/Loader'
import Nav from './components/Nav'
import HeroSequence from './components/HeroSequence'
import Rack from './components/Rack'
import Story from './components/Story'
import Bag from './components/Bag'
import { scrollerRef, contentRef } from './scroller'

const MARQUEE = 'SAINT YN — OIL ON COTTON — OAKLAND, CALIFORNIA — COLLECTION Nº 01 — '

export default function App() {
  const { frames, still, progress } = usePreload()
  const [ready, setReady] = useState(false)
  const [bag, setBag] = useState([])
  const [bagOpen, setBagOpen] = useState(false)

  // Reveal once most frames are in; the rest stream in behind the hero.
  useEffect(() => {
    if (progress >= 0.6 && !ready) {
      const t = setTimeout(() => setReady(true), 350)
      return () => clearTimeout(t)
    }
  }, [progress, ready])
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 9000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      wrapper: scrollerRef.current,
      content: contentRef.current,
      lerp: 0.085,
      wheelMultiplier: 0.6,
      anchors: true,
    })
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    scrollerRef.current.style.overflowY = ready && !bagOpen ? 'auto' : 'hidden'
  }, [ready, bagOpen])

  // --vh tracks the scroller's real height; CSS vh units can be wrong inside
  // embedded frames.
  useEffect(() => {
    const el = scrollerRef.current
    const set = () => document.documentElement.style.setProperty('--vh', `${el.clientHeight / 100}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <Loader progress={progress} visible={!ready} />
      <div className="grain" aria-hidden="true" />
      <Nav count={bag.length} onBag={() => setBagOpen(true)} />
      <div className="scroller" ref={scrollerRef}>
      <div ref={contentRef}>
      <main id="top">
        <HeroSequence frames={frames} still={still} />
        <div className="marquee" aria-hidden="true">
          <div>
            <span>{MARQUEE.repeat(3)}</span>
            <span>{MARQUEE.repeat(3)}</span>
          </div>
        </div>
        <Rack
          onAdd={(item) => {
            setBag((b) => [...b, item])
            setBagOpen(true)
          }}
        />
        <Story />
      </main>
      <footer className="footer">
        <div className="footer__mark">
          <span className="intro__saint">Saint</span> YN
        </div>
        <form
          className="footer__form"
          onSubmit={(e) => {
            e.preventDefault()
            // TODO: connect to your email provider.
          }}
        >
          <label htmlFor="email" className="label">
            “BE FIRST TO THE TRUNK”
          </label>
          <div>
            <input id="email" type="email" required placeholder="Email address" autoComplete="email" />
            <button className="btn btn--light">Join</button>
          </div>
        </form>
        <p className="footer__fine">© {new Date().getFullYear()} SAINT YN — Oakland, California</p>
      </footer>
      </div>
      </div>
      <Bag
        open={bagOpen}
        items={bag}
        onClose={() => setBagOpen(false)}
        onRemove={(i) => setBag((b) => b.filter((_, j) => j !== i))}
      />
    </>
  )
}
