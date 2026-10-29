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

/** Physische Taste (US-Benennung wie `KeyboardEvent.code`) für ein Zeichen der Lektionen 1–6. */
export function codeForChar(ch: string): string {
  const special: Record<string, string> = {
    ' ': 'Space', 'ö': 'Semicolon', 'ä': 'Quote', 'ü': 'BracketLeft', 'z': 'KeyY', 'y': 'KeyZ',
    ',': 'Comma', '.': 'Period', '-': 'Slash',
  }
  return special[ch] ?? `Key${ch.toUpperCase()}`
}

/** Tippt den Rest der laufenden Übung fehlerfrei ab. */
export async function typeExercise(page: Page) {
  const exercise = page.getByTestId('exercise')
  const text = (await exercise.getAttribute('data-text'))!
  const start = await exercise.locator('[data-state="done"]').count()
  for (const ch of text.slice(start)) await page.keyboard.press(codeForChar(ch))
}
