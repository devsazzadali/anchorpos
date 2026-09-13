import { describe, it, expect, beforeEach } from 'vitest'
import { usePOSStore } from '@/store/pos'

// Helper: build a minimal CartItem input matching the store's addItem signature
const makeItem = (overrides: Partial<Parameters<typeof usePOSStore.getState['prototype']['addItem']>[0]> = {}) => ({
  id: 'p1',
  product_id: 'p1',
  variation_id: null,
  name: 'Test Product',
  quantity: 1,
  unit_price: 100000,   // ৳1,000.00
  tax_rate: 0,
  tax_method: 'exclusive' as const,
  discount_type: 'fixed' as const,
  discount_value: 0,
  stock_available: 100,
  ...overrides,
})

describe('POS Cart Store', () => {
  beforeEach(() => {
    usePOSStore.getState().clearCart()
  })

  // ── addItem ──────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('adds a new item and updates subtotal', () => {
      usePOSStore.getState().addItem(makeItem())
      const s = usePOSStore.getState()
      expect(s.cart.size).toBe(1)
      expect(s.subtotal).toBe(100000)
      expect(s.grand_total).toBe(100000)
    })

    it('adding same product ID increments quantity (no duplicate)', () => {
      usePOSStore.getState().addItem(makeItem())
      usePOSStore.getState().addItem(makeItem())
      const s = usePOSStore.getState()
      expect(s.cart.size).toBe(1)
      expect(s.cart.get('p1')!.quantity).toBe(2)
      expect(s.subtotal).toBe(200000)
    })

    it('adds two different products as separate cart entries', () => {
      usePOSStore.getState().addItem(makeItem({ id: 'p1', product_id: 'p1' }))
      usePOSStore.getState().addItem(makeItem({ id: 'p2', product_id: 'p2', name: 'Product 2' }))
      expect(usePOSStore.getState().cart.size).toBe(2)
      expect(usePOSStore.getState().subtotal).toBe(200000)
    })
  })

  // ── updateQuantity ────────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    it('updates quantity and recomputes totals', () => {
      usePOSStore.getState().addItem(makeItem())
      usePOSStore.getState().updateQuantity('p1', 5)
      const s = usePOSStore.getState()
      expect(s.cart.get('p1')!.quantity).toBe(5)
      expect(s.subtotal).toBe(500000)
    })

    it('qty 0 removes the item from cart', () => {
      usePOSStore.getState().addItem(makeItem())
      usePOSStore.getState().updateQuantity('p1', 0)
      const s = usePOSStore.getState()
      expect(s.cart.size).toBe(0)
      expect(s.subtotal).toBe(0)
    })
  })

  // ── removeItem ────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('removes item and resets totals', () => {
      usePOSStore.getState().addItem(makeItem())
      usePOSStore.getState().removeItem('p1')
      const s = usePOSStore.getState()
      expect(s.cart.size).toBe(0)
      expect(s.subtotal).toBe(0)
      expect(s.grand_total).toBe(0)
    })
  })

  // ── tax ───────────────────────────────────────────────────────────────────

  describe('tax computation', () => {
    it('applies 15% exclusive tax to line item', () => {
      usePOSStore.getState().addItem(makeItem({ tax_rate: 15, tax_method: 'exclusive' }))
      const s = usePOSStore.getState()
      // subtotal = 100000, tax = 15000, grand_total = 115000
      expect(s.total_tax).toBe(15000)
      expect(s.grand_total).toBe(115000)
    })
  })

  // ── global discount ───────────────────────────────────────────────────────

  describe('setGlobalDiscount', () => {
    it('percentage discount reduces grand_total correctly', () => {
      usePOSStore.getState().addItem(makeItem()) // 100000
      usePOSStore.getState().setGlobalDiscount('percentage', 10)
      const s = usePOSStore.getState()
      // 10% of 100000 = 10000 discount → grand_total = 90000
      expect(s.total_discount).toBe(10000)
      expect(s.grand_total).toBe(90000)
    })

    it('fixed discount reduces grand_total correctly', () => {
      usePOSStore.getState().addItem(makeItem()) // 100000
      usePOSStore.getState().setGlobalDiscount('fixed', 5000)
      const s = usePOSStore.getState()
      expect(s.total_discount).toBe(5000)
      expect(s.grand_total).toBe(95000)
    })
  })

  // ── shipping ──────────────────────────────────────────────────────────────

  describe('setShipping', () => {
    it('adds shipping to grand_total', () => {
      usePOSStore.getState().addItem(makeItem()) // 100000
      usePOSStore.getState().setShipping(5000)
      expect(usePOSStore.getState().grand_total).toBe(105000)
    })
  })

  // ── change amount ─────────────────────────────────────────────────────────

  describe('payment change calculation', () => {
    it('change = amount_paid - grand_total', () => {
      usePOSStore.getState().addItem(makeItem()) // grand_total = 100000
      usePOSStore.getState().setPayment(150000, 'cash')
      const s = usePOSStore.getState()
      expect(s.amount_paid - s.grand_total).toBe(50000) // ৳500 change
    })
  })

  // ── clearCart ─────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('resets all state to initial values', () => {
      usePOSStore.getState().addItem(makeItem({ tax_rate: 15 }))
      usePOSStore.getState().setGlobalDiscount('percentage', 10)
      usePOSStore.getState().setShipping(5000)
      usePOSStore.getState().setPayment(200000, 'cash')

      usePOSStore.getState().clearCart()

      const s = usePOSStore.getState()
      expect(s.cart.size).toBe(0)
      expect(s.subtotal).toBe(0)
      expect(s.total_tax).toBe(0)
      expect(s.total_discount).toBe(0)
      expect(s.shipping_amount).toBe(0)
      expect(s.grand_total).toBe(0)
      expect(s.customer_id).toBeNull()
    })
  })
})
