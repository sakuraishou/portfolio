import './styles.scss'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__logo" href="/">
          Portfolio
        </a>
        <nav className="header__nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/works">Works</a>
          <a href="/contact">Contact</a>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
