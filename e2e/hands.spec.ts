import { expect, test, type Locator, type Page } from '@playwright/test'
import { waitForKeyListener } from './helpers'

/** Liegt die Mitte der Fingerkuppe innerhalb der Taste? */
async function tipOnKey(page: Page, digit: string, code: string) {
  const tip = await page.locator(`[data-digit="${digit}"] [data-tip]`).boundingBox()
  const key = await page.locator(`[data-code="${code}"] rect, [data-code="${code}"] path`).first().boundingBox()
  if (!tip || !key) return false
  const cx = tip.x + tip.width / 2
  const cy = tip.y + tip.height / 2
  return cx > key.x && cx < key.x + key.width && cy > key.y && cy < key.y + key.height
}

async function expectTipOn(page: Page, digit: string, code: string) {
  await expect.poll(() => tipOnKey(page, digit, code), { message: `${digit} auf ${code}` }).toBe(true)
}

const digit = (page: Page, d: string): Locator => page.locator(`[data-digit="${d}"]`)

test.describe('Hände', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
  })

  test('liegen in Grundstellung auf ASDF, JKLÖ und der Leertaste', async ({ page }) => {
    await expect(page.locator('[data-digit]')).toHaveCount(10)
    const home: [string, string][] = [
      ['l-pinky', 'KeyA'], ['l-ring', 'KeyS'], ['l-middle', 'KeyD'], ['l-index', 'KeyF'],
      ['r-index', 'KeyJ'], ['r-middle', 'KeyK'], ['r-ring', 'KeyL'], ['r-pinky', 'Semicolon'],
      ['l-thumb', 'Space'], ['r-thumb', 'Space'],
    ]
    for (const [d, code] of home) await expectTipOn(page, d, code)
  })

  test('bewegen den Finger zur gedrückten Taste und zurück', async ({ page }) => {
    await page.keyboard.down('r')
    await expect(digit(page, 'l-index')).toHaveAttribute('data-highlight', 'true')
    await expectTipOn(page, 'l-index', 'KeyR')
    await page.keyboard.up('r')
    await expectTipOn(page, 'l-index', 'KeyF')
    // Hervorhebung bleibt wie bei der Taste stehen.
    await expect(digit(page, 'l-index')).toHaveAttribute('data-highlight', 'true')
  })

  test('folgt auch einem Klick auf die Tastatur', async ({ page }) => {
    const box = (await page.locator('[data-code="KeyU"]').boundingBox())!
    await page.mouse.move(box.x + 10, box.y + 10)
    await page.mouse.down()
    await expect(digit(page, 'r-index')).toHaveAttribute('data-highlight', 'true')
    await expectTipOn(page, 'r-index', 'KeyU')
    await page.mouse.up()
    await expectTipOn(page, 'r-index', 'KeyJ')
  })

  test('drückt die Leertaste mit dem rechten Daumen', async ({ page }) => {
    await page.keyboard.press('Space')
    await expect(digit(page, 'r-thumb')).toHaveAttribute('data-highlight', 'true')
    await expect(digit(page, 'l-thumb')).not.toHaveAttribute('data-highlight')
  })

  test('zeigt Shift und Buchstabe mit beiden Händen', async ({ page }) => {
    await page.keyboard.down('ShiftRight')
    await page.keyboard.down('a')
    await expectTipOn(page, 'r-pinky', 'ShiftRight')
    await expectTipOn(page, 'l-pinky', 'KeyA')
    await expect(page.getByTestId('shift-advice')).toHaveCount(0)
  })

  test('rät zur Gegenhand, wenn Shift auf derselben Seite liegt', async ({ page }) => {
    await page.keyboard.down('ShiftLeft')
    await page.keyboard.press('a')
    await page.keyboard.up('ShiftLeft')
    await expect(page.getByTestId('shift-advice')).toContainText('rechten')
    await page.keyboard.press('s')
    await expect(page.getByTestId('shift-advice')).toHaveCount(0)
  })

  test('lassen Klicks auf die Tasten unter den Händen durch', async ({ page }) => {
    // KeyF liegt unter der Kuppe des linken Zeigefingers.
    await page.locator('[data-code="KeyF"]').click()
    await expect(page.locator('[data-code="KeyF"]')).toHaveAttribute('data-active', 'true')
  })
})

test.describe('Hände bei reduzierter Bewegung', () => {
  test.use({ reducedMotion: 'reduce' })

  test('heben den Finger nur hervor und bewegen ihn nicht', async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
    await page.keyboard.down('r')
    await expect(digit(page, 'l-index')).toHaveAttribute('data-highlight', 'true')
    await page.waitForTimeout(400)
    expect(await tipOnKey(page, 'l-index', 'KeyF')).toBe(true)
    await page.keyboard.up('r')
  })
})
