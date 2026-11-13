import { useState, type FormEvent } from 'react'
import { maxQuantity, productCartPath, useCart } from './cart'
import type { Product } from './laundry'

export function AddProductToCart({ product, model, quantity = 1 }: {
  product: Product; model: string; quantity?: number
}) {
  const { lines, add } = useCart()
  const [confirmed, setConfirmed] = useState(false)
  const path = productCartPath(`/equipment/laundry/${product.brand}/${product.category}/${product.page}`, product, model)
  const count = lines.find(line => line.path === path)?.quantity ?? 0
  return <div className="product-add">
    <button type="button" className="quote" disabled={count + quantity > maxQuantity} onClick={() => {
      add(path, quantity)
      setConfirmed(true)
    }}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h3l3 11h10l3-8H6 M9 20h.01m8 0h.01" />
      </svg>
      Add to Cart
    </button>
    <span className="product-add-status" role="status">{confirmed && count > 0 && `${count} in quote basket`}</span>
  </div>
}

export function Quantity({ value, onChange, label, min = 1 }: {
  value: number; onChange: (quantity: number) => void; label: string; min?: number
}) {
  return <div className="order-quantity" role="group" aria-label={label}>
    <button type="button" className="save-equipment" disabled={value === min} onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>−</button>
    <output aria-label={label}>{value}</output>
    <button type="button" className="save-equipment" disabled={value === maxQuantity} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>+</button>
  </div>
}

export function QuoteEmailForm({ subject, items, quantity }: { subject: string; items: string[]; quantity?: number }) {
  const [contactDetails, setContactDetails] = useState<string[]>([])
  const draft = contactDetails.length
    ? `mailto:vulcan@vulcan.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent([...items, ...contactDetails].join('\r\n'))}`
    : ''
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setContactDetails([
      ...(quantity === undefined ? [] : [`Requested quantity: ${fields.get('quantity')}`]),
      '',
      `Name: ${fields.get('name')}`,
      `Company: ${fields.get('company')}`,
      `Email: ${fields.get('email')}`,
      `Phone: ${fields.get('phone')}`,
      `Additional requirements: ${fields.get('requirements')}`,
    ])
  }
  return <form className="quote-form" onSubmit={prepare} onChange={() => setContactDetails([])}>
    <p>Prepare an email to Vulcan. You can review and send it from your email app.</p>
    <div className="quote-fields">
      <label>Customer name<input name="name" autoComplete="name" required pattern={String.raw`.*\S.*`} maxLength={120} /></label>
      <label>Company name<input name="company" autoComplete="organization" required pattern={String.raw`.*\S.*`} maxLength={160} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={25} onChange={event => {
        const field = event.currentTarget
        const valid = /^\+?[\d ().-]+$/.test(field.value) && /^\d{7,15}$/.test(field.value.replace(/\D/g, ''))
        field.setCustomValidity(!field.value || valid ? '' : 'Enter a phone number with 7 to 15 digits.')
      }} /></label>
      {quantity !== undefined && <label>Requested quantity<input name="quantity" type="number" min="1" max={maxQuantity} step="1" defaultValue={quantity} required /></label>}
      <label className="quote-wide">Additional requirements (optional)<textarea name="requirements" rows={3} maxLength={1000} /></label>
    </div>
    <button type="submit" className="quote">Prepare email</button>
    {draft && <p role="status"><a className="quote" href={draft}>Open email draft</a> <span>Ready to review in your email app.</span></p>}
  </form>
}
