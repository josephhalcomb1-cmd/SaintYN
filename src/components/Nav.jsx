export default function Nav({ count, onBag }) {
  return (
    <header className="nav">
      <nav className="nav__left" aria-label="Primary">
        <a href="#rack">Shop</a>
        <a href="#story">The Painting</a>
      </nav>
      <a className="nav__mark" href="#top" aria-label="SAINT YN home">
        <span className="nav__saint">Saint</span> YN
      </a>
      <div className="nav__right">
        <button className="nav__bag" onClick={onBag}>
          Bag <span className="nav__count">({count})</span>
        </button>
      </div>
    </header>
  )
}
