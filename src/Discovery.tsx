import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EquipmentIcon } from './EquipmentIcon'
import { catalogueDivisions, catalogueMedia, laundryTypes } from './laundry'
import { bundles, bundlePath, money, VAT_PERCENT, type Bundle } from './bundles'
import { useCart } from './cart'
import { createEquipmentSearch, type SearchEntry } from './equipment-search'
import { AddProductToCart, Quantity, QuoteEmailForm } from './OrderControls'
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
  { title: 'Equipment Rentals', caption: 'Coming Soon', to: '/rentals', icon: 'rentals' },
  { title: 'Quick Set-Up', caption: 'Laundry and kitchen setups', to: '/quick-set-up', icon: 'bundles' },
  { title: 'Gallery', caption: 'Coming Soon', to: '/gallery', icon: 'gallery' },
  { title: 'Enquiries', caption: 'Coming Soon', to: '/enquiries', icon: 'enquiries' },
  { title: 'About Vulcan', caption: 'Coming Soon', to: '/about', icon: 'about' },
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
      <section className="quick-setup-feature" aria-labelledby="quick-setup-title">
        <span className="discovery-icon">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.9a1 1 0 0 1 1.53-.85l11.1 7.1a1 1 0 0 1 0 1.7l-11.1 7.1A1 1 0 0 1 7 19.1Z" />
          </svg>
        </span>
        <div><h3 id="quick-setup-title">Quick Set-Up</h3><p>Build your ideal set up</p></div>
        <Link className="quote" to="/quick-set-up">Explore Quick Set-Up</Link>
      </section>
      <div className="discovery-grid">
        {destinations.filter(item => item.icon !== 'bundles').map(({ title, caption, to, icon }) => <Link key={to} to={to} className="discovery-card" data-icon={icon}>
          <span className="discovery-icon">{icon === 'laundry' || icon === 'cooking' ? <EquipmentIcon kind={icon} /> : <Symbol kind={icon} />}</span>
          <span className="discovery-arrow" aria-hidden="true">↗</span>
          <strong>{title}</strong><span>{caption}</span>
        </Link>)}
      </div>
    </section>
    <EquipmentBrandTrain />
    <section className="shell discovery-enquiry" aria-labelledby="enquiry-title">
      <div><h2 id="enquiry-title">Looking for something specific?</h2><p>Tell us what you need for your kitchen, laundry or next project.</p></div>
      <Link className="quote" to="/enquiries/contact">Ask our specialists <span aria-hidden="true">↗</span></Link>
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

export function ComingSoon({ title }: { title: string }) {
  return <DiscoveryPage title={title} intro="">
    <section className="coming-soon">
      <h2>Coming Soon</h2>
      <Link className="quote" to="/enquiries/contact">Contact Vulcan</Link>
    </section>
  </DiscoveryPage>
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
  const topic = params.get('topic')
  const kitchenSizes = { 'kitchen-small': 'Small', 'kitchen-medium': 'Medium', 'kitchen-large': 'Large' } as const
  const kitchenSize = topic && Object.hasOwn(kitchenSizes, topic) ? kitchenSizes[topic as keyof typeof kitchenSizes] : null
  const setup = kitchenSize ? `${kitchenSize} kitchen` : topic === 'medium' ? 'Medium laundry' : topic === 'large' ? 'Large laundry' : null
  const subject = setup ? `${setup} set-up enquiry` : topic === 'rentals' ? 'Equipment rental enquiry' : 'Equipment enquiry'
  return <DiscoveryPage title="Enquiries" intro="Ask about equipment, rentals, project planning or technical support.">
    {setup && <section className="bundle-panel">
      <h2>{subject}</h2>
      <QuoteEmailForm key={subject} subject={subject} items={[`Requested set-up: ${setup}`]} />
    </section>}
    <div className="enquiry-options">
      <section className="discovery-card contact-card"><strong>Equipment and projects</strong><p>Include the equipment type or model and your project location when you get in touch.</p>
        <a className="quote" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>Open email draft ↗</a>
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
type SearchDestination = { to: string; image?: string; product?: (typeof searchProducts)[number]['product'] }
const searchable: SearchEntry<SearchDestination>[] = [
  ...searchProducts.map(({ product, brand, category, to }) => ({
    label: `${brand} ${product.name}`, kind: 'Product' as const,
    data: { to, product, image: catalogueMedia(product, 'photo') },
    keywords: [category], models: product.models.map(model => model.model),
    details: [...(product.features ?? []), ...product.models.flatMap(model => model.specs)],
  })),
  ...catalogueDivisions.flatMap(division => division.brands.map(brand => ({
    label: brand.name, kind: 'Brand' as const, data: { to: `/equipment/${division.id}/${brand.id}` },
  }))),
  ...laundryTypes.map(category => ({
    label: category.name, kind: 'Category' as const, data: { to: `/equipment/laundry/type/${category.id}` },
  })),
  ...destinations.map(page => ({
    label: page.title, kind: 'Page' as const, data: { to: page.to }, keywords: [page.caption],
  })),
  ...bundles.map(bundle => ({
    label: bundle.name, kind: 'Bundle' as const, data: { to: bundlePath(bundle.id), image: bundle.image },
    details: [bundle.description, ...bundle.features, ...bundle.equipment.map(item => [item.name, item.spec].join(' '))],
  })),
]
const searchEquipment = createEquipmentSearch(searchable)
const resultPath = (path: string, model?: string) => model ? `${path}?variant=${encodeURIComponent(model)}` : path

export function Search() {
  const [params, setParams] = useSearchParams()
  const [suggesting, setSuggesting] = useState(false)
  const value = params.get('q') ?? ''
  const { hits, correction } = searchEquipment(value)
  const suggestions = hits.slice(0, 6)
  return <DiscoveryPage title="Search Vulcan" intro="Search by product, brand, model number or service.">
    <div className="equipment-search-box" onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setSuggesting(false)
    }}>
      <label className="discovery-search">Search<input type="search" value={value} onFocus={() => setSuggesting(true)}
        onKeyDown={event => {
          if (event.key === 'Escape' || event.key === 'Enter') setSuggesting(false)
        }}
        onChange={event => {
          setSuggesting(true)
          setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })
        }} /></label>
      {suggesting && value.trim().length >= 2 && suggestions.length > 0 && <nav className="search-results search-suggestions" aria-label="Search suggestions">
        {suggestions.map(({ entry, model }) => <Link className="search-result" key={entry.data.to} to={resultPath(entry.data.to, model)}>
          {entry.data.image && <img src={entry.data.image} alt="" />}
          <span><strong>{entry.label}</strong><small>{entry.kind}{model && ' · ' + model}</small></span>
        </Link>)}
      </nav>}
    </div>
    {correction && <p className="search-correction">Did you mean: <Link to={{ search: new URLSearchParams({ q: correction }).toString() }} onClick={() => setSuggesting(false)}>{correction}?</Link></p>}
    {value.trim() && <p className="search-count" role="status">
      {hits.length ? `${hits.length} ${hits.length === 1 ? 'result' : 'results'}${correction ? ' for “' + correction + '”' : ''}`
        : 'We couldn’t find matching equipment. Try a brand, model or equipment type.'}
    </p>}
    {value.trim() && !hits.length && <Link className="quote" to="/enquiries/contact">Contact Vulcan for assistance</Link>}
    <div className="search-results">
      {hits.map(({ entry, model }) => {
        const { to, image, product } = entry.data
        const selectedModel = model ?? product?.models[0].model
        const link = <Link className="search-result" to={resultPath(to, model)}>
          {image && <img src={image} alt="" loading="lazy" />}
          <span><strong>{entry.label}</strong><small>{product ? selectedModel + ' · Price on request' : entry.kind}</small></span>
        </Link>
        return product && selectedModel ? <div className="search-product" key={to}>{link}
          <AddProductToCart key={selectedModel} product={product} model={selectedModel} />
        </div> : <div key={to}>{link}</div>
      })}
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
  const { lines, setQuantity, updateBundle, removeBundle } = useCart()
  const [requestQuote, setRequestQuote] = useState(false)
  const items = lines.flatMap(line => {
    const item = cartItems.get(line.path)
    return item ? [{ ...line, ...item }] : []
  })
  const packages = items.flatMap(item => {
    const { bundle, bundleKey } = item
    if (!bundle || !bundleKey) return []
    const equipment = bundle.equipment.map(component => ({
      ...component, selected: item.equipment?.[component.name] ?? component.quantity,
    }))
    const customised = equipment.some(component => component.selected !== component.quantity)
    return [{ ...item, bundleKey, equipment, customised, cents: customised ? undefined : bundle.purchaseCents }]
  })
  const products = items.filter(item => !item.bundle)
  const subtotal = packages.reduce((total, item) => total + (item.cents ?? 0), 0)
  const vat = Math.round(subtotal * VAT_PERCENT / 100)
  const hasQuoteOnly = products.length > 0 || packages.some(item => item.cents === undefined)
  const quoteItems = [
    ...packages.flatMap((item, index) => [
      `Bundle ${index + 1} — ${item.name}`,
      ...item.equipment.map(component =>
        `  ${component.selected} × ${component.name}${component.spec ? ' · ' + component.spec : ''}${component.selected === 0 ? ' (removed)' : ''}`),
      item.cents === undefined ? 'Updated quote required' : `Advertised bundle subtotal: ${money(item.cents)} excl. VAT, subject to confirmation`,
      '',
    ]),
    ...(products.length ? ['Individual products', ...products.map(item => `${item.quantity} × ${item.name} (price on request)`)] : []),
  ]

  return <DiscoveryPage title="Equipment cart" intro="Review quantities and request a purchase quote from Vulcan.">
    {items.length === 0 ? <p>Your trolley is empty.</p> : <>
      <div className="order-cart-layout">
        <div className="search-results">
          {packages.map(({ path, name, image, bundleKey, equipment, customised, cents }, index) =>
            <article className="order-cart-line cart-bundle-group" key={bundleKey}>
              <Link className="search-result" to={path}><img src={image} alt="" /><h2>Bundle {index + 1} — {name}</h2></Link>
              <ul className="cart-bundle-components">
                {equipment.map(component => <li key={component.name}>
                  <div><strong>{component.name}</strong>{component.spec && <small>{component.spec}</small>}</div>
                  <Quantity min={0} value={component.selected} label={`quantity for ${component.name} in Bundle ${index + 1}`}
                    onChange={value => updateBundle(bundleKey, Object.fromEntries(equipment.map(item =>
                      [item.name, item.name === component.name ? value : item.selected])))} />
                </li>)}
              </ul>
              <p role="status">{cents === undefined ? 'Updated quote required' : `Bundle subtotal ${money(cents)} excl. VAT`}</p>
              <div className="bundle-actions">
                {customised && <button type="button" className="save-equipment" onClick={() => updateBundle(bundleKey, {})}>Restore original bundle</button>}
                <button type="button" className="save-equipment" onClick={() => removeBundle(bundleKey)}>Remove Bundle {index + 1}</button>
              </div>
            </article>)}
          {products.length > 0 && <section className="order-cart-line">
            <h2>Individual products</h2>
            {products.map(({ path, quantity, name, image }) =>
          <article className="order-cart-line" key={path}>
            <Link className="search-result" to={path}><img src={image} alt="" /><strong>{name}</strong></Link>
            <p>Price on request</p>
            <div className="bundle-actions">
              <Quantity label={`quantity for ${name}`} value={quantity} onChange={value => setQuantity(path, value)} />
              <button type="button" className="save-equipment" aria-label={`Remove ${name}`} onClick={() => setQuantity(path, 0)}>Remove</button>
            </div>
          </article>)}</section>}
        </div>
        <section className="bundle-panel order-cart-totals" aria-label="Estimated trolley totals">
          <h2>{hasQuoteOnly ? subtotal > 0 ? 'Estimate for priced items' : 'Quote required' : 'Order estimate'}</h2>
          {hasQuoteOnly && <p>Vulcan will confirm pricing for customised bundles and items marked “Price on request”.</p>}
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
    <div className="company-links"><Link className="quote" to="/equipment/bundles">Browse bundles</Link><Link to="/search">Find equipment ↗</Link><Link to="/enquiries/contact">Make an enquiry ↗</Link></div>
  </DiscoveryPage>
}
