
import React, { useState, useCallback, useEffect } from 'react';
import Navbar, { type SaveStatus } from '../components/Layout/Navbar';
import EditorNoticias from '../components/Editor/EditorNoticias';
import PublishModal, { type PublishPayload } from '../components/Editor/PublishModal';
import * as noticiaApi from '../services/noticiaApi';
import '../pages/CSS/AdminNoticias.css';

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function extractTitle(data: any): string {
  return data?.blocks?.find((b: any) => b.type === 'header')?.data?.text ?? 'Sin título';
}

const AdminNoticias: React.FC = () => {
  const [newsData, setNewsData]       = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [noticiaId, setNoticiaId]     = useState<number | null>(null);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('nuevo');
  const [categorias, setCategorias]   = useState<noticiaApi.Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [userName, setUserName]       = useState('');

  useEffect(() => {
    noticiaApi.getCategorias()
      .then(cats => {
        setCategorias(cats);
        if (cats.length > 0) setCategoriaId(cats[0].id_categoria_noticia);
      })
      .catch(console.error);

    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) setUserName(payload.email ?? '');
    }
  }, []);

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
    } catch (err: any) {
      setSaveStatus('error');
      alert(`Error al guardar: ${err.message}`);
    }
  }, [newsData, noticiaId, categoriaId]);

  // ── Publicar ──────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!newsData?.blocks?.length) { alert('El editor está vacío.'); return; }
    if (!categoriaId)              { alert('Selecciona una categoría.'); return; }

    // Guardar automáticamente si aún no tiene id en la BD
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
    } catch (err: any) {
      setSaveStatus('error');
      throw err;
    }
  }, [noticiaId, categoriaId, newsData]);

  const handleDataChange = useCallback((data: any) => {
    setNewsData(data);
    if (saveStatus === 'guardado' || saveStatus === 'publicado') setSaveStatus('nuevo');
  }, [saveStatus]);

  const togglePreview = useCallback(() => setShowSidebar(p => !p), []);

  return (
    <div className="an-root">
      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handlePublish}
        saveStatus={saveStatus}
        userName={userName}
      />

      <div className="an-body">
        <aside className="an-sidebar" />
        <main className="an-main">
          <EditorNoticias
            onDataChange={handleDataChange}
            onPublish={handlePublish}
            onSave={handleSave}
            isShowingPreview={showSidebar}
            newsData={newsData}
            saveStatus={saveStatus}
            categorias={categorias}
            categoriaId={categoriaId}
            onCategoriaChange={setCategoriaId}
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