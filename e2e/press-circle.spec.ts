import { expect, test } from '@playwright/test'
import { waitForKeyListener } from './helpers'

test.describe('Kreis beim Tastendruck', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
  })

  test('erscheint in der Farbe der Fingerzone und verschwindet wieder', async ({ page }) => {
    await page.keyboard.press('r')
    const circle = page.locator('[data-press-circle="KeyR"]').last()
    await expect(circle).toBeAttached()
    // Linker Zeigefinger: Akzentfarbe aus fingers.ts.
    await expect(circle).toHaveAttribute('stroke', '#059669')
    await expect(page.locator('[data-press-circle]')).toHaveCount(0)
  })

  test('zieht sich zusammen', async ({ page }) => {
    await page.keyboard.down('j')
    const circle = page.locator('[data-press-circle="KeyJ"]').last()
    const first = Number(await circle.getAttribute('r'))
    await expect.poll(async () => Number((await circle.getAttribute('r')) ?? 0)).toBeLessThan(first)
    await page.keyboard.up('j')
  })

  test('erscheint bei jedem Anschlag neu, auch auf derselben Taste', async ({ page }) => {
    await page.keyboard.press('f')
    await page.keyboard.press('f')
    await expect(page.locator('[data-press-circle="KeyF"]')).toHaveCount(2)
  })

  test('erscheint auch beim Klick auf die Taste', async ({ page }) => {
    await page.locator('[data-code="KeyK"]').click()
    await expect(page.locator('[data-press-circle="KeyK"]')).toBeAttached()
  })

  test('rät zur Gegenhand, wenn Shift auf derselben Seite liegt', async ({ page }) => {
    await page.keyboard.down('ShiftLeft')
    await page.keyboard.press('a')
    await page.keyboard.up('ShiftLeft')
    await expect(page.getByTestId('shift-advice')).toContainText('rechten')
    await page.keyboard.press('s')
    await expect(page.getByTestId('shift-advice')).toHaveCount(0)
  })
})

test.describe('Kreis bei reduzierter Bewegung', () => {
  test.use({ reducedMotion: 'reduce' })

  test('entfällt; die Taste leuchtet nur auf', async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
    await page.keyboard.down('r')
    await expect(page.locator('[data-code="KeyR"]')).toHaveAttribute('data-pressed', 'true')
    await expect(page.locator('[data-press-circle]')).toHaveCount(0)
    await page.keyboard.up('r')
  })
})
