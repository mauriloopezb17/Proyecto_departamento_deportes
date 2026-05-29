import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import type { SaveStatus } from '../components/Layout/Navbar';
import EditorNoticias from '../components/Editor/EditorNoticias';
import PublishModal from '../components/Editor/PublishModal';
import type { PublishPayload } from '../components/Editor/PublishModal';
import * as noticiaApi from '../services/noticiaApi';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import '../pages/CSS/AdminNoticias.css';

interface NoticiaItem {
  id_noticia: number;
  titulo: string;
  publicado: boolean;
  fecha_creacion: string;
  categoria_nombre: string;
  contenido: any;
  resumen: string | null;
  id_categoria_noticia: number;
}

function extractTitle(data: any): string {
  return data?.blocks?.find((b: any) => b.type === 'header')?.data?.text ?? 'Sin título';
}

const AdminNoticias: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [newsData, setNewsData]       = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [noticiaId, setNoticiaId]     = useState<number | null>(null);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('nuevo');
  const [categorias, setCategorias]   = useState<noticiaApi.Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [editorKey, setEditorKey]     = useState(0);
  const [initialEditorData, setInitialEditorData] = useState<any>(undefined);
  const [noticias, setNoticias]       = useState<NoticiaItem[]>([]);
  const [listStatus, setListStatus]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [panelOpen, setPanelOpen]     = useState(false);

  const noticiaIdRef = useRef<number | null>(null);

  const setId = (id: number | null) => {
    noticiaIdRef.current = id;
    setNoticiaId(id);
  };

  useEffect(() => {
    noticiaApi.getCategorias()
      .then(cats => {
        setCategorias(cats);
        if (cats.length > 0) setCategoriaId(cats[0].id_categoria_noticia);
      })
      .catch(console.error);
    loadNoticias();
  }, [isAuthenticated, isAdmin]);

  const loadNoticias = () => {
    apiFetch<NoticiaItem[]>('/api/noticias')
      .then(setNoticias)
      .catch(console.error);
  };

  const handleSave = useCallback(async () => {
    if (!newsData?.blocks?.length) { alert('El editor está vacío.'); return; }
    if (!categoriaId)              { alert('Selecciona una categoría.'); return; }

    setSaveStatus('guardando');
    try {
      const result = await noticiaApi.saveNoticia(
        { titulo: extractTitle(newsData), contenido: newsData, id_categoria_noticia: categoriaId },
        noticiaIdRef.current,
      );
      setId(result.id);
      if (result.contenido) setNewsData(result.contenido);
      setSaveStatus('guardado');
      loadNoticias();
    } catch (err: any) {
      setSaveStatus('error');
      alert(`Error al guardar: ${err.message}`);
    }
  }, [newsData, categoriaId]);

  const handlePublish = useCallback(async () => {
    if (!newsData?.blocks?.length) { alert('El editor está vacío.'); return; }
    if (!categoriaId)              { alert('Selecciona una categoría.'); return; }

    setSaveStatus('guardando');
    try {
      const result = await noticiaApi.saveNoticia(
        { titulo: extractTitle(newsData), contenido: newsData, id_categoria_noticia: categoriaId },
        noticiaIdRef.current,
      );
      setId(result.id);
      if (result.contenido) setNewsData(result.contenido);
      setSaveStatus('guardado');
    } catch (err: any) {
      setSaveStatus('error');
      alert(`Error al guardar antes de publicar: ${err.message}`);
      return;
    }
    setShowModal(true);
  }, [newsData, categoriaId]);

  const handleModalConfirm = useCallback(async (payload: PublishPayload): Promise<void> => {
    if (!noticiaIdRef.current || !categoriaId) return;

    setSaveStatus('publicando');
    try {
      await noticiaApi.publishNoticia(noticiaIdRef.current, {
        titulo:               payload.titulo,
        contenido:            newsData,
        id_categoria_noticia: categoriaId,
        resumen:              payload.resumen,
        imagenUrl:            payload.imagenUrl,
      });
      setSaveStatus('publicado');
      loadNoticias();
    } catch (err: any) {
      setSaveStatus('error');
      throw err;
    }
  }, [categoriaId, newsData]);

  const handleEdit = (n: NoticiaItem) => {
    setId(n.id_noticia);
    setCategoriaId(n.id_categoria_noticia);
    setInitialEditorData(n.contenido ?? undefined);
    setNewsData(n.contenido ?? null);
    setEditorKey(k => k + 1);
    setSaveStatus('guardado');
    setListStatus(null);
    setPanelOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia permanentemente?')) return;
    try {
      await apiFetch(`/api/noticias/${id}`, { method: 'DELETE' });
      if (noticiaIdRef.current === id) resetEditor();
      loadNoticias();
    } catch (e: any) {
      setListStatus({ type: 'error', msg: e.message ?? 'Error al eliminar.' });
    }
  };

  const resetEditor = () => {
    setId(null);
    setInitialEditorData(undefined);
    setNewsData(null);
    setEditorKey(k => k + 1);
    setSaveStatus('nuevo');
  };

  const handleDataChange = useCallback((data: any) => {
    setNewsData(data);
    if (saveStatus === 'guardado' || saveStatus === 'publicado') setSaveStatus('nuevo');
  }, [saveStatus]);

  const togglePreview = useCallback(() => setShowSidebar(p => !p), []);

  const displayName = user
    ? `${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email
    : 'Admin';
  const [panelTop, setPanelTop] = useState(90);

useEffect(() => {
  const update = () => {
    const navbar = document.querySelector('.navbar-cms');
    const ribbon = document.querySelector('.ribbon-toolbar');
    if (navbar && ribbon) {
      setPanelTop(
        navbar.getBoundingClientRect().height +
        ribbon.getBoundingClientRect().height
      );
    }
  };

  update(); // medición inicial

  const ro = new ResizeObserver(update);
  const navbar = document.querySelector('.navbar-cms');
  const ribbon = document.querySelector('.ribbon-toolbar');
  if (navbar) ro.observe(navbar);
  if (ribbon) ro.observe(ribbon);

  return () => ro.disconnect();
}, []);

  return (
    <div className="an-root">
      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handlePublish}
        saveStatus={saveStatus}
        userName={displayName}
        onBack={() => navigate('/admin')}
      />

      <div className="an-body">
        <main className="an-main">
          <EditorNoticias
            key={editorKey}
            onDataChange={handleDataChange}
            onPublish={handlePublish}
            onSave={handleSave}
            isShowingPreview={showSidebar}
            newsData={newsData}
            saveStatus={saveStatus}
            categorias={categorias}
            categoriaId={categoriaId}
            onCategoriaChange={setCategoriaId}
            initialData={initialEditorData}
          />
        </main>
      </div>

      {/* ── Botón flotante ── */}
      <button
        className={`an-panel-toggle ${panelOpen ? 'open' : ''}`}
        onClick={() => setPanelOpen(p => !p)}
        title={panelOpen ? 'Cerrar panel' : 'Ver noticias guardadas'}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.3s ease', transform: panelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {!panelOpen && noticias.length > 0 && (
          <span className="an-toggle-badge">{noticias.length}</span>
        )}
      </button>

      {/* ── Overlay ── */}
      {panelOpen && (
        <div className="an-panel-overlay" onClick={() => setPanelOpen(false)} />
      )}

      {/* ── Panel deslizante ── */}
      <aside className={`an-news-panel ${panelOpen ? 'open' : ''}`}
        style={{ top: panelTop }}>
        <div className="an-panel-header">
          <h4 className="an-panel-title">
            Noticias
            <span className="an-panel-count">{noticias.length}</span>
          </h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {noticiaId && (
              <button className="an-new-btn" onClick={() => { resetEditor(); setPanelOpen(false); }}>
                + Nueva
              </button>
            )}
            <button className="an-panel-close" onClick={() => setPanelOpen(false)}>✕</button>
          </div>
        </div>

        {listStatus && (
          <div className={`an-status an-status-${listStatus.type}`}>{listStatus.msg}</div>
        )}

        <div className="an-panel-list">
          {noticias.length === 0 ? (
            <p className="an-list-empty">No hay noticias aún.</p>
          ) : (
            noticias.map((n) => (
              <div
                key={n.id_noticia}
                className={`an-news-item ${noticiaId === n.id_noticia ? 'active' : ''}`}
              >
                <div className="an-news-item-info">
                  <span className={`an-pub-badge ${n.publicado ? 'published' : 'draft'}`}>
                    {n.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                  <span className="an-news-item-title">{n.titulo}</span>
                  <span className="an-news-item-cat">{n.categoria_nombre}</span>
                </div>
                <div className="an-news-item-actions">
                  <button className="an-item-btn edit"   onClick={() => handleEdit(n)}>Editar</button>
                  <button className="an-item-btn delete" onClick={() => handleDelete(n.id_noticia)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <PublishModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        newsData={newsData}
      />
    </div>
  );
};

export default AdminNoticias;