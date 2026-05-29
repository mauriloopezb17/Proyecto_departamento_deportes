import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { apiFetch } from '../../utils/api'
import '../CSS/Admin.css'

interface Noticia {
  id_noticia: number
  titulo: string
  publicado: boolean
  fecha_creacion: string
  fecha_publicacion: string | null
  categoria_nombre: string
  resumen: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function MisNoticias() {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin)          { navigate('/', { replace: true }); return }
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (!user?.id_usuario) return
    apiFetch<Noticia[]>(`/api/noticias/usuario/${user.id_usuario}`)
      .then(setNoticias)
      .catch(() => setError('No se pudieron cargar las noticias.'))
      .finally(() => setLoading(false))
  }, [user?.id_usuario])

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Mis Noticias</h1>
        <p>Todas las noticias que has creado, publicadas y borradores.</p>
      </div>

      <div className="admin-card">
        {loading && <p className="admin-empty">Cargando...</p>}
        {error   && <p className="admin-empty" style={{ color: '#dc2626' }}>{error}</p>}

        {!loading && !error && noticias.length === 0 && (
          <div className="admin-placeholder">
            <div className="admin-placeholder-icon">
              <Newspaper size={48} />
            </div>
            <h3>Todavía no publicaste ninguna noticia</h3>
            <p>Cuando crees una noticia desde el CMS aparecerá aquí.</p>
            <Link to="/noticiasAdmin" className="admin-btn-primary" style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}>
              Ir al editor
            </Link>
          </div>
        )}

        {!loading && !error && noticias.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th>Publicada</th>
                </tr>
              </thead>
              <tbody>
                {noticias.map((n) => (
                  <tr key={n.id_noticia}>
                    <td style={{ fontWeight: 600, maxWidth: 280 }}>{n.titulo}</td>
                    <td>{n.categoria_nombre}</td>
                    <td>
                      <span className={`admin-pub-badge ${n.publicado ? 'published' : 'draft'}`}>
                        {n.publicado ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(n.fecha_creacion)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(n.fecha_publicacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MisNoticias
