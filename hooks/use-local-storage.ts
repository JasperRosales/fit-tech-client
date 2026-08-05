"use client"

import * as React from "react"

const STORAGE_EVENT = "fittech:storage-update"
const snapshotCache = new Map<string, unknown>()

function subscribe(callback: () => void) {
  function onUpdate() {
    snapshotCache.clear()
    callback()
  }

  window.addEventListener("storage", onUpdate)
  window.addEventListener(STORAGE_EVENT, onUpdate)

  return () => {
    window.removeEventListener("storage", onUpdate)
    window.removeEventListener(STORAGE_EVENT, onUpdate)
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialRef = React.useRef(initialValue)

  const getSnapshot = React.useCallback((): T => {
    if (snapshotCache.has(key)) {
      return snapshotCache.get(key) as T
    }

    try {
      const stored = window.localStorage.getItem(key)
      const result =
        stored === null ? initialRef.current : (JSON.parse(stored) as T)
      snapshotCache.set(key, result)
      return result
    } catch {
      return initialRef.current
    }
  }, [key])

  const value = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialRef.current
  )

  const setValue = React.useCallback(
    (next: React.SetStateAction<T>) => {
      try {
        const previous = (snapshotCache.get(key) ?? getSnapshot()) as T
        const resolved =
          typeof next === "function"
            ? (next as (previous: T) => T)(previous)
            : next

        if (resolved === null || resolved === undefined) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        }

        window.dispatchEvent(new Event(STORAGE_EVENT))
      } catch {
        // Storage may be full or unavailable; state still works in memory.
      }
    },
    [key, getSnapshot]
  )

  return [value, setValue] as const
}
