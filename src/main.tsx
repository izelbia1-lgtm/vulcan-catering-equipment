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
  const tap = useRef<{ at: number; x: number; y: number } | null>(null)
  const [muted] = useState(() => {
    try { return localStorage.getItem('vulcan-kitchen-muted') === 'true' } catch { return false }
  })

  return <section aria-label="Interactive kitchen" className="kitchen">
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
              animation.triggerFire()
              return
            }
            const now = performance.now()
            const previous = tap.current
            if (previous && now - previous.at <= 450 && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 44) {
              tap.current = null
              animation.triggerFire()
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
    <span><strong>ULCAN</strong><small>CATERING EQUIPMENT</small></span>
  </>
}

function KitchenHero() {
  return <section className="home-hero original-home-hero" aria-labelledby="hero-brand">
    <header className="original-home-header">
      <h1 className="wordmark hero-brand" id="hero-brand" aria-label="Vulcan Catering Equipment">
        <img src={`${import.meta.env.BASE_URL}artwork/vulcan-approved-wordmark.webp`} alt="" width={623} height={233} />
      </h1>
      <div className="hero-nav"><EquipmentNavigation /></div>
      <svg className="original-home-divider" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="original-divider-surface" d="M0 0H1000V52H755C610 52 525 64 400 64C245 64 105 91 0 99Z" />
        <path className="original-divider-edge" d="M0 99C105 91 245 80 400 80C525 80 610 52 755 52H1000" />
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
        <Link className="wordmark" to="/" aria-label="Vulcan Catering Equipment home"><Wordmark /></Link>
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















