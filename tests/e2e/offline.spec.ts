import { test, expect, Page } from '@playwright/test'

async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'admin@databyte.com')
  await page.getByLabel(/password/i).fill(process.env.E2E_TEST_PASSWORD ?? 'testpassword')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/home/, { timeout: 10000 })
}

test.describe('Offline POS Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('offline indicator appears when network is disabled', async ({ page, context }) => {
    await page.goto('/pos')

    // Go offline
    await context.setOffline(true)

    // The sync status bar / offline badge should appear
    await expect(page.getByText(/offline/i)).toBeVisible({ timeout: 5000 })
  })

  test('POS products still load from IndexedDB when offline', async ({ page, context }) => {
    // First load data while online so it's cached in Dexie
    await page.goto('/pos')
    await page.waitForTimeout(1000) // allow Dexie sync

    // Go offline
    await context.setOffline(true)

    // Products should still render from local IndexedDB
    await page.reload()
    // Product grid should still show content
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('offline sale is queued and syncs when back online', async ({ page, context }) => {
    await page.goto('/pos')
    await page.waitForTimeout(500)

    // Go offline
    await context.setOffline(true)
    await expect(page.getByText(/offline/i)).toBeVisible({ timeout: 3000 })

    // Create a sale while offline
    const firstProductCard = page.locator('[data-testid="product-card"]').first()
    if (await firstProductCard.isVisible()) {
      await firstProductCard.click()

      // Set payment and confirm
      const paymentInput = page.locator('[data-testid="payment-amount"]')
      if (await paymentInput.isVisible()) {
        await paymentInput.fill('1000')
      }

      const confirmBtn = page.getByRole('button', { name: /confirm sale/i })
      if (await confirmBtn.isEnabled()) {
        await confirmBtn.click()
        // Should see OFFLINE- invoice number
        await expect(page.getByText(/OFFLINE-/i)).toBeVisible({ timeout: 3000 })
      }
    }

    // Come back online
    await context.setOffline(false)

    // Sync indicator should briefly show syncing
    await expect(page.getByText(/syncing|synced/i)).toBeVisible({ timeout: 5000 })
  })
})
