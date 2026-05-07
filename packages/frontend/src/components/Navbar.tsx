import { NavLink, Link } from 'react-router-dom'
import { User } from 'lucide-react'
import './Navbar.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/torneos', label: 'Torneos' },
  { to: '/club', label: 'Club' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/inscribete', label: 'Inscríbete' },
]

function Navbar() {
  return (
    <nav className="ucb-nav">
      <Link to="/" className="logo-area">
        <img
          src="/ucb-assets/UCB%20escudo.png"
          alt="UCB Escudo"
          className="logo-img"
        />
        <span>Gestión Deportiva</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
        <Link to="/login" className="btn-login">
          <User size={16} strokeWidth={2.5} />
          Inicia Sesión
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
