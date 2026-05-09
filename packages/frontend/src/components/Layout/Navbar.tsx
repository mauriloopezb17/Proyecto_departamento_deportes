import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, EyeOff, LogOut, Menu, X } from 'lucide-react';
import '../Layout/CSS/Navbar.css';

interface NavbarProps {
  onTogglePreview: () => void;
  onPublish: () => void;
  isShowingPreview: boolean;
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  onTogglePreview,
  onPublish,
  isShowingPreview,
  userName = 'Juan Pérez',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleAction = (fn: () => void) => {
    fn();
    setMenuOpen(false);
  };

  return (
    
    <nav className="navbar-cms">
      <div className="navbar-left">
        <span className="welcome-text">
          Hola, <strong>{userName}</strong>{' '}

        </span>
        <div className="navbar-divider" />
        <span className="navbar-page-title">Noticias</span>
      </div>

      <div className="navbar-actions navbar-desktop">
        <button
          className={`action-btn btn-preview ${isShowingPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title={isShowingPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
        >
          {isShowingPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{isShowingPreview ? 'OCULTAR' : 'VISTA PREVIA'}</span>
        </button>

        <button
          className="action-btn btn-publish-main"
          onClick={onPublish}
          title="Publicar noticia"
        >
          <Upload size={15} />
          <span>PUBLICAR</span>
        </button>

        <div className="navbar-divider" />

        <button className="logout-icon-btn" title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </div>

      {/* ── BOTON HAMBUGUER ── */}
      <button
        className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        title="Menú"
        aria-label="Abrir menú"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Parte pequeña de la seccion ── */}
      {menuOpen && (
        <div className="navbar-mobile-menu" ref={menuRef}>

          <div className="mobile-divider" />

          <button
            className={`mobile-action-btn ${isShowingPreview ? 'active' : ''}`}
            onClick={() => handleAction(onTogglePreview)}
          >
            {isShowingPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{isShowingPreview ? 'Ocultar vista previa' : 'Vista previa'}</span>
          </button>

          <button
            className="mobile-action-btn mobile-publish"
            onClick={() => handleAction(onPublish)}
          >
            <Upload size={16} />
            <span>Publicar</span>
          </button>

          <div className="mobile-divider" />

          <button className="mobile-action-btn mobile-logout">
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;