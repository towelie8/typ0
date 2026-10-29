import { describe, expect, it } from 'vitest'
import { keyByCode } from '../data/layout'
import { DIGITS, digitForKey, fingerOf, handOf } from './digits'

const key = (code: string) => keyByCode(code)!

describe('Finger beider Hände', () => {
  it('hat fünf Finger je Hand', () => {
    expect(DIGITS).toHaveLength(10)
    expect(DIGITS.filter((d) => handOf(d) === 'left')).toHaveLength(5)
  })

  it('ordnet Tasten über die Fingerzone zu', () => {
    expect(digitForKey(key('KeyR'))).toBe('l-index')
    expect(digitForKey(key('Semicolon'))).toBe('r-pinky')
  })

  it('drückt die Leertaste mit dem rechten Daumen', () => {
    expect(digitForKey(key('Space'))).toBe('r-thumb')
  })

  it('nimmt für Alt/Win den Daumen der Seite, auf der die Taste liegt', () => {
    expect(digitForKey(key('AltLeft'))).toBe('l-thumb')
    expect(digitForKey(key('MetaLeft'))).toBe('l-thumb')
    expect(digitForKey(key('AltRight'))).toBe('r-thumb')
  })

  it('führt beide Daumen auf die Daumen-Zone zurück', () => {
    expect(fingerOf('l-thumb')).toBe('thumb')
    expect(fingerOf('r-index')).toBe('r-index')
  })
})
