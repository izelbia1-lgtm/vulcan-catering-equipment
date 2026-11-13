import products from './laundry-products.json'

export type ProductModel = { model: string; specs: string[] }
export type Product = {
  page: number
  brand: string
  category: string
  name: string
  photos: number
  models: ProductModel[]
  features?: string[]
  technicalTables?: number
}

const categoryNames = {
  'washing-machines': 'Washing Machines',
  'tumble-dryers': 'Tumble Dryers',
  'roller-irons': 'Roller Irons',
  'stacked-units': 'Stacked Units',
  'steam-presses': 'Steam Presses',
  'feeders': 'Feeders',
  'folders': 'Folders',
  'dry-cleaning-equipment': 'Dry Cleaning Equipment',
}

export type CategoryId = keyof typeof categoryNames
export type Category = { id: CategoryId; name: string; products: Product[] }
export type Brand = { id: string; name: string; categories: Category[] }
export type Division = { id: string; name: string; brands: Brand[] }

function makeBrand(id: string, name: string, categories: CategoryId[]): Brand {
  return {
    id, name,
    categories: categories.map(category => ({
      id: category,
      name: categoryNames[category],
      products: products.filter(product => product.brand === id && product.category === category),
    })),
  }
}

export const catalogueDivisions: Division[] = [
  { id: 'cooking', name: 'Cooking Equipment', brands: [] },
  {
    id: 'laundry', name: 'Laundry Equipment', brands: [
      makeBrand('miele', 'Miele', [
        'washing-machines', 'tumble-dryers', 'roller-irons', 'stacked-units',
      ]),
      makeBrand('sharing', 'Sharing', [
        'washing-machines', 'tumble-dryers', 'roller-irons', 'stacked-units',
        'steam-presses', 'feeders', 'folders', 'dry-cleaning-equipment',
      ]),
    ],
  },
]

export const laundryTypes: Category[] = Object.entries(categoryNames).flatMap(([id, name]) => {
  const matches = products.filter(product => product.category === id)
  return matches.length ? [{ id: id as CategoryId, name, products: matches }] : []
})

export function catalogueMedia(product: Product, asset: 'photo' | 'technical', index = 1) {
  return `${import.meta.env.BASE_URL}catalogue/${product.page}-${asset}-${index}.webp`
}


