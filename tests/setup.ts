import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { enableMapSet } from 'immer'

// Enable Immer MapSet plugin so Zustand stores using Map/Set work in tests
enableMapSet()

// Mock indexedDB for Dexie
const indexedDB = require('fake-indexeddb')
const IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

globalThis.indexedDB = indexedDB
globalThis.IDBKeyRange = IDBKeyRange

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
