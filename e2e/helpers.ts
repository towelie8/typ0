import { expect, type Page } from '@playwright/test'

/**
 * Wartet, bis die App Tastendrücke verarbeitet. React registriert die window-Listener
 * erst im Effekt nach dem ersten Rendern; ein Tastendruck direkt nach goto() ginge verloren.
 */
export async function waitForKeyListener(page: Page) {
  await expect(async () => {
    await page.keyboard.press('g')
    await expect(page.locator('[data-code="KeyG"]')).toHaveAttribute('data-active', 'true', { timeout: 200 })
  }).toPass()
}
