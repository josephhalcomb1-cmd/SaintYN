import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PRODUCTS, SIZES } from '../data'

const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export const money = (n) => `$${n.toFixed(0)}`

export default function Rack({ onAdd }) {
  const [colorIdx, setColorIdx] = useState(0)
  const [view, setView] = useState('front')
  const [size, setSize] = useState(null)
  const [nudge, setNudge] = useState(false)
  const [open, setOpen] = useState('artwork')
  const product = PRODUCTS[colorIdx]

  const add = () => {
    if (!size) {
      setNudge(true)
      return
    }
    onAdd({ ...product, size })
  }

  return (
    <section id="rack" className="rack">
      <motion.header
        className="rack__head"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-15%' }}
      >
        <motion.p className="label" variants={reveal}>“THE RACK”</motion.p>
        <motion.h2 variants={reveal} custom={1}>
          Collection Nº 01 <em>— Oil on cotton</em>
        </motion.h2>
      </motion.header>

      <div className="pdp">
        <motion.div
          className="pdp__gallery"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          variants={reveal}
        >
          <div
            className="pdp__stage"
            onMouseEnter={() => setView('back')}
            onMouseLeave={() => setView('front')}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={product.id + view}
                src={product[view]}
                alt={`${product.name} in ${product.color}, ${view}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <span className="pdp__tag label">“{view === 'front' ? 'FRONT' : 'BACK'}”</span>
          </div>
          <div className="pdp__thumbs" role="tablist" aria-label="Views">
            {['front', 'back'].map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={view === v ? 'is-on' : ''}
                onClick={() => setView(v)}
              >
                <img src={product[v]} alt="" />
                <span>{v}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="pdp__info"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
        >
          <motion.p className="label" variants={reveal}>SAINT YN — “HOODIE”</motion.p>
          <motion.h3 className="pdp__name" variants={reveal} custom={1}>
            {product.name}
          </motion.h3>
          <motion.p className="pdp__price" variants={reveal} custom={2}>
            {money(product.price)}
          </motion.p>

          <motion.div className="pdp__opt" variants={reveal} custom={3}>
            <p className="pdp__optlabel">
              Colour <span>{product.color}</span>
            </p>
            <div className="swatches">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  className={i === colorIdx ? 'is-on' : ''}
                  style={{ '--sw': p.swatch }}
                  onClick={() => setColorIdx(i)}
                  aria-label={p.color}
                  aria-pressed={i === colorIdx}
                />
              ))}
            </div>
          </motion.div>

          <motion.div className="pdp__opt" variants={reveal} custom={4}>
            <p className="pdp__optlabel">
              Size {nudge && !size && <span className="pdp__nudge">Select a size</span>}
            </p>
            <div className="sizes">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={s === size ? 'is-on' : ''}
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div className="pdp__buy" variants={reveal} custom={5}>
            <button className="btn btn--dark btn--block" onClick={add}>
              Add to bag — {money(product.price)}
            </button>
          </motion.div>

          <motion.div className="acc" variants={reveal} custom={6}>
            {[
              [
                'artwork',
                'The artwork',
                "FALLIN' YN — Saint YN, oil on canvas. The suspended instant between composure and collapse, reproduced across the chest.",
              ],
              [
                'garment',
                'The garment',
                'Front: FALLIN’ YN print. Sleeves: “Saint” script and YN monogram. Back: the exhibition placard, printed in full.',
              ],
              ['shipping', 'Shipping & returns', 'Shipping options and return terms are shown at checkout.'],
            ].map(([id, title, body]) => (
              <div key={id} className="acc__item">
                <button aria-expanded={open === id} onClick={() => setOpen(open === id ? null : id)}>
                  {title}
                  <span aria-hidden="true">{open === id ? '−' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === id && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {body}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
