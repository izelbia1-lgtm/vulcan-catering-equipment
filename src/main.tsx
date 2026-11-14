import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useKitchenAnimation } from './animation'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router'
import { CartProvider } from './cart'
import { EquipmentBundles, QuickSetupChoice } from './EquipmentBundles'
import { Catalogue } from './Catalogue'
import { ComingSoon, Enquiries, EquipmentCart, ExploreVulcan, NavigationTools, Search } from './Discovery'
import { paintFlare } from './flare'
import { EquipmentIcon } from './EquipmentIcon'
import { KitchenInteractions } from './KitchenInteractions'
import { PanFood } from './PanFood'
import { ChefStarburst } from './ChefStarburst'
import { CompanyFooter } from './CompanyFooter'
import './style.css'
import './premium.css'
import './commerce-theme.css'
import './mobile.css'
import './black-theme.css'

function Kitchen() {
  const animation = useKitchenAnimation()
  const fireAudio = useRef<HTMLAudioElement>(null)
  const tap = useRef<{ at: number; x: number; y: number } | null>(null)
  const [muted] = useState(() => {
    try { return localStorage.getItem('vulcan-kitchen-muted') === 'true' } catch { return false }
  })

  useEffect(() => {
    const audio = fireAudio.current
    if (!audio || !animation.playing) return
    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [animation.playing])

  function triggerFire() {
    animation.triggerFire()
    const audio = fireAudio.current
    if (!muted && audio) {
      audio.currentTime = 0
      void audio.play().catch(() => {})
    }
  }

  return <section aria-label="Interactive kitchen" className="kitchen">
    <audio ref={fireAudio} src={`${import.meta.env.BASE_URL}artwork/chef-fire-whoosh.wav`} preload="auto" />
    <div className="scene">
      <div className="stage">
        {animation.kitchen ? <img className="kitchen-image" src={animation.kitchen.src} alt="Illustrated Vulcan commercial kitchen" /> :
          <div className="floorplan">Kitchen artwork unavailable</div>}
        {animation.kitchen && <KitchenInteractions muted={muted} />}
        {animation.frames && <>
          {animation.frames.map((frame, index) => <img key={frame.src} className="chef" src={frame.src} alt="" hidden={index !== animation.frameIndex} />)}
          <PanFood index={animation.frameIndex} />
          <div className="chef-speech">
            <div className="speech-anchor" role="status">{animation.speech && <ChefStarburst />}</div>
          </div>
          {animation.frameIndex >= 8 && animation.frameIndex <= 10 && <div className="flare-anchor" aria-hidden="true">
            <div className="flare" data-pose={animation.frameIndex + 1}>
              <canvas width={168} height={282} ref={paintFlare} />
            </div>
          </div>}
          <button type="button" className="chef-target" aria-label="Chef and cooking station. Double-tap, or use Enter to play the fire reaction." aria-disabled={animation.playing} onClick={event => {
            if (animation.playing) return
            if (event.detail === 0) {
              triggerFire()
              return
            }
            const now = performance.now()
            const previous = tap.current
            if (previous && now - previous.at <= 450 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 44) {
              tap.current = null
              triggerFire()
            } else {
              tap.current = { at: now, x: event.clientX, y: event.clientY }
            }
          }} />
        </>}
      </div>

    </div>
  </section>
}

function EquipmentNavigation() {
  return <nav className="equipment-nav" aria-label="Main navigation">
    <NavLink to="/equipment/cooking"><EquipmentIcon kind="cooking" />Cooking Equipment</NavLink>
    <NavLink to="/equipment/laundry"><EquipmentIcon kind="laundry" />Laundry Equipment</NavLink>
    <NavigationTools />
  </nav>
}

function Wordmark() {
  return <>
    <span className="brand-emblem" aria-hidden="true">V</span>
    <strong>ULCAN</strong>
  </>
}

function KitchenHero() {
  const header = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLImageElement>(null)
  const [shape, setShape] = useState({ edge: '', surface: '' })

  useEffect(() => {
    const element = header.current
    const logo = wordmark.current
    if (!element || !logo) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')

    function fade() {
      if (!element) return
      const { top, height } = element.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (-top / height - .1) / .8))
      element.style.opacity = motion.matches ? '1' : String(1 - progress)
    }

    const layout = () => {
      const bounds = element.getBoundingClientRect()
      const image = logo.getBoundingClientRect()
      const width = bounds.width
      const x = image.left - bounds.left
      const y = image.top - bounds.top
      const point = (px: number, py: number) => `${x + image.width * px / 623} ${y + image.height * py / 233}`
      const shoulder = Math.max(x + image.width + 26, width * .72)
      const endY = width <= 680 ? y + image.height * .64 : Math.max(bounds.height * .49, 78)
      const lower = `C ${point(85, 217)} ${point(256, 164)} ${point(495, 164)} C ${point(585, 164)} ${shoulder - 28} ${endY} ${shoulder} ${endY} H ${width + 4}`
      setShape({
        edge: `M ${point(257, 38)} C ${point(270, 8)} ${point(247, 7)} ${point(207, 8)} C ${point(66, 9)} ${point(41, 9)} ${point(19, 88)} C ${point(-5, 180)} ${point(1, 230)} ${point(54, 214)} ${lower}`,
        surface: `M -4 -4 H ${width + 4} V ${endY} H ${shoulder} C ${shoulder - 28} ${endY} ${point(585, 164)} ${point(495, 164)} C ${point(256, 164)} ${point(85, 217)} ${point(54, 214)} Q ${point(16, 220)} -4 ${y + image.height} Z`,
      })
      fade()
    }
    const observer = new ResizeObserver(layout)
    observer.observe(element)
    observer.observe(logo)
    layout()
    window.addEventListener('scroll', fade, { passive: true })
    motion.addEventListener('change', fade)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', fade)
      motion.removeEventListener('change', fade)
    }
  }, [])

  return <section className="home-hero original-home-hero" aria-labelledby="hero-brand">
    <header className="original-home-header" ref={header}>
      <h1 className="wordmark hero-brand" id="hero-brand" aria-label="Vulcan">
        <img ref={wordmark} src={`${import.meta.env.BASE_URL}artwork/vulcan-wordmark-clean.webp`} alt="" width={623} height={233} />
      </h1>
      <div className="hero-nav"><EquipmentNavigation /></div>
      <svg className="original-home-divider" aria-hidden="true">
        <defs>
          <linearGradient id="original-trim">
            <stop stopColor="#ff836b" />
            <stop offset=".42" stopColor="#ff493e" />
            <stop offset="1" stopColor="#e52521" />
          </linearGradient>
        </defs>
        <path className="original-divider-surface" d={shape.surface} />
        <path className="original-divider-edge" d={shape.edge} />
      </svg>
    </header>
    <div className="hero-corner" aria-hidden="true" />
    <Kitchen />
  </section>
}

const companyFigures = [
  [6, '', 'National Branches'],
  [2500, '+', 'Completed Projects'],
  [12, '+', 'Countries'],
  [3000, '+', 'Products'],
] as const
const figureFormat = new Intl.NumberFormat('en-US')

function VulcanBrand() {
  const statistics = useRef<HTMLDListElement>(null)
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const section = statistics.current
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    if (!section || motion.matches || !('IntersectionObserver' in window)) return
    setProgress(0)
    let frame = 0
    let started: number | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || motion.matches) return
      observer.disconnect()
      const animate = (now: number) => {
        started ??= now
        const time = Math.min((now - started) / 1750, 1)
        setProgress(1 - (1 - time) ** 3)
        if (time < 1) frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
    }, { threshold: .2 })
    const finishOnReducedMotion = () => {
      if (!motion.matches) return
      observer.disconnect()
      cancelAnimationFrame(frame)
      setProgress(1)
    }
    observer.observe(section)
    motion.addEventListener('change', finishOnReducedMotion)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      motion.removeEventListener('change', finishOnReducedMotion)
    }
  }, [])

  return <section className="vulcan-brand" aria-labelledby="brand-title">
    <img className="brand-backdrop" src={`${import.meta.env.BASE_URL}artwork/brand-kitchen.webp`} alt="" loading="lazy" />
    <div className="shell brand-content">
      <div className="brand-heading">
        <h2 id="brand-title">The Vulcan Brand</h2>
        <p>Quality · Commitment · Innovation</p>
      </div>
      <div className="brand-cards">
        <article className="brand-intro">
          <h3>Designing for Long-Term Success</h3>
          <p>Vulcan Catering Equipment supplies commercial kitchen and laundry equipment. Explore both ranges to find equipment suited to the way your team works.</p>
        </article>
        <dl ref={statistics} className="brand-stats" aria-describedby="brand-figure-note">
          {companyFigures.map(([figure, suffix, label]) => <div key={label}>
            <dt>{label}</dt><dd>
              <span className="sr-only">{figureFormat.format(figure)}{suffix}</span>
              <span aria-hidden="true">{figureFormat.format(Math.floor(figure * progress))}{suffix}</span>
            </dd>
          </div>)}
        </dl>
      </div>
      <p className="brand-figure-note" id="brand-figure-note">Company figures pending confirmation before publication.</p>
    </div>
  </section>
}

function KitchenHome() {
  const { hash } = useLocation()
  if (hash === '#equipment' || hash.startsWith('#equipment/')) return <Navigate to={hash.slice(1)} replace />

  return <>
    <KitchenHero />
    <VulcanBrand />
    <ExploreVulcan />
  </>
}

function App() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return <>
    <a className="skip" href="#main">Skip to content</a>
    {!home && <header className="top">
      <div className="shell header-row">
        <Link className="wordmark" to="/" aria-label="Vulcan home"><Wordmark /></Link>
        <EquipmentNavigation />
      </div>
    </header>}
    <main id="main" className={home ? 'home-main' : 'shell commerce-theme'}>
      <Routes>
        <Route path="/" element={<KitchenHome />} />
        <Route path="/quick-set-up" element={<QuickSetupChoice />} />
        <Route path="/equipment/bundles/:bundleId?" element={<EquipmentBundles />} />
        <Route path="/equipment/:divisionId?/:brandId?/:categoryId?/:productId?" element={<Catalogue />} />
        <Route path="/rentals" element={<ComingSoon title="Equipment Rentals" />} />
        <Route path="/gallery" element={<ComingSoon title="Gallery" />} />
        <Route path="/enquiries/contact" element={<Enquiries />} />
        <Route path="/enquiries" element={<ComingSoon title="Enquiries" />} />
        <Route path="/about" element={<ComingSoon title="About Vulcan" />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<EquipmentCart />} />
        <Route path="*" element={<section className="catalogue"><h1>Page unavailable</h1><Link className="quote" to="/equipment">Browse equipment</Link></section>} />
      </Routes>
    </main>
    <CompanyFooter />
  </>
}

createRoot(document.getElementById('root')!).render(<BrowserRouter useTransitions={false}><CartProvider><App /></CartProvider></BrowserRouter>)















