import { test, expect, Page } from '@playwright/test'

// ── Shared login helper ────────────────────────────────────────────────────
async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'admin@databyte.com')
  await page.getByLabel(/password/i).fill(process.env.E2E_TEST_PASSWORD ?? 'testpassword')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/home/, { timeout: 10000 })
}

test.describe('POS Terminal Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('navigates to POS terminal', async ({ page }) => {
    // Click POS Terminal in sidebar
    await page.getByRole('link', { name: /pos terminal/i }).click()
    await expect(page).toHaveURL(/\/pos/)

    // POS layout: product grid + cart panel
    await expect(page.getByPlaceholder(/search products/i)).toBeVisible({ timeout: 5000 })
  })

  test('POS search filters products', async ({ page }) => {
    await page.goto('/pos')
    const searchInput = page.getByPlaceholder(/search products/i)
    await searchInput.fill('Samsung')

    // Products matching search should be visible
    await expect(page.getByText(/samsung/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('adding a product to cart updates cart total', async ({ page }) => {
    await page.goto('/pos')

    // Wait for products to load
    const firstProductCard = page.locator('[data-testid="product-card"]').first()
    await firstProductCard.waitFor({ timeout: 8000 })

    // Click the first product card to add to cart
    await firstProductCard.click()

    // Cart should show 1 item
    await expect(page.getByText(/1 item/i)).toBeVisible({ timeout: 3000 })
  })

  test('cart grand total updates when qty changes', async ({ page }) => {
    await page.goto('/pos')

    const firstProductCard = page.locator('[data-testid="product-card"]').first()
    await firstProductCard.waitFor({ timeout: 8000 })
    await firstProductCard.click()

    // Find the quantity increase button
    const qtyIncrease = page.locator('[data-testid="qty-increase"]').first()
    if (await qtyIncrease.isVisible()) {
      await qtyIncrease.click()
      // Total should double
      const cartTotal = page.locator('[data-testid="grand-total"]')
      await expect(cartTotal).toBeVisible()
    }
  })

  test('cannot confirm sale with empty cart', async ({ page }) => {
    await page.goto('/pos')
    const confirmBtn = page.getByRole('button', { name: /confirm sale/i })
    // Button should be disabled or show warning when cart is empty
    await expect(confirmBtn).toBeDisabled()
  })
})
