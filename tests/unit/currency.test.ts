import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  toBDTPaise,
  paise_to_display,
  calculateTax,
  calculateDiscountPct,
} from '@/lib/utils/currency'

describe('Currency Utils', () => {
  // ── formatCurrency ─────────────────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats 100000 paise as ৳1,000.00', () => {
      expect(formatCurrency(100000)).toBe('৳1,000.00')
    })
    it('formats 0 paise as ৳0.00', () => {
      expect(formatCurrency(0)).toBe('৳0.00')
    })
    it('formats 45000 paise as ৳450.00', () => {
      expect(formatCurrency(45000)).toBe('৳450.00')
    })
    it('formats large amounts correctly', () => {
      expect(formatCurrency(1500000000)).toBe('৳15,000,000.00')
    })
  })

  // ── toBDTPaise ─────────────────────────────────────────────────────────────

  describe('toBDTPaise', () => {
    it('converts whole number correctly', () => {
      expect(toBDTPaise(1000)).toBe(100000)
    })
    it('converts decimal correctly', () => {
      expect(toBDTPaise(1000.5)).toBe(100050)
    })
    it('converts 0.5 to 50 paise', () => {
      expect(toBDTPaise(0.5)).toBe(50)
    })
    it('converts 0 to 0', () => {
      expect(toBDTPaise(0)).toBe(0)
    })
    it('handles string input with commas', () => {
      expect(toBDTPaise('1,000')).toBe(100000)
    })
  })

  // ── paise_to_display ───────────────────────────────────────────────────────

  describe('paise_to_display', () => {
    it('converts paise to 2dp display string', () => {
      expect(paise_to_display(100050)).toBe('1000.50')
      expect(paise_to_display(50000)).toBe('500.00')
      expect(paise_to_display(1)).toBe('0.01')
    })
  })

  // ── calculateTax ───────────────────────────────────────────────────────────

  describe('calculateTax', () => {
    it('exclusive: 15% tax on 10000 paise = 1500 tax', () => {
      const result = calculateTax(10000, 15, 'exclusive')
      expect(result.taxAmount).toBe(1500)
      expect(result.totalWithTax).toBe(11500)
    })

    it('inclusive: 15% inclusive on 11500 paise ≈ 1500 tax', () => {
      const result = calculateTax(11500, 15, 'inclusive')
      expect(result.taxAmount).toBe(1500)
      expect(result.totalWithTax).toBe(11500) // amount stays same
    })

    it('0% tax returns taxAmount 0 and unchanged total', () => {
      const result = calculateTax(10000, 0, 'exclusive')
      expect(result.taxAmount).toBe(0)
      expect(result.totalWithTax).toBe(10000)
    })
  })

  // ── calculateDiscountPct ───────────────────────────────────────────────────

  describe('calculateDiscountPct', () => {
    it('10% discount on 10000 = 1000', () => {
      expect(calculateDiscountPct(10000, 10)).toBe(1000)
    })
    it('100% discount on 10000 = 10000', () => {
      expect(calculateDiscountPct(10000, 100)).toBe(10000)
    })
    it('0% discount returns 0', () => {
      expect(calculateDiscountPct(10000, 0)).toBe(0)
    })
    it('50% discount on 30000 = 15000', () => {
      expect(calculateDiscountPct(30000, 50)).toBe(15000)
    })
  })
})
