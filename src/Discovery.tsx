import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EquipmentIcon } from './EquipmentIcon'
import { catalogueDivisions, catalogueMedia } from './laundry'
import { bundles, bundlePath, money, VAT_PERCENT, type Bundle } from './bundles'
import { productCartPath, useCart } from './cart'
import { Quantity, QuoteEmailForm } from './OrderControls'
import { EquipmentBrandTrain } from './EquipmentBrandTrain'
import './discovery.css'

type Icon = 'rentals' | 'gallery' | 'enquiries' | 'about' | 'search' | 'cart' | 'bundles'
const glyphs: Record<Icon, string> = {
  rentals: 'M4 6h16v15H4z M4 10h16 M8 3v5m8-5v5 M8 14h3m2 0h3m-8 3h3',
  gallery: 'M3 4h18v16H3z M3 17l5-5 4 4 4-5 5 6 M15 8h.01',
  enquiries: 'M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-5 4v-4H3V5a1 1 0 011-1z M7 8h10M7 12h7',
  about: 'M3 21h18M6 21V3h12v18 M9 7h1m4 0h1M9 11h1m4 0h1 M10 21v-5h4v5',
  search: 'M15.5 15.5L21 21 M17 10a7 7 0 11-14 0 7 7 0 0114 0',
  bundles: 'M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5 M12 13v8 M7.5 5.5l9 5',
  cart: 'M2 4h3l3 11h10l3-8H6 M9 20h.01m8 0h.01',
}

function Symbol({ kind }: { kind: Icon }) {
  return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={glyphs[kind]} /></svg>
}

const destinations = [
  { title: 'Laundry Equipment', caption: 'Miele and Sharing', to: '/equipment/laundry', icon: 'laundry' },
  { title: 'Cooking Equipment', caption: 'Coming Soon', to: '/equipment/cooking', icon: 'cooking' },
  { title: 'Equipment Rentals', caption: 'Rental solutions', to: '/rentals', icon: 'rentals' },
  { title: 'Equipment Bundles', caption: 'Purchase and rental options', to: '/equipment/bundles', icon: 'bundles' },
  { title: 'Gallery', caption: 'Projects & Team', to: '/gallery', icon: 'gallery' },
  { title: 'Enquiries', caption: 'Ask Our Specialists', to: '/enquiries', icon: 'enquiries' },
  { title: 'About Vulcan', caption: 'Branches & Company', to: '/about', icon: 'about' },
] as const

export function NavigationTools() {
  const { lines } = useCart()
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  return <span className="navigation-tools">
    <Link to="/search" aria-label="Search"><Symbol kind="search" /></Link>
    <Link to="/cart" className="order-cart-link" aria-label={count ? `Equipment cart, ${count} selected` : 'Equipment cart'}><Symbol kind="cart" />{count > 0 && <span className="order-cart-badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}</Link>
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
  const { lines, add } = useCart()

  const bundleResults = query ? bundles.filter(bundle => matches(query, [
    bundle.name, bundle.description, ...bundle.equipment.map(item => [item.name, item.spec].join(' ')),
  ].join(' '))) : []
  const count = products.length + pages.length + bundleResults.length
  return <DiscoveryPage title="Search Vulcan" intro="Search by product, brand, model number or service.">
    <label className="discovery-search">Search<input type="search" value={value} onChange={event =>
      setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /></label>
    {query && <p className="search-count" role="status">{count} {count === 1 ? 'result' : 'results'}</p>}
    <div className="search-results">
      {pages.map(page => <Link key={page.to} className="search-result" to={page.to}><strong>{page.title}</strong><span>{page.caption}</span></Link>)}
      {bundleResults.map(bundle => <Link key={bundle.id} className="search-result" to={bundlePath(bundle.id)}><img src={bundle.image} alt="" /><strong>{bundle.name}</strong></Link>)}
      {products.map(({ product, brand, to }) => <div className="search-product" key={to}>
        <Link className="search-result" to={to}>
          <img src={catalogueMedia(product, 'photo')} alt="" loading="lazy" />
          <span><strong>{brand} {product.name}</strong><small>{product.models.map(model => model.model).join(' · ')}</small></span>
        </Link>
        <button type="button" className="save-equipment" disabled={lines.some(line => line.path === productCartPath(to, product, product.models[0].model))} onClick={() => add(to)}>{lines.some(line => line.path === productCartPath(to, product, product.models[0].model)) ? 'Saved' : 'Save to cart'}</button>
      </div>)}
    </div>
  </DiscoveryPage>
}


const purchasableBundles = bundles.filter(bundle => bundle.purchaseCents !== undefined)
const cartItems = new Map<string, { name: string; image: string; bundle?: Bundle }>([
  ...purchasableBundles.map(bundle => [bundlePath(bundle.id), {
    name: bundle.name, image: bundle.image, bundle,
  }] as const),
  ...searchProducts.flatMap(({ product, brand, to }) => [
    [to, { name: `${brand} ${product.name}${product.models.length === 1 ? ` · ${product.models[0].model}` : ''}`, image: catalogueMedia(product, 'photo') }] as const,
    ...product.models.map(model => [`${to}?variant=${encodeURIComponent(model.model)}`, {
      name: `${brand} ${product.name} · ${model.model}`, image: catalogueMedia(product, 'photo'),
    }] as const),
  ]),
])

export function EquipmentCart() {
  const { lines, setQuantity } = useCart()
  const [requestQuote, setRequestQuote] = useState(false)
  const items = lines.flatMap(line => {
    const item = cartItems.get(line.path)
    return item ? [{ ...line, ...item }] : []
  })
  const subtotal = items.reduce((total, item) => total + (item.bundle?.purchaseCents ?? 0) * item.quantity, 0)
  const vat = Math.round(subtotal * VAT_PERCENT / 100)
  const hasQuoteOnly = items.some(item => !item.bundle)
  const quoteItems = items.map(item => `${item.quantity} × ${item.name}${item.bundle?.purchaseCents !== undefined
    ? ` (${money(item.bundle.purchaseCents)} each excl. VAT, advertised and subject to confirmation)`
    : ' (price on request)'}`)

  return <DiscoveryPage title="Equipment cart" intro="Review quantities and request a purchase quote from Vulcan.">
    {items.length === 0 ? <p>Your trolley is empty.</p> : <>
      <div className="order-cart-layout">
        <div className="search-results">{items.map(({ path, quantity, name, image, bundle }) =>
          <article className="order-cart-line" key={path}>
            <Link className="search-result" to={path}><img src={image} alt="" /><strong>{name}</strong></Link>
            {bundle?.purchaseCents !== undefined ? <>
              <p>{money(bundle.purchaseCents)} each excl. VAT · <strong>{money(bundle.purchaseCents * quantity)}</strong></p>
              <details><summary>Included equipment for {quantity} {quantity === 1 ? 'bundle' : 'bundles'}</summary>
                <ul>{bundle.equipment.map(item => <li key={item.name}>{item.quantity * quantity} × {item.name}{item.spec && ` · ${item.spec}`}</li>)}</ul>
              </details>
            </> : <p>Price on request</p>}
            <div className="bundle-actions">
              <Quantity label={`quantity for ${name}`} value={quantity} onChange={value => setQuantity(path, value)} />
              <button type="button" className="save-equipment" aria-label={`Remove ${name}`} onClick={() => setQuantity(path, 0)}>Remove</button>
            </div>
          </article>)}</div>
        <section className="bundle-panel order-cart-totals" aria-label="Estimated trolley totals">
          <h2>{hasQuoteOnly ? 'Estimate for priced items' : 'Order estimate'}</h2>
          {hasQuoteOnly && <p>Items marked “Price on request” are excluded from this estimate. Vulcan can quote for your full trolley.</p>}
          {subtotal > 0 && <>
            <dl aria-live="polite">
              <div><dt>Subtotal excl. VAT</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>VAT ({VAT_PERCENT}%)</dt><dd>{money(vat)}</dd></div>
              <div><dt>Estimated total incl. VAT</dt><dd>{money(subtotal + vat)}</dd></div>
            </dl>
            <p className="source-note">Advertised prices are subject to confirmation by Vulcan.</p>
          </>}
          <button className="quote" aria-expanded={requestQuote} aria-controls="cart-quote" onClick={() => setRequestQuote(!requestQuote)}>Request Purchase Quote</button>
        </section>
      </div>
      <section className="bundle-panel" id="cart-quote" hidden={!requestQuote}>
        {requestQuote && <><h2>Request a Purchase Quote</h2><QuoteEmailForm subject="Vulcan equipment purchase quote" items={quoteItems} /></>}
      </section>
    </>}
    <div className="company-links"><Link className="quote" to="/equipment/bundles">Browse bundles</Link><Link to="/search">Find equipment ↗</Link><Link to="/enquiries">Make an enquiry ↗</Link></div>
  </DiscoveryPage>
}
