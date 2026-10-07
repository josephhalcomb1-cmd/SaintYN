import { useEffect, useState } from 'react'
import { FRAME_COUNT, STILL, frameSrc } from './data'

// Loads the film frames + trunk still; reports progress for the loader.
export function usePreload() {
  const [state, setState] = useState({ frames: [], still: null, progress: 0 })

  useEffect(() => {
    const size = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1100 ? 'lg' : 'sm'
    let done = 0
    let cancelled = false
    const total = FRAME_COUNT + 1
    const tick = () => {
      done++
      if (!cancelled) setState((s) => ({ ...s, progress: done / total }))
    }
    const load = (src) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = tick
      img.onerror = tick
      img.src = src
      return img
    }
    const still = load(STILL.src)
    const frames = []
    for (let i = 1; i <= FRAME_COUNT; i++) frames.push(load(frameSrc(i, size)))
    setState({ frames, still, progress: 0 })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
