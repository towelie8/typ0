import { useCallback, useEffect, useReducer } from 'react'
import { keyByCode } from '../data/layout'
import { INITIAL_KEY_STATE, keyStateReducer } from '../lib/keyState'

/**
 * Verfolgt physische Tastendrücke (window-weit) und Klicks auf die virtuelle Tastatur.
 * Tasten werden über `KeyboardEvent.code` erkannt, damit die Position unabhängig von
 * Shift und toten Tasten (^, ´) stimmt.
 */
export function useKeyState() {
  const [state, dispatch] = useReducer(keyStateReducer, INITIAL_KEY_STATE)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Browser-Kürzel (Strg+R, Strg+L …) nicht abfangen.
      if (e.ctrlKey || e.metaKey) return
      if (!keyByCode(e.code)) return
      // Leertaste würde scrollen, ' öffnet in Firefox die Schnellsuche. Tab bleibt für die Fokus-Navigation frei.
      if (e.code !== 'Tab') e.preventDefault()
      dispatch({ type: 'press', code: e.code })
    }
    const onKeyUp = (e: KeyboardEvent) => dispatch({ type: 'release', code: e.code })
    // Bei Fokusverlust kommt kein keyup mehr an.
    const onBlur = () => dispatch({ type: 'releaseAll' })

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const press = useCallback((code: string) => dispatch({ type: 'press', code }), [])
  const release = useCallback((code: string) => dispatch({ type: 'release', code }), [])

  return { ...state, press, release }
}
