import { describe, expect, it } from 'vitest'
import { keyByCode } from '../data/layout'
import { isLetterKey, keyName } from './keyName'

describe('keyName', () => {
  it.each([
    ['KeyA', 'A'], ['Semicolon', 'Ö'], ['Minus', 'ß'], ['Comma', ','], ['Space', 'Leertaste'], ['ShiftLeft', '⇧'],
  ])('%s heißt %s', (code, name) => {
    expect(keyName(keyByCode(code)!)).toBe(name)
  })

  it('zählt ß nicht als Buchstabentaste', () => {
    expect(isLetterKey(keyByCode('Minus')!)).toBe(false)
    expect(isLetterKey(keyByCode('Quote')!)).toBe(true)
  })
})
