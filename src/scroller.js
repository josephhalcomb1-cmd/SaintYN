import { createRef } from 'react'

// The page scrolls inside its own full-screen container instead of the
// window, so scroll-driven effects work even when the site is shown inside
// a frame that doesn't scroll normally (e.g. an embedded preview on iPad).
export const scrollerRef = createRef()
export const contentRef = createRef()
