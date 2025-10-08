"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/types"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (product: Product) => void
  updateQuantity: (product: Product, quantity: number) => void
  clearCart: () => void
  setCartFromCompare: (products: Product[]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "smartcompare_cart_items"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        setCartItems(JSON.parse(stored))
        console.log("[v0] Cart loaded from localStorage:", JSON.parse(stored))
      } catch (error) {
        console.error("[v0] Error loading cart from localStorage:", error)
        setCartItems([])
      }
    }
  }, [])

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    console.log("[v0] Cart saved to localStorage:", cartItems)
  }, [cartItems])

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  const removeFromCart = (product: Product) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== product.id))
  }

  const updateQuantity = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product)
      return
    }
    setCartItems((prev) => prev.map((item) => (item.product.id === product.id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    console.log("[v0] clearCart called - clearing ONLY cart items")
    setCartItems([])
    console.log("[v0] Cart cleared successfully")
  }

  const setCartFromCompare = (products: Product[]) => {
    const newCartItems = products.map((product) => ({
      product,
      quantity: 1,
    }))
    setCartItems(newCartItems)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCartFromCompare,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
