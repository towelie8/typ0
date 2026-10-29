import { useCallback, useEffect, useReducer, useRef } from 'react'
import { keyByCode } from '../data/layout'
import { INITIAL_KEY_STATE, keyStateReducer } from '../lib/keyState'

/**
 * `onKey` erhält jeden neuen Anschlag mit Shift-Zustand (für den Trainer).
 *
 * Verfolgt physische Tastendrücke (window-weit) und Klicks auf die virtuelle Tastatur.
 * Tasten werden über `KeyboardEvent.code` erkannt, damit die Position unabhängig von
 * Shift und toten Tasten (^, ´) stimmt.
 */
export function useKeyState(onKey?: (code: string, shift: boolean) => void) {
  const [state, dispatch] = useReducer(keyStateReducer, INITIAL_KEY_STATE)
  // Refs, damit die Listener nicht bei jedem Rendern neu registriert werden.
  const onKeyRef = useRef(onKey)
  const pressedRef = useRef(state.pressed)
  useEffect(() => {
    onKeyRef.current = onKey
    pressedRef.current = state.pressed
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Browser-Kürzel (Strg+R, Strg+L …) nicht abfangen.
      if (e.ctrlKey || e.metaKey) return
      if (!keyByCode(e.code)) return
      // Leertaste würde scrollen, ' öffnet in Firefox die Schnellsuche. Tab bleibt für die Fokus-Navigation frei.
      // Enter auf einem Button soll ihn weiterhin auslösen (Tastaturbedienung).
      const onButton = e.code === 'Enter' && e.target instanceof HTMLElement && e.target.closest('button, a') !== null
      if (e.code !== 'Tab' && !onButton) e.preventDefault()
      dispatch({ type: 'press', code: e.code })
      // Gedrückt gehaltene Tasten wiederholen sich; für die Übung zählt nur der erste Anschlag.
      if (!e.repeat) onKeyRef.current?.(e.code, e.shiftKey)
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

  const press = useCallback((code: string) => {
    dispatch({ type: 'press', code })
    const shift = pressedRef.current.has('ShiftLeft') || pressedRef.current.has('ShiftRight')
    onKeyRef.current?.(code, shift)
  }, [])
  const release = useCallback((code: string) => dispatch({ type: 'release', code }), [])

  return { ...state, press, release }
}
