import { expect, test } from '@playwright/test'

test('zeigt die QWERTZ-Tastatur mit Fingerzonen', async ({ page }) => {
  await page.goto('/')
  const keyboard = page.getByRole('img', { name: /QWERTZ-Tastatur/ })
  await expect(keyboard).toBeVisible()

  // Deutsche Sonderbelegung an der richtigen physischen Position
  await expect(keyboard.locator('[data-code="KeyY"]')).toContainText('Z')
  await expect(keyboard.locator('[data-code="Semicolon"]')).toContainText('Ö')
  await expect(keyboard.locator('[data-code="Minus"]')).toContainText('ß')

  // Acht Finger plus Daumen haben jeweils eine eigene Farbe
  const fills = await keyboard.locator('[data-finger] > :is(rect, path)').evaluateAll((els) =>
    els.map((el) => `${el.parentElement!.dataset.finger}=${el.getAttribute('fill')}`),
  )
  const colorByFinger = new Map(fills.map((f) => f.split('=') as [string, string]))
  expect(colorByFinger.size).toBe(9)
  expect(new Set(colorByFinger.values()).size).toBe(9)

  // Grundstellung markiert
  await expect(keyboard.locator('[data-home]')).toHaveCount(9)
  await expect(page.getByRole('list', { name: 'Farblegende der Finger' }).getByRole('listitem')).toHaveCount(9)
})
