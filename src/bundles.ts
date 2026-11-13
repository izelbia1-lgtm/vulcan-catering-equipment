export type Bundle = {
  id: string
  name: string
  category: 'laundry' | 'cooking'
  image: string
  accessoriesImage?: string
  description: string
  purchaseCents?: number
  rental?: { monthlyCents: number; months: number; includes: string }
  warranty: string
  equipment: { name: string; quantity: number; spec?: string }[]
  features: string[]
}

export const bundles: Bundle[] = [{
  id: 'miele-complete-laundry-combo',
  name: 'Miele Complete Laundry Combo',
  category: 'laundry',
  image: '/artwork/miele-laundry-combo.webp',
  accessoriesImage: '/artwork/miele-laundry-accessories.webp',
  description: 'A commercial laundry package for B&Bs, restaurants, lodges, guesthouses and boutique hotels. It combines Miele washing, drying and roller ironing equipment with laundry handling and finishing essentials.',
  purchaseCents: 18561782,
  rental: { monthlyCents: 899500, months: 36, includes: 'Includes servicing and maintenance.' },
  warranty: 'Advertised two-year warranty on laundry equipment.',
  equipment: [
    { name: 'Miele washer', quantity: 2, spec: 'PWM 507 · 7 kg each' },
    { name: 'Miele dryer', quantity: 1, spec: 'PDR 508 HP · 7 kg' },
    { name: 'Miele roller iron', quantity: 1, spec: 'HM 16-83' },
    { name: 'Laundry bin', quantity: 1, spec: '320 L' },
    { name: 'Standard stainless steel table', quantity: 1, spec: '1840 × 750 mm' },
    { name: 'Commercial ironing table', quantity: 1 },
    { name: 'Commercial hand iron', quantity: 1 },
    { name: 'Vented shelf', quantity: 1 },
  ],
  features: [
    'Honeycomb Drum helps fabrics glide without snagging.',
    'PowerWash is promoted for quick, energy-efficient washing of small loads.',
    'SteamCare helps reduce wrinkles and freshen clothes.',
    'AddLoad lets users add or remove items without cancelling the wash programme.',
  ],
}]

export const bundlePath = (id: string) => '/equipment/bundles/' + id
export const VAT_PERCENT = 15
const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
export const money = (cents: number) => currency.format(cents / 100)
