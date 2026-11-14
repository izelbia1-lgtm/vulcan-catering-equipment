import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { getCapacityFacet, getFacets, getResults, transferableFilters } from './catalogue-filters'
import { AddProductToCart, Quantity } from './OrderControls'
import './product-shopping.css'
import { EquipmentIcon } from './EquipmentIcon'
import { catalogueDivisions, catalogueMedia, laundryTypes, type Brand, type Category, type Product, type ProductModel } from './laundry'

const root = '/equipment'
const divisionHref = (id: string) => `${root}/${id}`
function QuoteForm({ product, model, brand, dialog, quantity }: {
  product: Product
  model: ProductModel
  brand: string
  quantity: number
  dialog: React.RefObject<HTMLDialogElement | null>
}) {
  const [submitted, setSubmitted] = useState(false)
  const productLabel = `${brand} ${product.name}`
  return <dialog ref={dialog} aria-labelledby="quote-title" onClose={event => {
    const form = event.currentTarget.querySelector<HTMLFormElement>('.quote-form')
    form?.reset()
    form?.querySelector<HTMLInputElement>('[name="phone"]')?.setCustomValidity('')
    setSubmitted(false)
  }}>
    <div className="dialog-head">
      <p className="eyebrow">Demonstration</p>
      <form method="dialog"><button aria-label="Close quotation form">×</button></form>
    </div>
    <h2 id="quote-title">Request a Quote</h2>
    {submitted ? <p role="status">Demonstration submitted. No quotation request was sent to Vulcan.</p> :
      <form className="quote-form" onSubmit={event => { event.preventDefault(); setSubmitted(true) }}>
        <p>Preview an enquiry for this model.</p>
        <div className="quote-fields">
          <label>Customer name<input name="customer" autoComplete="name" required pattern={String.raw`.*\S.*`} maxLength={120} /></label>
          <label>Company name<input name="company" autoComplete="organization" required pattern={String.raw`.*\S.*`} maxLength={160} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={25}
            onChange={event => {
              const input = event.currentTarget
              const digits = input.value.replace(/\D/g, '')
              const valid = /^\+?[\d ().-]+$/.test(input.value) && digits.length >= 7 && digits.length <= 15
              input.setCustomValidity(!input.value || valid ? '' : 'Enter a phone number with 7 to 15 digits.')
            }} /></label>
          <label className="quote-wide">Product<input name="product" value={productLabel} readOnly /></label>
          <label>Model<input name="model" value={model.model} readOnly /></label>
          <label>Quantity<input key={quantity} name="quantity" type="number" min="1" step="1" defaultValue={quantity} required /></label>
          <label className="quote-wide">Additional requirements <span>(optional)</span><textarea name="requirements" rows={3} maxLength={2000} /></label>
        </div>
        <button className="quote" type="submit">Submit demonstration</button>
      </form>}
  </dialog>
}

function ProductDetails({ product, brand }: { product: Product; brand: string }) {
  const [params, setParams] = useSearchParams()
  const { state } = useLocation()
  const model = product.models.find(item => item.model === params.get('variant')) ?? product.models[0]
  const [quantity, setQuantity] = useState(1)
  const [photoIndex, setPhotoIndex] = useState(1)
  const dialog = useRef<HTMLDialogElement>(null)
  return <>
    <div className="product-detail">
      <div>
        <div className="detail-photo"><img src={catalogueMedia(product, 'photo', photoIndex)} alt={`${brand} ${product.name}, catalogue view ${photoIndex}`} /></div>
        {product.photos > 1 && <div className="photo-strip" aria-label="Product photographs">
          {Array.from({ length: product.photos }, (_, i) => <button type="button" key={i}
            aria-label={`View photograph ${i + 1}`} aria-pressed={photoIndex === i + 1} onClick={() => setPhotoIndex(i + 1)}>
            <img src={catalogueMedia(product, 'photo', i + 1)} alt="" />
          </button>)}
        </div>}
      </div>
      <div>
        <section className="product-shopping" aria-label="Shopping options">
        <p className="eyebrow">{brand}</p>
        <h2>{product.name}</h2>
        {product.models.length > 1 ? <div className="model-picker"><label htmlFor="catalogue-model">Model</label>
          <select id="catalogue-model" value={model.model} onChange={event => setParams({ variant: event.currentTarget.value }, { replace: true, state })}>
            {product.models.map(variant => <option key={variant.model} value={variant.model}>{variant.model}</option>)}
          </select>
        </div> : <p className="model-number">{model.model}</p>}
        <p className="product-price-note">Price on request · Quote basket</p>
        <Quantity value={quantity} onChange={setQuantity} label="Product quantity" />
        <AddProductToCart key={model.model} product={product} model={model.model} quantity={quantity} />
        <button type="button" className="save-equipment product-secondary-action" onClick={() => dialog.current?.showModal()}>Request a Quote</button>
        </section>
        <h3>Technical specifications</h3>
        <ul className="spec-list">{model.specs.map(spec => <li key={spec}>{spec}</li>)}</ul>
        {product.features?.length ? <>
          <h3>Features</h3>
          <ul className="features">{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
        </> : null}
      </div>
    </div>
    {product.technicalTables && <section className="technical-tables" aria-label="Full catalogue technical data">
      <h3>Full catalogue technical data</h3>
      {Array.from({ length: product.technicalTables }, (_, i) => {
        const src = catalogueMedia(product, 'technical', i + 1)
        return <a href={src} key={src} target="_blank" rel="noreferrer" aria-label={`Open technical data table ${i + 1} full size in a new tab`}>
          <img src={src} alt={`Technical data for ${product.name}, table ${i + 1}`} loading="lazy" />
        </a>
      })}
    </section>}
    <p className="source-note">Vulcan Laundry Equipment Catalogue, Edition 1 · PDF page {product.page}</p>
    <QuoteForm product={product} model={model} brand={brand} dialog={dialog} quantity={quantity} />
  </>
}


function CategoryProducts({ category, categoryPath, brands }: { category: Category; categoryPath: string; brands?: Brand[] }) {
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(() => !matchMedia('(max-width: 680px)').matches)
  const [comparison, setComparison] = useState<{ product: Product; model: ProductModel }[]>([])
  const comparisonDialog = useRef<HTMLDialogElement>(null)
  const availableBrands = brands?.filter(brand => category.products.some(product => product.brand === brand.id))
  const selectedBrand = availableBrands?.find(brand => brand.id === params.get('brand'))
  const inventory = selectedBrand
    ? { ...category, products: category.products.filter(product => product.brand === selectedBrand.id) }
    : category
  const facets = getFacets(inventory)
  const results = getResults(inventory, params)
  const capacity = getCapacityFacet(inventory)
  const modelQuery = params.get('model') ?? ''
  const listSearch = params.toString()
  const filterCount = Number(Boolean(modelQuery.trim())) + Number(Boolean(selectedBrand)) +
    facets.filter(facet => facet.options.includes(params.get(facet.id) ?? '')).length

  function update(id: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(id, value)
    else next.delete(id)
    setParams(next, { replace: true })
  }

  function clearFilters() {
    const sort = params.get('sort')
    setParams(sort ? { sort } : {}, { replace: true })
  }

  return <>
    {availableBrands && <div className="catalogue-category"><label htmlFor="type-brand">Brand</label>
      <select id="type-brand" value={selectedBrand?.id ?? ''} onChange={event => {
        const id = event.currentTarget.value
        const nextInventory = id ? { ...category, products: category.products.filter(product => product.brand === id) } : category
        const next = new URLSearchParams(transferableFilters(params, nextInventory))
        if (id) next.set('brand', id)
        if (modelQuery) next.set('model', modelQuery)
        setParams(next, { replace: true })
      }}>
        <option value="">All brands</option>
        {availableBrands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
      </select>
    </div>}
    <details className="catalogue-filters" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>Filters{filterCount > 0 && <span>{filterCount} active</span>}</summary>
      <div className="filter-fields">
        <label>Model search
          <input type="search" value={modelQuery} onChange={event => update('model', event.currentTarget.value)} placeholder="Enter a model number" />
        </label>
        {facets.map(facet => <div key={facet.id}><label htmlFor={`filter-${facet.id}`}>{facet.label}</label>
          <select id={`filter-${facet.id}`} value={facet.options.includes(params.get(facet.id) ?? '') ? params.get(facet.id)! : ''}
            onChange={event => update(facet.id, event.currentTarget.value)}>
            <option value="">All</option>
            {facet.options.map(option => <option key={option}>{option}</option>)}
          </select>
        </div>)}
      </div>
    </details>
    <div className="results-bar">
      <div className="result-count">
        <p role="status">{results.length} {results.length === 1 ? 'matching product' : 'matching products'}</p>
        <button type="button" className="clear-filters" disabled={!filterCount} onClick={clearFilters}>Clear Filters</button>
      </div>
      <div className="sort-products"><label htmlFor="product-sort">Sort by</label>
        <select id="product-sort" value={params.get('sort') ?? ''} onChange={event => update('sort', event.currentTarget.value)}>
          <option value="">Catalogue order</option>
          <option value="model-asc">Model A–Z</option>
          <option value="model-desc">Model Z–A</option>
          {capacity && <>
            <option value="capacity-asc">Capacity smallest to largest</option>
            <option value="capacity-desc">Capacity largest to smallest</option>
          </>}
        </select>
      </div>
    </div>
    {brands && comparison.length > 0 && <div className="comparison-actions">
      <button type="button" className="quote" disabled={comparison.length < 2} onClick={() => comparisonDialog.current?.showModal()}>
        Compare products ({comparison.length}/3)
      </button>
      <button type="button" className="clear-filters" onClick={() => setComparison([])}>Clear comparison</button>
    </div>}
    {results.length ? <div className="catalogue-grid">
      {results.map(({ product, models }) => {
        const selected = models[0] !== product.models[0] ? new URLSearchParams({ variant: models[0].model }).toString() : ''
        const picked = comparison.find(item => item.product === product)
        const detail = { pathname: `${categoryPath}/${product.page}`, search: selected }
        const brand = catalogueDivisions.find(division => division.id === 'laundry')?.brands.find(item => item.id === product.brand)
        return <div className="comparison-card" key={product.page}>
          <article className="product-card">
            <Link className="card-photo" to={detail} state={{ listSearch }} aria-label={`View ${product.name}`}>
              <img src={catalogueMedia(product, 'photo')} alt="" loading="lazy" />
            </Link>
            <div className="card-copy"><span>{brand?.name}</span><strong>{product.name}</strong><span>{models.map(model => model.model).join(' · ')}</span></div>
            <div className="product-card-actions">
              <p className="product-price-note">Price on request{product.models.length > 1 && <> · Adding {models[0].model}</>}</p>
              <AddProductToCart key={models[0].model} product={product} model={models[0].model} />
              <Link className="save-equipment product-secondary-action" to={detail} state={{ listSearch }}>View Details</Link>
            </div>
          </article>
          {brands && <label><input type="checkbox" checked={Boolean(picked)} disabled={!picked && comparison.length >= 3} onChange={event => {
            const checked = event.currentTarget.checked
            setComparison(items => checked ? [...items, { product, model: models[0] }] : items.filter(item => item.product !== product))
          }} /> Compare <span className="sr-only">{product.name}</span></label>}
        </div>
      })}
    </div> : <div className="coming-soon">
      <h3>No matching products</h3>
      <p>Try a different model number or clear the filters to see all products in this category.</p>
    </div>}
    {brands && <dialog ref={comparisonDialog} className="comparison-dialog" aria-labelledby="comparison-heading">
      <div className="dialog-head"><h2 id="comparison-heading">Compare equipment</h2><form method="dialog"><button aria-label="Close comparison">×</button></form></div>
      <div className="comparison-grid">
        {comparison.map(({ product, model }) => <section key={product.page}>
          <p className="eyebrow">{brands.find(brand => brand.id === product.brand)?.name}</p>
          <h3>{product.name}</h3>
          <label>Model <select value={model.model} onChange={event => {
            const chosen = product.models.find(item => item.model === event.currentTarget.value)
            if (chosen) setComparison(items => items.map(item => item.product === product ? { product, model: chosen } : item))
          }}>{product.models.map(item => <option key={item.model}>{item.model}</option>)}</select></label>
          <ul className="spec-list">{model.specs.map(spec => <li key={spec}>{spec}</li>)}</ul>
        </section>)}
      </div>
    </dialog>}
  </>
}

export function EquipmentDivisionCards() {
  return <div className="equipment-choices">
    {catalogueDivisions.map(item => {
      const kind = item.brands.length ? 'laundry' : 'cooking'
      return <Link key={item.id} className={`equipment-choice choice-${kind}`} to={divisionHref(item.id)}>
        <span className="choice-medallion"><EquipmentIcon kind={kind} /></span>
        <span className="choice-copy">
          <strong>{item.name}</strong>
          {item.brands.length ? <span className="choice-brands">{item.brands.map(brand => <span key={brand.id}>{brand.name}</span>)}</span> :
            <span className="coming-soon-label">Coming Soon</span>}
        </span>
        <span className="card-arrow" aria-hidden="true">›</span>
      </Link>
    })}
  </div>
}

export function LaundryBrandCards() {
  const laundry = catalogueDivisions.find(item => item.id === 'laundry')
  return <div className="laundry-brand-grid">
    {laundry?.brands.map(brand => {
      const product = brand.categories[0]?.products[0]
      return <Link key={brand.id} className={`laundry-brand-card laundry-brand-${brand.id}`} to={`${divisionHref(laundry.id)}/${brand.id}`}>
        <div className="laundry-brand-copy">
          <strong>{brand.name}</strong>
          <span>{brand.categories.length} equipment categories</span>
          <span className="brand-card-action">Explore range <span aria-hidden="true">↗</span></span>
        </div>
        {product && <div className="laundry-brand-photo"><img src={catalogueMedia(product, 'photo')} alt="" loading="lazy" /></div>}
      </Link>
    })}
  </div>
}

function CategoryCards({ categories, path }: { categories: Category[]; path: string }) {
  return <div className="catalogue-grid brand-category-grid">
    {categories.map(item => <Link className="catalogue-tile brand-category-card" to={`${path}/${item.id}`} key={item.id}>
      <div className="category-photo">
        {item.products[0] && <img src={catalogueMedia(item.products[0], 'photo')} alt="" loading="lazy" />}
      </div>
      <div className="category-card-copy">
        <div><strong>{item.name}</strong><span>{item.products.length} {item.products.length === 1 ? 'product' : 'products'}</span></div>
        <span className="card-arrow" aria-hidden="true">›</span>
      </div>
    </Link>)}
  </div>
}
export function Catalogue() {
  const heading = useRef<HTMLHeadingElement>(null)
  const navigate = useNavigate()
  const { pathname, search, state } = useLocation()
  const { divisionId, brandId, categoryId, productId } = useParams()
  const division = catalogueDivisions.find(item => item.id === divisionId)
  const byType = division?.id === 'laundry' && brandId === 'type'
  const laundryLanding = division?.id === 'laundry' && !brandId
  const brand = division?.brands.find(item => item.id === brandId)
  const canonicalCategory = categoryId === 'stacked-washer-dryer-units' ? 'stacked-units' : categoryId
  const category = (byType ? laundryTypes : brand?.categories)?.find(item => item.id === canonicalCategory)
  const product = category?.products.find(item => String(item.page) === productId)
  const divisionPath = division ? divisionHref(division.id) : root
  const typePath = `${divisionPath}/type`
  const brandPath = byType ? typePath : brand ? `${divisionPath}/${brand.id}` : divisionPath
  const categoryPath = category ? `${brandPath}/${category.id}` : brandPath
  const missing = Boolean((divisionId && !division) || (brandId && !brand && !byType) || (byType && !category) || (categoryId && !category) || (productId && !product))
  const title = missing ? 'Catalogue page unavailable' : product?.name ?? category?.name ?? brand?.name ?? division?.name ?? 'Vulcan'
  const listSearch = product ? state?.listSearch ?? '' : search
  const parent = product ? { pathname: categoryPath, search: listSearch } : byType || brand && !category ? divisionPath : category ? brandPath : root
  const productBrand = product && division?.brands.find(item => item.id === product.brand)

  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [pathname])

  if (!missing && categoryId !== canonicalCategory) {
    return <Navigate to={{ pathname: product ? `${categoryPath}/${product.page}` : categoryPath, search }} state={state} replace />
  }

  function categoryLink(path: string, target: Category) {
    return { pathname: `${path}/${target.id}`, search: transferableFilters(new URLSearchParams(listSearch), target) }
  }

  return <section className={`catalogue${laundryLanding && !missing ? ' laundry-landing' : ''}`} aria-labelledby="catalogue-heading">
    {(!divisionId || byType || laundryLanding) && <Link className="catalogue-back catalogue-home" to="/" aria-label="Back to homepage">
      <span aria-hidden="true">←</span> Home
    </Link>}
    {division && <>
      <Link className="catalogue-back" to={parent}><span aria-hidden="true">←</span> Back</Link>
      <nav className="catalogue-path" aria-label="Catalogue breadcrumb">
        <Link to={root}>Equipment</Link>
        {(brand || byType) && <Link to={divisionPath}>{division.id === 'laundry' ? 'Laundry' : division.name}</Link>}
        {category && brand && <Link to={brandPath}>{brand.name}</Link>}
        {product && <Link to={parent}>{category?.name}</Link>}
        {!missing && <span aria-current="page">{title}</span>}
      </nav>
    </>}
    <div className={laundryLanding && !missing ? 'laundry-masthead' : 'catalogue-masthead'}>
      {brand && <p className="eyebrow">{category ? brand.name : 'Laundry Equipment'}</p>}
      <h1 ref={heading} tabIndex={-1} id="catalogue-heading">{title}</h1>
      {laundryLanding && !missing &&
        <p>Browse commercial laundry equipment by machine type or brand. Compare models, read technical specifications, and request a quotation.</p>}
    </div>

    {missing ? <Link className="quote" to={parent}>Back to catalogue</Link> : <>
      {!division && <EquipmentDivisionCards />}

      {division && !division.brands.length && <div className="coming-soon">
        <h2>Coming Soon</h2>
        <p>Cooking equipment categories and products will be added here.</p>
      </div>}

      {division?.brands.length && brand ? <nav className="brand-nav" aria-label="Laundry brands">
        {division.brands.map(item => {
          const path = `${divisionPath}/${item.id}`
          const shared = item.categories.find(target => target.id === category?.id)
          const destination = item.id === brand?.id ? { pathname, search } : shared ? categoryLink(path, shared) : path
          return <Link key={item.id} to={destination} state={item.id === brand?.id ? state : undefined} aria-current={item.id === brand?.id ? 'true' : undefined}>
            <strong>{item.name}</strong><span>{item.categories.length} categories</span>
          </Link>
        })}
      </nav> : null}

      {laundryLanding && <section aria-labelledby="equipment-type-title">
        <h2 id="equipment-type-title">Browse by Equipment Type</h2>
        <CategoryCards categories={laundryTypes} path={typePath} />
      </section>}
      {laundryLanding && <section className="laundry-brand-section laundry-brand-secondary" aria-labelledby="brand-selection-title">
        <h2 id="brand-selection-title">Or Browse by Brand</h2>
        <nav aria-label="Laundry brands"><LaundryBrandCards /></nav>
      </section>}

      {brand && !category && <CategoryCards categories={brand.categories} path={brandPath} />}

      {brand && category && <div className="catalogue-category"><label htmlFor="category-select">Category</label>
        <select id="category-select" value={category.id} onChange={event => {
          const target = brand.categories.find(item => item.id === event.currentTarget.value)
          if (target) navigate(`${brandPath}/${target.id}`)
        }}>
          {brand.categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>}

      {category && !product && <CategoryProducts key={categoryPath} category={category} categoryPath={categoryPath} brands={byType ? division?.brands : undefined} />}
      {product && productBrand && <ProductDetails key={product.page} product={product} brand={productBrand.name} />}
    </>}
  </section>
}



