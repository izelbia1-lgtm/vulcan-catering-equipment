import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EquipmentIcon } from './EquipmentIcon'
import { catalogueDivisions, catalogueMedia } from './laundry'
import { EquipmentBrandTrain } from './EquipmentBrandTrain'
import './discovery.css'

type Icon = 'rentals' | 'gallery' | 'enquiries' | 'about' | 'search' | 'cart'
const glyphs: Record<Icon, string> = {
  rentals: 'M4 6h16v15H4z M4 10h16 M8 3v5m8-5v5 M8 14h3m2 0h3m-8 3h3',
  gallery: 'M3 4h18v16H3z M3 17l5-5 4 4 4-5 5 6 M15 8h.01',
  enquiries: 'M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-5 4v-4H3V5a1 1 0 011-1z M7 8h10M7 12h7',
  about: 'M3 21h18M6 21V3h12v18 M9 7h1m4 0h1M9 11h1m4 0h1 M10 21v-5h4v5',
  search: 'M15.5 15.5L21 21 M17 10a7 7 0 11-14 0 7 7 0 0114 0',
  cart: 'M2 4h3l3 11h10l3-8H6 M9 20h.01m8 0h.01',
}

function Symbol({ kind }: { kind: Icon }) {
  return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={glyphs[kind]} /></svg>
}

const destinations = [
  { title: 'Laundry Equipment', caption: 'Miele and Sharing', to: '/equipment/laundry', icon: 'laundry' },
  { title: 'Cooking Equipment', caption: 'Coming Soon', to: '/equipment/cooking', icon: 'cooking' },
  { title: 'Equipment Rentals', caption: 'Rental solutions', to: '/rentals', icon: 'rentals' },
  { title: 'Gallery', caption: 'Projects & Team', to: '/gallery', icon: 'gallery' },
  { title: 'Enquiries', caption: 'Ask Our Specialists', to: '/enquiries', icon: 'enquiries' },
  { title: 'About Vulcan', caption: 'Branches & Company', to: '/about', icon: 'about' },
] as const

export function NavigationTools() {
  return <span className="navigation-tools">
    <Link to="/search" aria-label="Search"><Symbol kind="search" /></Link>
    <Link to="/cart" aria-label="Equipment cart"><Symbol kind="cart" /></Link>
  </span>
}

export function ExploreVulcan() {
  return <div className="discovery-home">
    <section className="shell explore-vulcan" aria-labelledby="explore-title">
      <h2 id="explore-title">Explore Vulcan</h2>
      <div className="discovery-grid">
        {destinations.map(({ title, caption, to, icon }) => <Link key={to} to={to} className="discovery-card" data-icon={icon}>
          <span className="discovery-icon">{icon === 'laundry' || icon === 'cooking' ? <EquipmentIcon kind={icon} /> : <Symbol kind={icon} />}</span>
          <span className="discovery-arrow" aria-hidden="true">↗</span>
          <strong>{title}</strong><span>{caption}</span>
        </Link>)}
      </div>
    </section>
    <EquipmentBrandTrain />
    <section className="shell discovery-enquiry" aria-labelledby="enquiry-title">
      <div><h2 id="enquiry-title">Looking for something specific?</h2><p>Tell us what you need for your kitchen, laundry or next project.</p></div>
      <Link className="quote" to="/enquiries">Ask our specialists <span aria-hidden="true">↗</span></Link>
    </section>
  </div>
}

const contacts = [
  ['Johannesburg', '+27 11 249 8500', '2172 Albertina Sisulu Road, Industria'],
  ['Cape Town', '+27 21 510 5010', '31 Paarden Eiland Road, Paarden Eiland'],
  ['Durban', '+27 31 569 7800', '1 Island Grove, Riverhorse Valley, Newlands East'],
  ['East London', '+27 43 722 2883', '36B Chamberlain Road, Berea'],
  ['Bloemfontein', '+27 51 430 6167', 'Unit 11, Monument Business Park, 50 Monument Road, Oranjesig'],
  ['Port Elizabeth', '+27 41 360 0807', '1 Roshan Road, Linton Grange'],
]
const email = 'vulcan@vulcan.co.za'
const service = '0860 000 309'
const dial = (phone: string) => 'tel:' + phone.replaceAll(' ', '')

function DiscoveryPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <section className="discovery-page">
    <Link className="catalogue-back" to="/">← Back to home</Link>
    <header><h1>{title}</h1><p>{intro}</p></header>
    {children}
  </section>
}

export function Rentals() {
  return <DiscoveryPage title="Equipment Rentals" intro="Tell Vulcan about your event or project, the equipment you need, and your preferred rental dates.">
    <Link className="quote" to="/enquiries?topic=rentals">Ask about rentals</Link>
  </DiscoveryPage>
}

export function Gallery() {
  return <DiscoveryPage title="Gallery" intro="Explore Vulcan’s projects, installations, events and company media.">
    <div className="discovery-grid">
      {[
        ['Completed projects', 'https://vulcan.co.za/projects/'],
        ['Equipment installations', 'https://vulcan.co.za/projects/'],
        ['Team photographs', 'https://www.instagram.com/vulcancatering/'],
        ['Events', 'https://vulcan.co.za/events/'],
        ['Vulcan video', 'https://youtu.be/1InPK-0zoEM'],
      ].map(([label, href]) => <a className="discovery-card" href={href} key={label}><span className="discovery-icon"><Symbol kind="gallery" /></span><span className="discovery-arrow" aria-hidden="true">↗</span><strong>{label}</strong></a>)}
    </div>
  </DiscoveryPage>
}

export function About() {
  return <DiscoveryPage title="About Vulcan" intro="Vulcan Catering Equipment manufactures and supplies commercial and industrial catering equipment and offers professional kitchen design and planning.">
    <div className="company-links"><a href="https://vulcan.co.za/commercial-kitchen-design-planning/">Kitchen design & planning ↗</a><a href="https://vulcan.co.za/contact-us/">Official branch directory ↗</a></div>
    <h2>Branches</h2>
    <div className="discovery-grid">{contacts.map(([city, phone, address]) => <article className="discovery-card contact-card" key={city}>
      <strong>{city}</strong><span>{address}</span><a href={dial(phone)}>{phone}</a>
    </article>)}</div>
  </DiscoveryPage>
}

export function Enquiries() {
  const [params] = useSearchParams()
  return <DiscoveryPage title="Enquiries" intro="Ask about equipment, rentals, project planning or technical support.">
    <div className="enquiry-options">
      <section className="discovery-card contact-card"><strong>Equipment and projects</strong><p>Include the equipment type or model and your project location when you get in touch.</p>
        <a className="quote" href={`mailto:${email}?subject=${encodeURIComponent(params.get('topic') === 'rentals' ? 'Equipment rental enquiry' : 'Equipment enquiry')}`}>Open email draft ↗</a>
        <a href={dial(contacts[0][1])}>{contacts[0][1]}</a>
      </section>
      <section className="discovery-card contact-card"><strong>Technical support</strong><p>For service and after-sales assistance, contact the National Service Desk.</p><a href={dial(service)}>{service}</a></section>
    </div>
  </DiscoveryPage>
}

const searchProducts = catalogueDivisions.flatMap(division => division.brands.flatMap(brand =>
  brand.categories.flatMap(category => category.products.map(product => ({
    product, brand: brand.name, category: category.name,
    to: `/equipment/${division.id}/${brand.id}/${category.id}/${product.page}`,
  }))),
))
const matches = (query: string, content: string) => query.split(/\s+/).every(word => content.toLowerCase().includes(word))

export function Search() {
  const [params, setParams] = useSearchParams()
  const value = params.get('q') ?? ''
  const query = value.trim().toLowerCase()
  const pages = query ? destinations.filter(page => matches(query, page.title + ' ' + page.caption)) : []
  const products = query ? searchProducts.filter(({ product, brand, category }) =>
    matches(query, [product.name, brand, category, ...product.models.map(model => model.model)].join(' '))) : []
  const [saved, setSaved] = useState(readSaved)

  const count = products.length + pages.length
  return <DiscoveryPage title="Search Vulcan" intro="Search by product, brand, model number or service.">
    <label className="discovery-search">Search<input type="search" value={value} onChange={event =>
      setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /></label>
    {query && <p className="search-count" role="status">{count} {count === 1 ? 'result' : 'results'}</p>}
    <div className="search-results">
      {pages.map(page => <Link key={page.to} className="search-result" to={page.to}><strong>{page.title}</strong><span>{page.caption}</span></Link>)}
      {products.map(({ product, brand, to }) => <div className="search-product" key={to}>
        <Link className="search-result" to={to}>
          <img src={catalogueMedia(product, 'photo')} alt="" loading="lazy" />
          <span><strong>{brand} {product.name}</strong><small>{product.models.map(model => model.model).join(' · ')}</small></span>
        </Link>
        <button type="button" className="save-equipment" disabled={saved.includes(to)} onClick={() => {
          const next = [...saved, to]
          writeSaved(next)
          setSaved(next)
        }}>{saved.includes(to) ? 'Saved' : 'Save to cart'}</button>
      </div>)}
    </div>
  </DiscoveryPage>
}

const cartKey = 'vulcan-equipment-shortlist'
function readSaved(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(cartKey) ?? '[]')
    if (Array.isArray(stored)) return stored.filter(value => searchProducts.some(product => product.to === value))
  } catch { /* A new shortlist can still be used. */ }
  return []
}
function writeSaved(items: string[]) {
  try { localStorage.setItem(cartKey, JSON.stringify(items)) } catch { /* Storage may be unavailable. */ }
}

export function EquipmentCart() {
  const [saved, setSaved] = useState(readSaved)
  return <DiscoveryPage title="Equipment cart" intro="Use your shortlist to revisit equipment before making an enquiry.">
    {saved.length === 0 ? <p>Your shortlist is empty. Use search to find and save equipment.</p> :
      <div className="search-results">{searchProducts.filter(item => saved.includes(item.to)).map(({ product, brand, to }) =>
        <div className="search-product" key={to}><Link className="search-result" to={to}><strong>{brand} {product.name}</strong></Link>
          <button type="button" className="save-equipment" aria-label={`Remove ${brand} ${product.name}`} onClick={() => {
            const next = saved.filter(item => item !== to)
            writeSaved(next)
            setSaved(next)
          }}>Remove</button>
        </div>)}</div>}
    <div className="company-links"><Link className="quote" to="/search">Find equipment</Link><Link to="/enquiries">Make an enquiry ↗</Link></div>
  </DiscoveryPage>
}


