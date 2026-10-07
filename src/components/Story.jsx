import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Story() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.82, 1])
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section id="story" ref={ref} className="story">
      <motion.figure className="frame" style={{ scale }}>
        <div className="frame__inner">
          <motion.img src="/img/fallin-yn.jpg" alt="FALLIN' YN, oil painting by Saint YN" style={{ y: imgY }} />
        </div>
      </motion.figure>
      <motion.div
        className="story__text"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="label">“FALLIN' YN” — SAINT YN, OIL ON CANVAS</p>
        <h2>
          What remains when strength
          <em> can no longer be performed perfectly.</em>
        </h2>
        <p>
          FALLIN' YN captures the suspended instant between composure and collapse. Saint YN's body is
          partially concealed behind his own arm, while a single exposed eye confronts the viewer with
          an emotion he cannot fully contain.
        </p>
        <p>
          Yet it is not an image of defeat. To fall is to lose elevation — but it is also to surrender
          the performance of invulnerability.
        </p>
        <a className="btn btn--light" href="#rack">
          Wear the painting
        </a>
      </motion.div>
    </section>
  )
}
