import type { Category, CategoryId, Product, ProductModel } from './laundry'

type Facet = {
  id: string
  label: string
  numeric?: boolean
  value: (product: Product, model: ProductModel) => string | undefined
}
type Match = { product: Product; models: ProductModel[] }

const modelOrder = new Intl.Collator('en-ZA', { numeric: true, sensitivity: 'base' })
const readSpec = (model: ProductModel, prefix: RegExp) =>
  model.specs.find(spec => prefix.test(spec))?.replace(prefix, '').trim()

function measure(value: string | undefined, unit: 'kg' | 'mm') {
  const match = value?.match(new RegExp(`^(\\d+(?:\\.\\d+)?)(?:\\s*(?:to|–|-)\\s*(\\d+(?:\\.\\d+)?))?\\s*${unit}$`, 'i'))
  return match && `${match[1]}${match[2] ? '–' + match[2] : ''} ${unit}` || undefined
}

function dimension(id: string, label: string, prefix: RegExp, unit: 'kg' | 'mm'): Facet {
  return { id, label, numeric: true, value: (_, model) => measure(readSpec(model, prefix), unit) }
}

function textSpec(id: string, label: string, prefix: RegExp): Facet {
  return { id, label, value: (_, model) => readSpec(model, prefix) }
}

function productType(label: string, types: string[]): Facet {
  return {
    id: 'type', label,
    value: product => types.find(type => product.name.toLowerCase().includes(type.toLowerCase())),
  }
}

function stackedCapacity(kind: 'washer' | 'dryer'): Facet {
  const label = kind === 'washer' ? 'Washer capacity (kg)' : 'Dryer capacity (kg)'
  const prefix = kind === 'washer' ? /^Washer extractor capacity:\s*/i : /^Tumble dryer load capacity:\s*/i
  return {
    id: kind, label, numeric: true,
    value: (_, model) => {
      const combined = readSpec(model, /^Washing \/ drying capacity:\s*/i)?.split('/')
      return measure(combined?.[kind === 'washer' ? 0 : 1]?.trim() ?? readSpec(model, prefix), 'kg')
    },
  }
}

const facetsByCategory: Record<CategoryId, Facet[]> = {
  'washing-machines': [
    dimension('capacity', 'Load capacity (kg)', /^Washing capacity:\s*/i, 'kg'),
    productType('Machine type', ['Coin Operated', 'Soft Mount', 'High Speed']),
  ],
  'tumble-dryers': [
    dimension('capacity', 'Load capacity (kg)', /^(?:Drying capacity|Capacity):\s*/i, 'kg'),
    productType('Dryer type', ['Heat-Pump', 'Vented']),
  ],
  'roller-irons': [
    dimension('width', 'Roller width (mm)', /^(?:Working width|Length of Roller|Roller width):?\s*/i, 'mm'),
    dimension('diameter', 'Roller diameter (mm)', /^(?:Roller Diameter|Cylinder diameter):?\s*/i, 'mm'),
  ],
  'stacked-units': [stackedCapacity('washer'), stackedCapacity('dryer')],
  'steam-presses': [
    textSpec('pressure', 'Steam pressure', /^Steam pressure:\s*/i),
    textSpec('size', 'Dimensions', /^Dimensions:\s*/i),
  ],
  feeders: [dimension('width', 'Maximum feeding width (mm)', /^Maximum feeding width:\s*/i, 'mm')],
  folders: [
    dimension('width', 'Maximum folding width (mm)', /^Maximum folding width:\s*/i, 'mm'),
    textSpec('size', 'Maximum folding size', /^Maximum folding size:\s*/i),
  ],
  'dry-cleaning-equipment': [
    dimension('capacity', 'Dry load (kg)', /^Dry load:\s*/i, 'kg'),
    textSpec('size', 'Dimensions', /^Dimensions:\s*/i),
  ],
}

export function getFacets(category: Category) {
  return facetsByCategory[category.id].flatMap(facet => {
    const options = new Set<string>()
    for (const product of category.products) {
      for (const model of product.models) {
        const value = facet.value(product, model)
        if (value) options.add(value)
      }
    }
    const compare = facet.numeric ? (a: string, b: string) => parseFloat(a) - parseFloat(b) || modelOrder.compare(a, b) : modelOrder.compare
    return options.size ? [{ ...facet, options: [...options].sort(compare) }] : []
  })
}

export function getCapacityFacet(category: Category) {
  return getFacets(category).find(facet => ['capacity', 'washer', 'dryer'].includes(facet.id))
}

export function getResults(category: Category, params: URLSearchParams): Match[] {
  const filters = getFacets(category).flatMap(facet => {
    const selected = params.get(facet.id)
    return selected && facet.options.includes(selected) ? [{ facet, selected }] : []
  })
  const query = params.get('model')?.trim().toLowerCase() ?? ''
  const results = category.products.flatMap(product => {
    const models = product.models.filter(model =>
      model.model.toLowerCase().includes(query) &&
      filters.every(({ facet, selected }) => facet.value(product, model) === selected),
    )
    return models.length ? [{ product, models }] : []
  })

  const sort = params.get('sort')
  if (sort === 'model-asc' || sort === 'model-desc') {
    const direction = sort === 'model-asc' ? 1 : -1
    for (const match of results) match.models.sort((a, b) => direction * modelOrder.compare(a.model, b.model))
    results.sort((a, b) => direction * modelOrder.compare(a.models[0].model, b.models[0].model))
  }
  const capacity = getCapacityFacet(category)
  if (capacity && (sort === 'capacity-asc' || sort === 'capacity-desc')) {
    const direction = sort === 'capacity-asc' ? 1 : -1
    const value = (product: Product, model: ProductModel) => parseFloat(capacity.value(product, model) ?? '')
    const compare = (a: number, b: number) => {
      if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1
      if (Number.isNaN(b)) return -1
      return direction * (a - b)
    }
    for (const match of results) match.models.sort((a, b) => compare(value(match.product, a), value(match.product, b)))
    results.sort((a, b) => compare(value(a.product, a.models[0]), value(b.product, b.models[0])))
  }
  return results
}

export function transferableFilters(params: URLSearchParams, category: Category) {
  const retained = new URLSearchParams()
  for (const facet of getFacets(category)) {
    const value = params.get(facet.id)
    if (value && facet.options.includes(value)) retained.set(facet.id, value)
  }
  const sort = params.get('sort')
  if (sort?.startsWith('model-') || (sort?.startsWith('capacity-') && getCapacityFacet(category))) retained.set('sort', sort)
  return retained.toString()
}



