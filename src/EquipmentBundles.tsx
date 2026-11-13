import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { bundlePath, bundles, money, type Bundle } from './bundles'
import { useCart } from './cart'
import { Quantity, QuoteEmailForm } from './OrderControls'
import './bundles.css'

const filters = [
  { id: '', label: 'All Bundles', matches: () => true },
  { id: 'laundry', label: 'Laundry Bundles', matches: (bundle: Bundle) => bundle.category === 'laundry' },
  { id: 'cooking', label: 'Cooking Equipment Bundles', matches: (bundle: Bundle) => bundle.category === 'cooking' },
  { id: 'purchase', label: 'Available for Purchase', matches: (bundle: Bundle) => bundle.purchaseCents !== undefined },
  { id: 'rental', label: 'Rental Options', matches: (bundle: Bundle) => Boolean(bundle.rental) },
]
const offerNote = 'Advertised South African pricing, subject to confirmation by Vulcan. Export pricing available on request.'

export function EquipmentBundles() {
  const { bundleId } = useParams()
  const [params, setParams] = useSearchParams()
  const filter = filters.find(item => item.id === params.get('filter')) ?? filters[0]
  const results = bundles.filter(filter.matches)
  const bundle = bundles.find(item => item.id === bundleId)
  const size = params.get('size')
  const upcoming = size === 'medium' || size === 'large' ? size : null

  return <section className="discovery-page bundles-page">
    <Link className="catalogue-back" to="/">← Back to home</Link>
    <nav className="bundle-breadcrumb" aria-label="Breadcrumb">
      <Link to="/equipment">Equipment</Link> <span aria-hidden="true">/</span>{' '}
      {bundleId ? <><Link to="/equipment/bundles">Quick Set-Up</Link> <span aria-hidden="true">/</span> <span aria-current="page">{bundle?.name ?? 'Bundle unavailable'}</span></>
        : <span aria-current="page">Quick Set-Up</span>}
    </nav>
    {bundleId ? bundle ? <BundleDetails key={bundle.id} bundle={bundle} /> : <>
      <h1>Bundle unavailable</h1><Link className="quote" to="/equipment/bundles">Browse bundles</Link>
    </> : <>
      <header><h1>Quick Set-Up</h1><p>Build your ideal laundry setup.</p></header>
      <div className="setup-sizes" role="group" aria-label="Set-up size">
        {(['small', 'medium', 'large'] as const).map(option =>
          <button key={option} type="button" className="save-equipment" aria-pressed={(upcoming ?? 'small') === option}
            onClick={() => setParams(current => {
              const next = new URLSearchParams(current)
              next.set('size', option)
              return next
            })}>{option}</button>)}
      </div>
      {upcoming ? <section className="coming-soon setup-upcoming">
        <h2>{upcoming === 'medium' ? 'Medium Set-Up — Coming Soon!' : 'Large Set-Up — Coming Soon!'}</h2>
        <p>{upcoming === 'medium'
          ? 'Looking for a medium-sized laundry solution? Our team can help you find the right equipment for your business.'
          : 'Planning a large commercial laundry operation? Contact our specialists for a tailored equipment solution.'}</p>
        <Link className="quote" to={`/enquiries/contact?topic=${upcoming}`}>Enquire Now</Link>
      </section> : <>
      <div className="brand-nav bundle-filters" role="group" aria-label="Bundle filters">{filters.map(item =>
        <button key={item.id} type="button" className="save-equipment" aria-pressed={filter.id === item.id}
          onClick={() => setParams(item.id ? { filter: item.id } : {})}>{item.label}</button>)}</div>
      <p className="search-count" role="status">{results.length} {results.length === 1 ? 'bundle' : 'bundles'}</p>
      {results.length ? <div className="bundle-grid">{results.map(item =>
        <Link className="discovery-card bundle-card" key={item.id} to={bundlePath(item.id)}>
          <img src={item.image} alt="" width="1175" height="596" />
          <div>
            <p className="eyebrow">{item.category === 'laundry' ? 'Laundry Bundle' : 'Cooking Equipment Bundle'}</p>
            <h2>{item.name}</h2>
            {item.purchaseCents !== undefined && <p>{money(item.purchaseCents)} excl. VAT</p>}
            {item.rental && <p>Rental option · {money(item.rental.monthlyCents)} per month excl. VAT</p>}
            <span className="bundle-card-action">View bundle ↗</span>
          </div>
        </Link>)}</div> : <p>No bundles match this filter. <button className="save-equipment" onClick={() => setParams({})}>View all bundles</button></p>}
      {results.length > 0 && <p className="source-note">{offerNote}</p>}
      </>}
    </>}
  </section>
}

function BundleDetails({ bundle }: { bundle: Bundle }) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [enquiry, setEnquiry] = useState<'rental' | 'general' | null>(null)
  const { rental } = bundle
  return <>
    <header><h1>{bundle.name}</h1><p>{bundle.description}</p></header>
    <div className="bundle-detail">
      <div>
        <img className="bundle-hero-image" src={bundle.image} alt="Miele laundry machines and roller iron from the Vulcan offer" width="1175" height="596" />
        {bundle.accessoriesImage && <img className="bundle-hero-image" src={bundle.accessoriesImage} alt="Laundry bin, shelving, stainless steel table, ironing table and hand iron" width="1095" height="151" />}
      </div>
      <section className="bundle-panel" aria-label="Purchase and rental options">
        {bundle.purchaseCents !== undefined && <>
          <h2>Purchase the bundle</h2>
          <p className="bundle-price">{money(bundle.purchaseCents)} <small>excl. VAT</small></p>
          <div className="bundle-actions">
            <Quantity value={quantity} onChange={value => { setQuantity(value); setAdded(false) }} label="Bundle quantity" />
            <button className="quote" onClick={() => { add(bundlePath(bundle.id), quantity); setAdded(true) }}>Add to Cart</button>
          </div>
          {added && <p role="status">Bundle added to your trolley. <Link className="bundle-card-action" to="/cart">View trolley ↗</Link></p>}
        </>}
        {rental && <div className="bundle-rental">
          <h2>Rental option</h2>
          <p className="bundle-price">{money(rental.monthlyCents)} <small>per month excl. VAT</small></p>
          <p>{rental.months} months. {rental.includes}</p>
        </div>}
        <p className="source-note">{offerNote}</p>
        <div className="bundle-actions">
          {rental && <button className="save-equipment" aria-expanded={enquiry === 'rental'} aria-controls="bundle-enquiry" onClick={() => setEnquiry(enquiry === 'rental' ? null : 'rental')}>Request Rental Quote</button>}
          <button className="save-equipment" aria-expanded={enquiry === 'general'} aria-controls="bundle-enquiry" onClick={() => setEnquiry(enquiry === 'general' ? null : 'general')}>Enquiry</button>
        </div>
      </section>
    </div>
    <section className="bundle-panel" id="bundle-enquiry" hidden={!enquiry}>
      {enquiry && <>
        <h2>{enquiry === 'rental' ? 'Request a Rental Quote' : 'Bundle enquiry'}</h2>
        <p>{bundle.name}</p>
        {enquiry === 'rental' && rental && <p>{money(rental.monthlyCents)} per bundle per month excl. VAT · {rental.months} months. {rental.includes}</p>}
        <QuoteEmailForm key={enquiry} quantity={quantity} subject={`${enquiry === 'rental' ? 'Rental quote' : 'Equipment enquiry'} — ${bundle.name}`}
          items={[bundle.name, ...(enquiry === 'rental' && rental
            ? [`Advertised rental: ${money(rental.monthlyCents)} per bundle per month excl. VAT for ${rental.months} months. ${rental.includes}`, offerNote] : [])]} />
      </>}
    </section>
    <section className="bundle-panel bundle-inclusions">
      <h2>What’s included</h2>
      <ul className="spec-list">{bundle.equipment.map(item =>
        <li key={item.name}><strong>{item.quantity} × {item.name}</strong>{item.spec && <span>{item.spec}</span>}</li>)}</ul>
      <h2>Warranty</h2><p>{bundle.warranty}</p>
      {bundle.features.length > 0 && <>
        <h2>Miele features highlighted in the flyer</h2>
        <ul className="features">{bundle.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </>}
    </section>
  </>
}
