import { AnimatePresence, motion } from 'framer-motion'

export default function Loader({ progress, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loader"
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
          role="status"
          aria-live="polite"
        >
          <div className="loader__mark">
            <span className="intro__saint">Saint</span>
            <span className="loader__yn">YN</span>
          </div>
          <div className="loader__bar">
            <motion.i style={{ scaleX: progress }} />
          </div>
          <p className="label">Hanging the exhibition — {Math.round(progress * 100)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
