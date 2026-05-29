import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Image as ImageIcon, Video, Construction } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import '../CSS/Admin.css'

function AdminGaleria() {
  const { tipo } = useParams<{ tipo: 'fotos' | 'videos' }>()
  const { isAdmin, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) navigate('/login', { replace: true })
    else if (!isAdmin) navigate('/', { replace: true })
  }, [loading, isAuthenticated, isAdmin, navigate])

  const isVideos = tipo === 'videos'
  const Icon = isVideos ? Video : ImageIcon
  const label = isVideos ? 'Videos' : 'Fotos'

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Galería · {label}</h1>
        <p>Administrar el contenido multimedia del portal.</p>
      </div>

      <div className="admin-card">
        <div className="admin-placeholder">
          <div className="admin-placeholder-icon">
            <Icon size={48} />
          </div>
          <h3>Sección en desarrollo</h3>
          <p>
            Esta funcionalidad aún no está conectada al backend. Próximamente
            podrás subir y administrar {label.toLowerCase()} desde acá.
          </p>
          <span className="admin-missing-tag">
            <Construction size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Endpoints pendientes
          </span>
        </div>
      </div>
    </div>
  )
}

export default AdminGaleria
