import React, { useState, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import EditorNoticias from '../components/Editor/EditorNoticias';
import '../pages/CSS/AdminNoticias.css'; // Crea este CSS aparte para estilos específicos de esta página

const AdminNoticias: React.FC = () => {
  const [newsData, setNewsData]     = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleFinalPublish = useCallback(() => {
    if (!newsData || !newsData.blocks || newsData.blocks.length === 0) {
      return alert('El editor está vacío. Escribe algo antes de exportar.');
    }
    try {
      const jsonString = JSON.stringify(newsData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `noticia_exportada_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('¡JSON generado y descargado con éxito!');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('No se pudo generar el archivo JSON.');
    }
  }, [newsData]);

  const togglePreview = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  return (
    <div className="an-root">


      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handleFinalPublish}
        userName="SSS"
      />

      <div className="an-body">

        <aside className="an-sidebar" />

      
        <main className="an-main">
          <EditorNoticias
            onDataChange={setNewsData}
            onPublish={handleFinalPublish}
            isShowingPreview={showSidebar}
            newsData={newsData}
          />
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="an-footer">
        <div className="an-footer-inner">
          <div className="an-footer-brand">
            <span className="an-footer-sigla">UCB</span>
            <span className="an-footer-nombre">
              Universidad Católica Boliviana<br />
              <em>"San Pablo"</em>
            </span>
          </div>
          <p className="an-footer-copy">
            © {new Date().getFullYear()} · Sistema de Gestión de Noticias · 
          </p>
          
        </div>
      </footer>
    </div>
  );
};

export default AdminNoticias;