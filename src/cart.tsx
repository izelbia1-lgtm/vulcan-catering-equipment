import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from './laundry'

export function productCartPath(path: string, product: Product, model: string) {
  return product.models.length === 1 ? path : `${path}?variant=${encodeURIComponent(model)}`
}

export type CartLine = { path: string; quantity: number }
const cartKey = 'vulcan-equipment-cart'
const legacyKey = 'vulcan-equipment-shortlist'
export const maxQuantity = 9999

function readCart(): CartLine[] {
  try {
    const current = localStorage.getItem(cartKey)
    const stored: unknown = JSON.parse(current ?? localStorage.getItem(legacyKey) ?? '[]')
    if (!Array.isArray(stored)) return []
    const lines = new Map<string, number>()
    for (const item of stored) {
      const path = current === null ? item : item?.path
      const quantity = current === null ? 1 : item?.quantity
      if (typeof path === 'string' && path.startsWith('/equipment/') &&
          Number.isSafeInteger(quantity) && quantity > 0 && quantity <= maxQuantity) {
        lines.set(path, quantity)
      }
    }
    return Array.from(lines, ([path, quantity]) => ({ path, quantity }))
  } catch {
    return []
  }
}

const CartContext = createContext<{
  lines: CartLine[]
  add: (path: string, quantity?: number) => void
  setQuantity: (path: string, quantity: number) => void
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState(readCart)
  useEffect(() => {
    try { localStorage.setItem(cartKey, JSON.stringify(lines)) } catch { /* Keep the in-session cart. */ }
  }, [lines])

  return <CartContext.Provider value={{
    lines,
    add(path, quantity = 1) {
      setLines(current => current.some(line => line.path === path)
        ? current.map(line => line.path === path ? { path, quantity: Math.min(maxQuantity, line.quantity + quantity) } : line)
        : [...current, { path, quantity }])
    },
    setQuantity(path, quantity) {
      setLines(current => quantity === 0
        ? current.filter(line => line.path !== path)
        : current.map(line => line.path === path ? { path, quantity } : line))
    },
  }}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('CartProvider is missing')
  return cart
}
