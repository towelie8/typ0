import { describe, expect, it } from 'vitest'
import { LocalStorageStore } from './LocalStorageStore'
import { isUnlocked, recordResult, type Progress } from './progress'

const lessons = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

/** Minimaler Storage-Ersatz, damit die Tests nicht vom globalen localStorage abhängen. */
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  }
}

describe('isUnlocked', () => {
  it('schaltet die erste Lektion immer frei', () => {
    expect(isUnlocked(lessons, {}, 0)).toBe(true)
    expect(isUnlocked(lessons, {}, 1)).toBe(false)
  })

  it('schaltet die nächste Lektion frei, wenn die vorige bestanden ist', () => {
    const progress: Progress = { a: { attempts: 1, bestAccuracy: 96, bestCpm: 50, passed: true } }
    expect(isUnlocked(lessons, progress, 1)).toBe(true)
    expect(isUnlocked(lessons, progress, 2)).toBe(false)
  })
})

describe('recordResult', () => {
  it('merkt Bestwerte und Bestehen, ohne Verschlechterung', () => {
    let p = recordResult({}, 'a', { accuracy: 97, cpm: 80 }, 95)
    p = recordResult(p, 'a', { accuracy: 90, cpm: 100 }, 95)
    expect(p.a).toEqual({ attempts: 2, bestAccuracy: 97, bestCpm: 100, passed: true })
  })

  it('besteht nicht unter der Mindestgenauigkeit', () => {
    expect(recordResult({}, 'a', { accuracy: 94.9, cpm: 80 }, 95).a.passed).toBe(false)
  })
})

describe('LocalStorageStore', () => {
  it('speichert und lädt den Fortschritt', async () => {
    const storage = memoryStorage()
    const progress = recordResult({}, 'a', { accuracy: 100, cpm: 60 }, 95)
    await new LocalStorageStore(storage).save(progress)
    expect(await new LocalStorageStore(storage).load()).toEqual(progress)
  })

  it('startet leer, wenn nichts oder Unsinn gespeichert ist', async () => {
    const storage = memoryStorage()
    expect(await new LocalStorageStore(storage).load()).toEqual({})
    storage.setItem(LocalStorageStore.KEY, '{kaputt')
    expect(await new LocalStorageStore(storage).load()).toEqual({})
    storage.setItem(LocalStorageStore.KEY, '[1,2]')
    expect(await new LocalStorageStore(storage).load()).toEqual({})
  })
})
