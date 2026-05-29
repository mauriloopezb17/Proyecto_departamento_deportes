import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './Layout.css'

function Layout() {
  useScrollReveal()
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <Footer />
      </footer>
    </div>
  )
}

export default Layout
