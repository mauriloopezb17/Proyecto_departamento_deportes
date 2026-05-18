import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Layout/Navbar'
import EditorNoticias from '../components/Editor/EditorNoticias'
import { apiFetch } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import '../pages/CSS/AdminNoticias.css'

interface Categoria {
  id_categoria_noticia: number
  nombre: string
}

interface NoticiaItem {
  id_noticia: number
  titulo: string
  publicado: boolean
  fecha_creacion: string
  categoria_nombre: string
  contenido: any
  resumen: string | null
  id_categoria_noticia: number
}

const AdminNoticias: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [newsData, setNewsData] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  // form fields
  const [titulo, setTitulo] = useState('')
  const [resumen, setResumen] = useState('')
  const [idCategoria, setIdCategoria] = useState<number | ''>('')
  const [publicado, setPublicado] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const [initialEditorData, setInitialEditorData] = useState<any>(undefined)

  // remote data
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [noticias, setNoticias] = useState<NoticiaItem[]>([])

  // UI state
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!isAdmin) {
      navigate('/')
      return
    }
    apiFetch<Categoria[]>('/api/noticias/categorias').then(setCategorias).catch(console.error)
    loadNoticias()
  }, [isAuthenticated, isAdmin])

  const loadNoticias = () => {
    apiFetch<NoticiaItem[]>('/api/noticias').then(setNoticias).catch(console.error)
  }

  const handleSave = useCallback(async () => {
    if (!titulo.trim()) {
      setStatus({ type: 'error', msg: 'El título es obligatorio.' })
      return
    }
    if (!idCategoria) {
      setStatus({ type: 'error', msg: 'Seleccioná una categoría.' })
      return
    }
    if (!newsData?.blocks?.length) {
      setStatus({ type: 'error', msg: 'El editor está vacío. Escribí algo antes de guardar.' })
      return
    }

    setSaving(true)
    setStatus(null)

    const body = {
      id_usuario_autor: user!.id_usuario,
      id_categoria_noticia: idCategoria,
      titulo,
      resumen,
      contenido: newsData,
      publicado,
      imagenes: [],
    }

    try {
      if (editingId) {
        await apiFetch(`/api/noticias/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
        setStatus({ type: 'success', msg: 'Noticia actualizada correctamente.' })
      } else {
        await apiFetch('/api/noticias', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        setStatus({ type: 'success', msg: 'Noticia publicada correctamente.' })
      }
      resetForm()
      loadNoticias()
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message ?? 'Error al guardar la noticia.' })
    } finally {
      setSaving(false)
    }
  }, [titulo, resumen, idCategoria, publicado, newsData, editingId, user])

  const resetForm = () => {
    setTitulo('')
    setResumen('')
    setIdCategoria('')
    setPublicado(false)
    setEditingId(null)
    setInitialEditorData(undefined)
    setEditorKey((k) => k + 1)
  }

  const handleEdit = (n: NoticiaItem) => {
    setEditingId(n.id_noticia)
    setTitulo(n.titulo)
    setResumen(n.resumen ?? '')
    setIdCategoria(n.id_categoria_noticia)
    setPublicado(n.publicado)
    setInitialEditorData(n.contenido ?? undefined)
    setEditorKey((k) => k + 1)
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia permanentemente?')) return
    try {
      await apiFetch(`/api/noticias/${id}`, { method: 'DELETE' })
      loadNoticias()
      if (editingId === id) resetForm()
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message ?? 'Error al eliminar.' })
    }
  }

  const togglePreview = useCallback(() => setShowSidebar((prev) => !prev), [])

  const displayName = user
    ? `${user.nombres ?? ''} ${user.ape_paterno ?? ''}`.trim() || user.email
    : 'Admin'

  return (
    <div className="an-root">
      <Navbar
        onTogglePreview={togglePreview}
        isShowingPreview={showSidebar}
        onPublish={handleSave}
        userName={displayName}
      />

      <div className="an-body">
        {/* ── FORM SIDEBAR ── */}
        <aside className="an-sidebar an-sidebar-form">
          <div className="an-form">
            <h3 className="an-form-title">
              {editingId ? 'Editando noticia' : 'Nueva noticia'}
            </h3>

            {status && (
              <div className={`an-status an-status-${status.type}`}>{status.msg}</div>
            )}

            <label className="an-label">Título *</label>
            <input
              className="an-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la noticia"
            />

            <label className="an-label">Resumen</label>
            <textarea
              className="an-input an-textarea"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Breve descripción visible en listados"
              rows={3}
            />

            <label className="an-label">Categoría *</label>
            <select
              className="an-input"
              value={idCategoria}
              onChange={(e) => setIdCategoria(Number(e.target.value))}
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map((c) => (
                <option key={c.id_categoria_noticia} value={c.id_categoria_noticia}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label className="an-check-label">
              <input
                type="checkbox"
                checked={publicado}
                onChange={(e) => setPublicado(e.target.checked)}
              />
              Publicar inmediatamente
            </label>

            <button className="an-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar noticia' : 'Publicar noticia'}
            </button>

            {editingId && (
              <button className="an-cancel-btn" onClick={resetForm}>
                Cancelar edición
              </button>
            )}
          </div>

          {/* ── NEWS LIST ── */}
          <div className="an-news-list">
            <h4 className="an-list-title">Noticias existentes ({noticias.length})</h4>
            {noticias.length === 0 && (
              <p className="an-list-empty">No hay noticias aún.</p>
            )}
            {noticias.map((n) => (
              <div key={n.id_noticia} className="an-news-item">
                <div className="an-news-item-info">
                  <span className={`an-pub-badge ${n.publicado ? 'published' : 'draft'}`}>
                    {n.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                  <span className="an-news-item-title">{n.titulo}</span>
                  <span className="an-news-item-cat">{n.categoria_nombre}</span>
                </div>
                <div className="an-news-item-actions">
                  <button className="an-item-btn edit" onClick={() => handleEdit(n)}>
                    Editar
                  </button>
                  <button className="an-item-btn delete" onClick={() => handleDelete(n.id_noticia)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── EDITOR ── */}
        <main className="an-main">
          <EditorNoticias
            key={editorKey}
            onDataChange={setNewsData}
            onPublish={handleSave}
            isShowingPreview={showSidebar}
            newsData={newsData}
            initialData={initialEditorData}
          />
        </main>
      </div>
    </div>
  )
}

export default AdminNoticias
