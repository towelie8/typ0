import { expect, test, type Page } from '@playwright/test'
import { codeForChar, typeExercise, waitForKeyListener } from './helpers'

const lessonButton = (page: Page, id: string) => page.locator(`[data-lesson="${id}"]`)

async function startLesson(page: Page, id: string) {
  await lessonButton(page, id).click()
  await expect(page.getByTestId('exercise')).toBeVisible()
}

/** Eine Taste, die gerade sicher falsch ist. */
async function wrongCode(page: Page) {
  const exercise = page.getByTestId('exercise')
  const text = (await exercise.getAttribute('data-text'))!
  const pos = await exercise.locator('[data-state="done"]').count()
  return codeForChar(text[pos]) === 'KeyA' ? 'KeyS' : 'KeyA'
}

test.describe('Lernpfad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForKeyListener(page)
  })

  test('zeigt die erste Lektion offen und die übrigen gesperrt', async ({ page }) => {
    await expect(lessonButton(page, 'grundstellung')).toBeEnabled()
    await expect(lessonButton(page, 'grundreihe')).toBeDisabled()
    await expect(lessonButton(page, 'zahlen')).toBeDisabled()
  })

  test('führt durch Lektion 1, schaltet Lektion 2 frei und behält das nach einem Reload', async ({ page }) => {
    await startLesson(page, 'grundstellung')
    await typeExercise(page)
    const result = page.getByTestId('result')
    await expect(result).toHaveAttribute('data-passed', 'true')
    await expect(result).toContainText('Genauigkeit 100 %')
    await expect(lessonButton(page, 'grundreihe')).toBeEnabled()

    await page.reload()
    await expect(lessonButton(page, 'grundstellung')).toHaveAttribute('data-passed', 'true')
    await expect(lessonButton(page, 'grundreihe')).toBeEnabled()
    await expect(lessonButton(page, 'oben-1')).toBeDisabled()

    await page.getByRole('button', { name: /G, H und Ä/ }).click()
    await expect(page.getByRole('region', { name: /G, H und Ä/ })).toBeVisible()
  })

  test('blockiert bei einem Fehler und markiert ihn rot', async ({ page }) => {
    await startLesson(page, 'grundstellung')
    const current = page.getByTestId('exercise').locator('[data-state="current"]')
    await page.keyboard.press(await wrongCode(page))
    await expect(page.getByTestId('live-stats')).toContainText('Fehler: 1')
    // Position unverändert, Zeichen als Fehler markiert.
    await expect(page.getByTestId('exercise').locator('[data-state]').first()).toHaveAttribute('data-state', 'current')
    await expect(current).toHaveAttribute('data-error', 'true')

    const text = (await page.getByTestId('exercise').getAttribute('data-text'))!
    await page.keyboard.press(codeForChar(text[0]))
    await expect(page.getByTestId('exercise').locator('[data-state]').first()).toHaveAttribute('data-state', 'done')
    await expect(page.getByTestId('exercise').locator('[data-state]').first()).toHaveAttribute('data-error', 'true')
  })

  test('schaltet unter 95 % Genauigkeit nicht frei', async ({ page }) => {
    await startLesson(page, 'grundstellung')
    const wrong = await wrongCode(page)
    for (let i = 0; i < 10; i++) await page.keyboard.press(wrong)
    await typeExercise(page)
    await expect(page.getByTestId('result')).toContainText('Noch nicht ganz')
    await expect(page.getByTestId('result')).not.toHaveAttribute('data-passed')
    await expect(lessonButton(page, 'grundreihe')).toBeDisabled()
    await page.getByRole('button', { name: 'Nochmal' }).click()
    await expect(page.getByTestId('exercise').locator('[data-state="done"]')).toHaveCount(0)
  })

  test('zeigt die nächste Taste und den Finger dazu', async ({ page }) => {
    await startLesson(page, 'grundstellung')
    const text = (await page.getByTestId('exercise').getAttribute('data-text'))!
    const code = codeForChar(text[0])
    await expect(page.locator(`[data-code="${code}"]`)).toHaveAttribute('data-guide', 'true')
    await expect(page.locator('[data-guide]')).toHaveCount(1)
    await expect(page.getByTestId('next-hint')).toContainText('mit dem')
  })

  test('verlangt für Großbuchstaben Shift und zeigt beide Finger', async ({ page }) => {
    // Fortschritt bis zur Shift-Lektion vorbelegen.
    await page.evaluate(() => {
      const ids = ['grundstellung', 'grundreihe', 'oben-1', 'oben-2', 'unten-1', 'unten-2']
      const progress = Object.fromEntries(ids.map((id) => [id, { attempts: 1, bestAccuracy: 100, bestCpm: 100, passed: true }]))
      localStorage.setItem('typ0.progress.v1', JSON.stringify(progress))
    })
    await page.reload()
    await startLesson(page, 'shift')
    const text = (await page.getByTestId('exercise').getAttribute('data-text'))!
    const upper = text[0]
    expect(upper).toMatch(/[A-ZÄÖÜ]/)
    await expect(page.locator('[data-guide]')).toHaveCount(2)
    await page.keyboard.press(codeForChar(upper.toLowerCase()))
    await expect(page.getByTestId('live-stats')).toContainText('Fehler: 1')
    await page.keyboard.press(`Shift+${codeForChar(upper.toLowerCase())}`)
    await expect(page.getByTestId('exercise').locator('[data-state]').first()).toHaveAttribute('data-state', 'done')
  })

  test('Lektion verlassen führt zurück zur freien Tastatur', async ({ page }) => {
    await startLesson(page, 'grundstellung')
    await page.getByRole('button', { name: 'Lektion verlassen' }).click()
    await expect(page.getByTestId('exercise')).toHaveCount(0)
    await page.keyboard.press('f')
    await expect(page.getByTestId('finger-hint')).toContainText('linken Zeigefinger')
  })
})
