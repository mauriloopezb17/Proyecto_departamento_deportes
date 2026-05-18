import React, { useState, useCallback, useEffect } from 'react';
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

  // news list state
  const [noticias, setNoticias]       = useState<NoticiaItem[]>([]);
  const [listStatus, setListStatus]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isAdmin)         { navigate('/');      return; }

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

  // ── Guardar borrador ──────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!newsData?.blocks?.length) { alert('El editor está vacío.'); return; }
    if (!categoriaId)              { alert('Selecciona una categoría.'); return; }

    setSaveStatus('guardando');
    try {
      const id = await noticiaApi.saveNoticia(
        { titulo: extractTitle(newsData), contenido: newsData, id_categoria_noticia: categoriaId },
        noticiaId,
      );
      setNoticiaId(id);
      setSaveStatus('guardado');
      loadNoticias();
    } catch (err: any) {
      setSaveStatus('error');
      alert(`Error al guardar: ${err.message}`);
    }
  }, [newsData, noticiaId, categoriaId]);

  // ── Publicar ──────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!newsData?.blocks?.length) { alert('El editor está vacío.'); return; }
    if (!categoriaId)              { alert('Selecciona una categoría.'); return; }

    if (!noticiaId) {
      setSaveStatus('guardando');
      try {
        const id = await noticiaApi.saveNoticia(
          { titulo: extractTitle(newsData), contenido: newsData, id_categoria_noticia: categoriaId },
          null,
        );
        setNoticiaId(id);
        setSaveStatus('guardado');
      } catch (err: any) {
        setSaveStatus('error');
        alert(`Error al guardar antes de publicar: ${err.message}`);
        return;
      }
    }

    setShowModal(true);
  }, [newsData, noticiaId, categoriaId]);

  // ── Confirmar desde el modal ──────────────────────────────────────────────

  const handleModalConfirm = useCallback(async (payload: PublishPayload): Promise<void> => {
    if (!noticiaId || !categoriaId) return;

    setSaveStatus('publicando');
    try {
      await noticiaApi.publishNoticia(noticiaId, {
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
  }, [noticiaId, categoriaId, newsData]);

  // ── Editar noticia existente ──────────────────────────────────────────────

  const handleEdit = (n: NoticiaItem) => {
    setNoticiaId(n.id_noticia);
    setCategoriaId(n.id_categoria_noticia);
    setInitialEditorData(n.contenido ?? undefined);
    setEditorKey(k => k + 1);
    setSaveStatus('guardado');
    setListStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia permanentemente?')) return;
    try {
      await apiFetch(`/api/noticias/${id}`, { method: 'DELETE' });
      if (noticiaId === id) resetEditor();
      loadNoticias();
    } catch (e: any) {
      setListStatus({ type: 'error', msg: e.message ?? 'Error al eliminar.' });
    }
  };

  const resetEditor = () => {
    setNoticiaId(null);
    setInitialEditorData(undefined);
    setEditorKey(k => k + 1);
    setSaveStatus('nuevo');
  };

  // ── Misc ──────────────────────────────────────────────────────────────────

  const handleDataChange = useCallback((data: any) => {
    setNewsData(data);
    if (saveStatus === 'guardado' || saveStatus === 'publicado') setSaveStatus('nuevo');
  }, [saveStatus]);

  const togglePreview = useCallback(() => setShowSidebar(p => !p), []);

  const displayName = user
    ? `${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email
    : 'Admin';

  return (
    <div className="an-root">
      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handlePublish}
        saveStatus={saveStatus}
        userName={displayName}
      />

      <div className="an-body">
        {/* ── NEWS LIST SIDEBAR ── */}
        <aside className="an-sidebar an-sidebar-form">
          <div className="an-news-list">
            <div className="an-list-header">
              <h4 className="an-list-title">Noticias ({noticias.length})</h4>
              {noticiaId && (
                <button className="an-new-btn" onClick={resetEditor}>+ Nueva</button>
              )}
            </div>

            {listStatus && (
              <div className={`an-status an-status-${listStatus.type}`}>{listStatus.msg}</div>
            )}

            {noticias.length === 0 && (
              <p className="an-list-empty">No hay noticias aún.</p>
            )}

            {noticias.map((n) => (
              <div key={n.id_noticia} className={`an-news-item ${noticiaId === n.id_noticia ? 'active' : ''}`}>
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
            ))}
          </div>
        </aside>

        {/* ── EDITOR ── */}
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
