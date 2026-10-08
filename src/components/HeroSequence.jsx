import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { FRAME_COUNT, STILL_FRAME, STILL, PAINTINGS } from '../data'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Scroll timeline, as fractions of the pinned section.
const A_END = 0.24 // film: trunk opens, camera pushes in
const TOUR_START = 0.24
const TOUR_END = 0.76 // camera visits each painting
const OUT_END = 0.82 // camera pulls back to the full frame
const STOP = (TOUR_END - TOUR_START) / PAINTINGS.length
const TRAVEL = 0.4 // share of each stop spent travelling to it

// Film scrub before the tour: [progress, frame] keys. The hatch opening
// (frames ~11-38) gets most of the scroll, so it plays out fully.
const FILM_IN = [
  [0, 1],
  [0.04, 11],
  [0.17, 38],
  [A_END, STILL_FRAME],
]
const filmFrame = (p) => {
  for (let k = 1; k < FILM_IN.length; k++) {
    const [p1, f1] = FILM_IN[k]
    const [p0, f0] = FILM_IN[k - 1]
    if (p <= p1) return Math.round(lerp(f0, f1, seg(p, p0, p1)))
  }
  return STILL_FRAME
}

// The visible width of the film when it isn't zoomed (source pixels). On a
// portrait phone a full-bleed crop would hide the car, so show this much
// and fill the rest with a blurred copy of the frame.
const FILM_SPAN = 1320

const stopWindow = (i) => {
  const s = TOUR_START + i * STOP
  return [s + STOP * TRAVEL, s + STOP * (TRAVEL + 0.1), s + STOP * 0.92, s + STOP]
}

function stopCamera(box, W, H, s0) {
  const [x0, y0, x1, y1] = box
  const wide = W >= 900
  const fitW = wide ? W * 0.46 : W * 0.84
  const fitH = wide ? H * 0.62 : H * 0.4
  const z = Math.min(fitW / (x1 - x0), fitH / (y1 - y0)) / s0
  return {
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    z: Math.max(wide ? 1 : 1.35, z),
    ax: wide ? 0.36 : 0.5,
    ay: 0.5,
  }
}

function fullCamera(W, s0) {
  return { cx: STILL.w / 2, cy: STILL.h / 2, z: Math.min(1, W / FILM_SPAN / s0), ax: 0.5, ay: 0.5 }
}

// Clamp an offset so the image covers the axis; when it is narrower than
// the axis, centre it instead (the blurred backdrop fills the rest).
const place = (r, view, size) => (size >= view ? clamp(r, view - size, 0) : (view - size) / 2)

function mixCamera(a, b, t) {
  const dip = 1 - 0.18 * Math.sin(Math.PI * t) // pull back slightly mid-move
  return {
    cx: lerp(a.cx, b.cx, t),
    cy: lerp(a.cy, b.cy, t),
    z: Math.max(Math.min(a.z, b.z), Math.exp(lerp(Math.log(a.z), Math.log(b.z), t)) * dip),
    ax: lerp(a.ax, b.ax, t),
    ay: lerp(a.ay, b.ay, t),
  }
}

export default function HeroSequence({ frames, still }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const spotRef = useRef(null)
  const hiresRef = useRef(null)
  const lastDraw = useRef('')
  const backdrop = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const draw = (p) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== Math.round(W * dpr)) {
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      lastDraw.current = ''
    }

    const s0 = Math.max(W / STILL.w, H / STILL.h)
    let img = null
    const FULL = fullCamera(W, s0)
    let cam = FULL
    let spot = 0
    let hires = 0

    if (p < TOUR_START || p > OUT_END || !still?.complete) {
      // Film phases: scrub the frame sequence.
      const idx =
        p < TOUR_START
          ? filmFrame(p)
          : p > OUT_END
            ? Math.round(lerp(STILL_FRAME, FRAME_COUNT, seg(p, OUT_END, 1)))
            : STILL_FRAME
      img = nearestLoaded(frames, idx)
    } else {
      img = still
      if (p <= TOUR_END) {
        const i = Math.min(PAINTINGS.length - 1, Math.floor((p - TOUR_START) / STOP))
        const t = seg(p, TOUR_START + i * STOP, TOUR_START + (i + 1) * STOP)
        const from = i === 0 ? FULL : stopCamera(PAINTINGS[i - 1].box, W, H, s0)
        const to = stopCamera(PAINTINGS[i].box, W, H, s0)
        cam = mixCamera(from, to, ease(seg(t, 0, TRAVEL)))
        spot = i === 0 ? ease(seg(t, 0, TRAVEL)) : 1
        if (PAINTINGS[i].hires) hires = seg(t, TRAVEL + 0.05, TRAVEL + 0.25)
      } else {
        const t = ease(seg(p, TOUR_END, OUT_END))
        const last = PAINTINGS[PAINTINGS.length - 1]
        cam = mixCamera(stopCamera(last.box, W, H, s0), FULL, t)
        spot = 1 - t
        hires = 1 - seg(t, 0, 0.35)
      }
    }
    if (!img) return

    // Cover-fit at zoom z, anchored so the camera centre sits at (ax, ay).
    const s = s0 * cam.z
    const dw = STILL.w * s
    const dh = STILL.h * s
    const dx = place(cam.ax * W - cam.cx * s, W, dw)
    const dy = place(cam.ay * H - cam.cy * s, H, dh)

    const key = `${img.src}|${dx.toFixed(1)}|${dy.toFixed(1)}|${dw.toFixed(1)}|${W}x${H}`
    if (key !== lastDraw.current) {
      lastDraw.current = key
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingQuality = 'high'
      if (dw < W || dh < H) {
        // Blurred backdrop: the frame shrunk to a few pixels, then stretched
        // to cover, so no part of the stage is ever empty.
        const b = (backdrop.current ||= Object.assign(document.createElement('canvas'), { width: 48, height: 27 }))
        b.getContext('2d').drawImage(img, 0, 0, 48, 27)
        const bs = s0 * 1.15
        ctx.drawImage(b, (W - STILL.w * bs) / 2, (H - STILL.h * bs) / 2, STILL.w * bs, STILL.h * bs)
        ctx.fillStyle = 'rgba(11, 11, 10, 0.45)'
        ctx.fillRect(0, 0, W, H)
      }
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    // Spotlight + high-res artwork follow the painting currently in view.
    const focus =
      p >= TOUR_START && p <= OUT_END
        ? PAINTINGS[Math.min(PAINTINGS.length - 1, Math.max(0, Math.floor((p - TOUR_START) / STOP)))]
        : null
    if (focus && W < 900) {
      const [, y0, , y1] = focus.box
      const mid = dy + ((y0 + y1) / 2) * s
      canvas.parentElement.dataset.placard = mid > H * 0.5 ? 'top' : 'bottom'
    }
    if (spotRef.current) {
      spotRef.current.style.opacity = String(spot * 0.92)
      if (focus) {
        const [x0, y0, x1, y1] = focus.box
        spotRef.current.style.setProperty('--sx', `${dx + ((x0 + x1) / 2) * s}px`)
        spotRef.current.style.setProperty('--sy', `${dy + ((y0 + y1) / 2) * s}px`)
        spotRef.current.style.setProperty('--sr', `${Math.max(x1 - x0, y1 - y0) * s * 0.85}px`)
      }
    }
    if (hiresRef.current) {
      const f = PAINTINGS[PAINTINGS.length - 1]
      const [x0, y0, x1, y1] = f.box
      // Inset past the gilded frame onto the canvas itself; the frame's
      // bottom rail is hidden behind the painting below, so no bottom inset.
      const ix = (x1 - x0) * 0.1
      const iy = (y1 - y0) * 0.17
      const el = hiresRef.current
      el.style.opacity = String(hires)
      el.style.left = `${dx + (x0 + ix) * s}px`
      el.style.top = `${dy + (y0 + iy) * s}px`
      el.style.width = `${(x1 - x0 - 2 * ix) * s}px`
      el.style.height = `${(y1 - y0 - iy) * s}px`
    }
  }

  useMotionValueEvent(scrollYProgress, 'change', (p) => requestAnimationFrame(() => draw(p)))

  useEffect(() => {
    const redraw = () => {
      lastDraw.current = ''
      draw(scrollYProgress.get())
    }
    redraw()
    window.addEventListener('resize', redraw)
    const id = setInterval(redraw, 400) // repaint as frames finish loading
    const stop = setTimeout(() => clearInterval(id), 8000)
    return () => {
      window.removeEventListener('resize', redraw)
      clearInterval(id)
      clearTimeout(stop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, still])

  // Text overlays
  const introOpacity = useTransform(scrollYProgress, [0, 0.015, 0.06], [1, 1, 0])
  const introY = useTransform(scrollYProgress, [0, 0.06], ['0vh', '-12vh'])
  const introTrack = useTransform(scrollYProgress, [0, 0.06], ['-0.02em', '0.08em'])
  const line1 = useTransform(scrollYProgress, [0.165, 0.18, 0.215, 0.235], [0, 1, 1, 0])
  const line1Y = useTransform(scrollYProgress, [0.165, 0.235], ['3vh', '-3vh'])
  const tourUi = useTransform(
    scrollYProgress,
    [TOUR_START, TOUR_START + 0.02, TOUR_END, TOUR_END + 0.02],
    [0, 1, 1, 0]
  )
  const outro1 = useTransform(scrollYProgress, [0.84, 0.87, 0.92, 0.94], [0, 1, 1, 0])
  const outro2 = useTransform(scrollYProgress, [0.94, 0.975], [0, 1])
  const outro2Y = useTransform(scrollYProgress, [0.94, 0.975], ['3vh', '0vh'])
  const scrim = useTransform(scrollYProgress, [0.9, 1], [0, 0.55])

  return (
    <section ref={sectionRef} className="hero" aria-label="SAINT YN campaign film">
      <div className="hero__stage">
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
        <div ref={spotRef} className="hero__spot" aria-hidden="true" />
        <img ref={hiresRef} src={PAINTINGS[PAINTINGS.length - 1].hires} alt="" className="hero__hires" />
        <motion.div className="hero__scrim" style={{ opacity: scrim }} aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />

        <motion.div className="intro" style={{ opacity: introOpacity, y: introY }}>
          <p className="label">“COLLECTION Nº 01”</p>
          <h1 className="intro__mark">
            <span className="intro__saint">Saint</span>
            <motion.span className="intro__yn" style={{ letterSpacing: introTrack }}>
              YN
            </motion.span>
          </h1>
          <p className="intro__sub">Oil on cotton — Oakland, California</p>
          <div className="scrollcue" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </motion.div>

        <motion.div className="line" style={{ opacity: line1, y: line1Y }}>
          <p className="label">“THE EXHIBITION”</p>
          <h2>
            Five paintings.
            <br />
            <em>One trunk.</em>
          </h2>
        </motion.div>

        {PAINTINGS.map((p, i) => (
          <Placard key={p.id} painting={p} index={i} progress={scrollYProgress} />
        ))}

        <motion.ol className="tourbar" style={{ opacity: tourUi }} aria-hidden="true">
          {PAINTINGS.map((p, i) => (
            <TourTick key={p.id} index={i} progress={scrollYProgress} />
          ))}
        </motion.ol>

        <motion.div className="outro" style={{ opacity: outro1 }}>
          <h2>
            From the trunk
            <br />
            <em>to the rack.</em>
          </h2>
        </motion.div>

        <motion.div className="outro outro--cta" style={{ opacity: outro2, y: outro2Y }}>
          <p className="label label--neon">“SHOP OPEN”</p>
          <h2>
            The painting
            <br />
            <em>is the garment.</em>
          </h2>
          <a className="btn btn--light" href="#rack">
            Enter the shop
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function Placard({ painting, index, progress }) {
  const opacity = useTransform(progress, stopWindow(index), [0, 1, 1, 0])
  const y = useTransform(progress, stopWindow(index), [24, 0, 0, -16])
  return (
    <motion.aside className="placard" style={{ opacity, y }} aria-label={painting.title}>
      <p className="placard__count">
        {String(index + 1).padStart(2, '0')} <span>/ {String(PAINTINGS.length).padStart(2, '0')}</span>
      </p>
      <h3 className="placard__title">“{painting.title}”</h3>
      <dl className="placard__meta">
        <div>
          <dt>Artist</dt>
          <dd>Saint YN</dd>
        </div>
        <div>
          <dt>Medium</dt>
          <dd>Oil on canvas</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>Oakland, California</dd>
        </div>
        {painting.price && (
          <div>
            <dt>Price</dt>
            <dd>{painting.price}</dd>
          </div>
        )}
      </dl>
      <p className="placard__note">{painting.note}</p>
      {painting.hires && (
        <a className="placard__link" href="#rack">
          Worn as “FALLIN' YN HOODIE” <span aria-hidden="true">→</span>
        </a>
      )}
    </motion.aside>
  )
}

function TourTick({ index, progress }) {
  const [, b, , d] = stopWindow(index)
  const fill = useTransform(progress, [TOUR_START + index * STOP, b, d - 0.001, d], [0, 1, 1, index === PAINTINGS.length - 1 ? 1 : 0.35])
  return (
    <li>
      <motion.i style={{ scaleX: fill }} />
    </li>
  )
}

function nearestLoaded(frames, idx) {
  if (!frames?.length) return null
  for (let d = 0; d < frames.length; d++) {
    const a = frames[idx - 1 - d]
    if (a?.complete && a.naturalWidth) return a
    const b = frames[idx - 1 + d]
    if (b?.complete && b.naturalWidth) return b
  }
  return null
}
