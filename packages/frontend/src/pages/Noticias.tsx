import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Newspaper } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { apiFetch } from '../utils/api'
import './Noticias.css'

interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  categoria_nombre: string
  autor_nombre: string
  autor_apellido: string
  fecha_publicacion: string | null
  fecha_creacion: string
  imagen_portada: string | null
}

function Noticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Noticia[]>('/api/noticias?publicado=true')
      .then(setNoticias)
      .catch(() => setError('No se pudieron cargar las noticias.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Centro de Noticias"
        subtitle="Mantente al día con los eventos y logros de nuestra comunidad deportiva."
        thinBorder
      />
      <div className="container news-container">
        {loading && <p className="news-status">Cargando noticias...</p>}
        {error && <p className="news-status news-error">{error}</p>}
        {!loading && !error && noticias.length === 0 && (
          <p className="news-status">No hay noticias publicadas aún.</p>
        )}
        <div className="news-grid">
          {noticias.map((n) => (
            <article key={n.id_noticia} className="news-card reveal">
              <div className="news-img">
                {n.imagen_portada ? (
                  <img src={n.imagen_portada} alt={n.titulo} className="news-cover" />
                ) : (
                  <Newspaper size={80} />
                )}
              </div>
              <div className="news-content">
                <span className="news-tag">{n.categoria_nombre}</span>
                <h3>{n.titulo}</h3>
                <p>{n.resumen ?? ''}</p>
                <Link to={`/noticias/${n.id_noticia}`} className="btn-read">
                  Leer más <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Noticias
