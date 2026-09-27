"use client"

import { useCallback, useEffect, useState } from "react"

/** Counts down to a target timestamp (ms). Returns remaining whole seconds. */
export function useCountdown(initialSeconds = 0) {
  const [endsAt, setEndsAt] = useState(() =>
    initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : 0
  )
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (!endsAt) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) setEndsAt(0)
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [endsAt])

  const start = useCallback((seconds: number) => {
    setRemaining(seconds)
    setEndsAt(Date.now() + seconds * 1000)
  }, [])

  return { remaining, start, done: remaining === 0 }
}

export function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
