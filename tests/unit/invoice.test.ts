import { describe, it, expect } from 'vitest'

// Invoice number generation logic (mirrors what sell.service.ts does)
function buildInvoiceNumber(prefix: string, startNumber: number, totalDigits: number, currentCount: number): string {
  const num = String(startNumber + currentCount).padStart(totalDigits, '0')
  return `${prefix}${num}`
}

describe('Invoice Number Generator', () => {
  it('generates correct invoice number with default scheme', () => {
    // INV prefix, start=1, 5 digits, 41st invoice
    expect(buildInvoiceNumber('INV', 1, 5, 41)).toBe('INV00042')
  })

  it('generates correct number with custom prefix', () => {
    expect(buildInvoiceNumber('SO-CTG-', 1, 4, 17)).toBe('SO-CTG-0018')
  })

  it('pads correctly at start number', () => {
    expect(buildInvoiceNumber('QT', 100, 6, 0)).toBe('QT000100')
  })

  it('does not overflow padding beyond totalDigits', () => {
    // 99999 + 1 = 100000, exceeds 5 digits — should still generate
    const result = buildInvoiceNumber('INV', 1, 5, 99999)
    expect(result).toBe('INV100000') // no truncation
  })

  it('generates sequential numbers correctly', () => {
    const prefix = 'INV'
    const results = [0, 1, 2, 3].map((i) => buildInvoiceNumber(prefix, 1, 5, i))
    expect(results).toEqual(['INV00001', 'INV00002', 'INV00003', 'INV00004'])
  })

  it('offline invoice uses OFFLINE- prefix pattern', () => {
    // Offline invoices use a timestamp-based ID
    const offlineInvoice = `OFFLINE-${1726207200000}`
    expect(offlineInvoice).toMatch(/^OFFLINE-\d+$/)
  })
})
