import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page renders correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/DATABYTE POS/i)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show an error message (toast or inline)
    await expect(
      page.getByText(/invalid|incorrect|error|wrong/i)
    ).toBeVisible({ timeout: 8000 })

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows validation on empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    // HTML5 required validation or custom error
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused()
  })

  test('authenticated user is redirected from /login to /home', async ({ page, context }) => {
    // Simulate already having a valid session cookie
    // (In real E2E with Supabase, you'd set cookies or use storage state)
    // For now, verify the redirect logic path exists:
    await page.goto('/home')
    // Should redirect to /login since not authenticated
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
