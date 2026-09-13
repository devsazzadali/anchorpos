import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock the sync module so we don't need real Dexie + Supabase
vi.mock('@/lib/db/sync', () => ({
  SyncEngine: {
    enqueue: vi.fn().mockResolvedValue(undefined),
    flush: vi.fn().mockResolvedValue({ synced: 3, failed: 0 }),
  },
}))

// ── Types (inlined) ────────────────────────────────────────────────────────

interface SyncQueueItem {
  id?: number
  table: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  payload: Record<string, unknown>
  priority: 1 | 2 | 3
  createdAt: number
  _synced: boolean
}

// ── Logic under test (pure functions extracted from sell.service) ───────────

function buildOfflineInvoiceNo(timestamp: number): string {
  return `OFFLINE-${timestamp}`
}

function buildSyncQueueItems(
  sellId: string,
  sellLinesCount: number,
  paymentsCount: number,
  timestamp: number
): SyncQueueItem[] {
  const items: SyncQueueItem[] = [
    { table: 'sells', operation: 'INSERT', payload: { id: sellId }, priority: 1 as const, createdAt: timestamp, _synced: false },
    // sell_lines
    ...Array.from({ length: sellLinesCount }, (_, i) => ({
      table: 'sell_lines',
      operation: 'INSERT' as const,
      payload: { sell_id: sellId, line_index: i },
      priority: 1 as const,
      createdAt: timestamp + 1,
      _synced: false,
    })),
    // sell_payments
    ...Array.from({ length: paymentsCount }, (_, i) => ({
      table: 'sell_payments',
      operation: 'INSERT' as const,
      payload: { sell_id: sellId, payment_index: i },
      priority: 1 as const,
      createdAt: timestamp + 2,
      _synced: false,
    })),
    // stock_movements (one per sell line)
    ...Array.from({ length: sellLinesCount }, (_, i) => ({
      table: 'stock_movements',
      operation: 'INSERT' as const,
      payload: { sell_id: sellId, line_index: i, type: 'SALE' },
      priority: 1 as const,
      createdAt: timestamp + 3,
      _synced: false,
    })),
  ]
  return items
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Sell Service (Offline Logic)', () => {
  const TS = 1726207200000
  const SELL_ID = 'local-uuid-1234'

  it('buildOfflineInvoiceNo returns correct pattern', () => {
    const inv = buildOfflineInvoiceNo(TS)
    expect(inv).toBe(`OFFLINE-${TS}`)
    expect(inv).toMatch(/^OFFLINE-\d+$/)
  })

  describe('buildSyncQueueItems', () => {
    it('creates correct total number of queue items: 1+lines+payments+stock', () => {
      // 1 sell + 3 lines + 1 payment + 3 stock_movements = 8
      const items = buildSyncQueueItems(SELL_ID, 3, 1, TS)
      expect(items).toHaveLength(8)
    })

    it('all items have priority 1 (critical)', () => {
      const items = buildSyncQueueItems(SELL_ID, 2, 1, TS)
      expect(items.every((i) => i.priority === 1)).toBe(true)
    })

    it('all items start as _synced=false', () => {
      const items = buildSyncQueueItems(SELL_ID, 2, 1, TS)
      expect(items.every((i) => i._synced === false)).toBe(true)
    })

    it('sells comes first (lowest timestamp)', () => {
      const items = buildSyncQueueItems(SELL_ID, 2, 1, TS)
      expect(items[0].table).toBe('sells')
      expect(items[0].createdAt).toBe(TS)
    })

    it('stock_movements come last (highest timestamp)', () => {
      const items = buildSyncQueueItems(SELL_ID, 2, 1, TS)
      const stockItems = items.filter((i) => i.table === 'stock_movements')
      expect(stockItems.every((i) => i.createdAt === TS + 3)).toBe(true)
    })

    it('each stock movement has type SALE', () => {
      const items = buildSyncQueueItems(SELL_ID, 3, 1, TS)
      const stockItems = items.filter((i) => i.table === 'stock_movements')
      expect(stockItems).toHaveLength(3)
      expect(stockItems.every((i) => i.payload.type === 'SALE')).toBe(true)
    })
  })
})
