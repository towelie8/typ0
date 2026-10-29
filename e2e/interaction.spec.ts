import { expect, test } from '@playwright/test'
import { waitForKeyListener } from './helpers'

test.describe('Interaktion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
  })

  test('hebt eine physisch gedrückte Taste hervor und nennt den Finger', async ({ page }) => {
    const keyF = page.locator('[data-code="KeyF"]')
    await page.keyboard.down('f')
    await expect(keyF).toHaveAttribute('data-pressed', 'true')
    await expect(page.getByTestId('finger-hint')).toContainText('linken Zeigefinger')

    await page.keyboard.up('f')
    await expect(keyF).not.toHaveAttribute('data-pressed')
    // Die Fingerangabe bleibt nach dem Loslassen stehen.
    await expect(keyF).toHaveAttribute('data-active', 'true')
    await expect(page.getByTestId('finger-hint')).toContainText('linken Zeigefinger')
  })

  test('erkennt deutsche Tasten über ihre physische Position', async ({ page }) => {
    // KeyboardEvent.code "Semicolon" ist auf QWERTZ das Ö.
    await page.keyboard.press('Semicolon')
    await expect(page.getByTestId('finger-hint')).toContainText('Ö')
    await expect(page.getByTestId('finger-hint')).toContainText('rechten kleinen Finger')
  })

  test('hält Shift und Buchstabe gleichzeitig gedrückt', async ({ page }) => {
    await page.keyboard.down('ShiftRight')
    await page.keyboard.down('a')
    await expect(page.locator('[data-pressed]')).toHaveCount(2)
    await page.keyboard.up('a')
    await page.keyboard.up('ShiftRight')
    await expect(page.locator('[data-pressed]')).toHaveCount(0)
  })

  test('Leertaste scrollt die Seite nicht', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 300 })
    await page.keyboard.press('Space')
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.getByTestId('finger-hint')).toContainText('Daumen')
  })

  test('Klick auf eine Taste zeigt den Finger', async ({ page }) => {
    await page.locator('[data-code="KeyJ"]').click()
    await expect(page.getByTestId('finger-hint')).toContainText('rechten Zeigefinger')
    await expect(page.locator('[data-code="KeyJ"]')).toHaveAttribute('data-active', 'true')
    await expect(page.locator('[data-pressed]')).toHaveCount(0)
  })

  test('zeigt auf dem Desktop keinen Tastatur-Hinweis', async ({ page }) => {
    await expect(page.getByRole('note')).toHaveCount(0)
  })
})

test.describe('Touch-Gerät', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } })

  test('zeigt den Hinweis und blendet ihn beim ersten Tastendruck aus', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('note')).toContainText('echte Tastatur')
    await page.locator('[data-code="KeyK"]').tap()
    await expect(page.getByTestId('finger-hint')).toContainText('rechten Mittelfinger')
    await expect(async () => {
      await page.keyboard.press('a')
      await expect(page.getByRole('note')).toHaveCount(0, { timeout: 200 })
    }).toPass()
  })
})
