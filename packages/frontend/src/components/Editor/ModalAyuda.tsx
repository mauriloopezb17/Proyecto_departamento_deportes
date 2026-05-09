import React from 'react';
import '../Editor/CSS/ModalAyuda.css'; // Crea este CSS aparte

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ModalAyuda: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-info-circle"></i> Guía del Editor</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <h4>Estructura de la noticia</h4>
          <ul>
            <li><i className="fas fa-plus"></i> <strong>Insertar:</strong> Haz clic en el botón "+" que aparece al lado de cada párrafo para añadir imágenes, tablas o títulos.</li>
            <li><i className="fas fa-mouse-pointer"></i> <strong>Formato:</strong> Selecciona cualquier texto para ver la barra rápida o usa la barra superior (Ribbon).</li>
            <li><i className="fas fa-arrows-alt-v"></i> <strong>Reordenar:</strong> Arrastra los bloques desde el icono de seis puntos al lado de cada elemento.</li>
          </ul>

          <h4>Atajos rápidos</h4>
          <p><code>CMD/CTRL + Z</code>: Deshacer</p>
          <p><code>TAB</code>: Sangría o navegar en tablas</p>
        </div>

        <div className="modal-footer">
          <button className="btn-entendido" onClick={onClose}>¡Entendido!</button>
        </div>
      </div>
    </div>
  );
};

export default ModalAyuda;