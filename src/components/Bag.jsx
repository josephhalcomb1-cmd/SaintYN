import { AnimatePresence, motion } from 'framer-motion'
import { money } from './Rack'

export default function Bag({ open, items, onClose, onRemove }) {
  const subtotal = items.reduce((n, i) => n + i.price, 0)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="bag__scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="bag"
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <header className="bag__head">
              <p className="label">“BAG” ({items.length})</p>
              <button onClick={onClose} aria-label="Close bag">Close</button>
            </header>
            {items.length === 0 ? (
              <p className="bag__empty">Your bag is empty.</p>
            ) : (
              <ul className="bag__list">
                {items.map((it, idx) => (
                  <li key={idx}>
                    <img src={it.front} alt="" />
                    <div>
                      <p className="bag__name">{it.name}</p>
                      <p className="bag__meta">
                        {it.color} — {it.size}
                      </p>
                      <button className="bag__remove" onClick={() => onRemove(idx)}>
                        Remove
                      </button>
                    </div>
                    <p className="bag__price">{money(it.price)}</p>
                  </li>
                ))}
              </ul>
            )}
            <footer className="bag__foot">
              <p>
                Subtotal <span>{money(subtotal)}</span>
              </p>
              {/* TODO: connect checkout (Shopify / Stripe). */}
              <button className="btn btn--dark btn--block" disabled={!items.length}>
                Checkout
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
