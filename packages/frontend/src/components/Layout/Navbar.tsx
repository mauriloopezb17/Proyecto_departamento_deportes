import React from 'react';
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
  userName = "Juan Pérez",
}) => {
  return (
    <nav className="navbar-cms">
      {/* ── Izquierda ── */}
      <div className="navbar-left">
        <span className="welcome-text">
          Hola, <strong>{userName}</strong>{' '}
          <span className="hand-emoji">MANO</span>
        </span>
        <div className="navbar-divider" />
        <span className="navbar-page-title">Noticias</span>
      </div>

      {/* ── Acciones derecha ── */}
      <div className="navbar-actions">
        {/* Vista previa */}
        <button
          className={`action-btn btn-preview ${isShowingPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title={isShowingPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
        >
          <i className={`fas ${isShowingPreview ? 'fa-eye-slash' : 'fa-eye'}`} />
          <span>{isShowingPreview ? 'OCULTAR' : 'VISTA PREVIA'}</span>
        </button>

        {/* Publicar */}
        <button
          className="action-btn btn-publish-main"
          onClick={onPublish}
          title="Publicar noticia en el portal"
        >
          <i className="fas fa-cloud-upload-alt" />
          <span>PUBLICAR</span>
        </button>

        <div className="navbar-divider" />

        {/* Logout */}
        <button className="logout-icon-btn" title="Cerrar sesión">
          <i className="fas fa-sign-out-alt" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;