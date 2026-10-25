import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

export function Layout() {
  const location = useLocation()

  return (
    <div className="layout">
      <nav className="navbar">
        <Link to="/" className="brand">PromptWise</Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Optimize
            </Link>
          </li>
          <li>
            <Link to="/benchmark" className={location.pathname === '/benchmark' ? 'active' : ''}>
              Benchmark
            </Link>
          </li>
          <li>
            <Link to="/catalog" className={location.pathname === '/catalog' ? 'active' : ''}>
              Catalog
            </Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}