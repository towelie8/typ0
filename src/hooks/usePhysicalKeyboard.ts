import { useEffect, useState } from 'react'

/**
 * Schätzt, ob eine echte Tastatur vorhanden ist. Ohne feinen Zeiger (Maus/Touchpad) gehen wir
 * von einem Touch-Gerät aus; der erste echte Tastendruck widerlegt das.
 */
export function usePhysicalKeyboard(): boolean {
  const [hasKeyboard, setHasKeyboard] = useState(() => window.matchMedia('(any-pointer: fine)').matches)

  useEffect(() => {
    if (hasKeyboard) return
    const onKeyDown = () => setHasKeyboard(true)
    window.addEventListener('keydown', onKeyDown, { once: true })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasKeyboard])

  return hasKeyboard
}
