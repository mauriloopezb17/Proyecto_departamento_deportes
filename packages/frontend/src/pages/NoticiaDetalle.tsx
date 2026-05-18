import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { apiFetch } from '../utils/api'
import './NoticiaDetalle.css'

interface NoticiaDetalle {
  id_noticia: number
  titulo: string
  resumen: string | null
  contenido: { blocks: Block[] } | null
  categoria_nombre: string
  autor_nombre: string
  autor_apellido: string
  fecha_publicacion: string | null
  fecha_creacion: string
  imagenes: { url_storage: string; es_portada: boolean }[]
}

interface Block {
  type: string
  data: any
}

function renderBlock(block: Block, idx: number): JSX.Element | null {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={idx} dangerouslySetInnerHTML={{ __html: block.data.text }} />
      )
    case 'header': {
      const level = block.data.level ?? 2
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      return (
        <Tag key={idx} dangerouslySetInnerHTML={{ __html: block.data.text }} />
      )
    }
    case 'list': {
      const items: string[] = block.data.items ?? []
      return block.data.style === 'ordered' ? (
        <ol key={idx}>
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      ) : (
        <ul key={idx}>
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )
    }
    case 'image':
      return (
        <figure key={idx} className="nd-figure">
          <img
            src={block.data.file?.url ?? block.data.url}
            alt={block.data.caption ?? ''}
          />
          {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
        </figure>
      )
    case 'quote':
      return (
        <blockquote key={idx} className="nd-quote">
          <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
          {block.data.caption && <cite>{block.data.caption}</cite>}
        </blockquote>
      )
    case 'delimiter':
      return <hr key={idx} className="nd-delimiter" />
    case 'table': {
      const rows: string[][] = block.data.content ?? []
      return (
        <div key={idx} className="nd-table-wrap">
          <table className="nd-table">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    default:
      return null
  }
}

function NoticiaDetalle() {
  const { id } = useParams<{ id: string }>()
  const [noticia, setNoticia] = useState<NoticiaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    apiFetch<NoticiaDetalle>(`/api/noticias/${id}`)
      .then(setNoticia)
      .catch(() => setError('No se pudo cargar la noticia.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return <div className="nd-status">Cargando noticia...</div>

  if (error || !noticia)
    return (
      <div className="nd-status nd-error">
        {error || 'Noticia no encontrada.'}
      </div>
    )

  const portada = noticia.imagenes?.find((i) => i.es_portada)?.url_storage
  const fecha = noticia.fecha_publicacion ?? noticia.fecha_creacion
  const fechaFmt = new Date(fecha).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <PageHeader title={noticia.titulo} thinBorder />
      <div className="container nd-container">
        <Link to="/noticias" className="nd-back">
          <ArrowLeft size={16} /> Volver a noticias
        </Link>

        <div className="nd-meta">
          <span className="nd-tag">
            <Tag size={14} /> {noticia.categoria_nombre}
          </span>
          <span className="nd-info">
            <User size={14} /> {noticia.autor_nombre} {noticia.autor_apellido}
          </span>
          <span className="nd-info">
            <Calendar size={14} /> {fechaFmt}
          </span>
        </div>

        {portada && (
          <div className="nd-hero-img">
            <img src={portada} alt={noticia.titulo} />
          </div>
        )}

        {noticia.resumen && <p className="nd-resumen">{noticia.resumen}</p>}

        <div className="nd-body">
          {noticia.contenido?.blocks?.map((block, i) => renderBlock(block, i))}
        </div>
      </div>
    </>
  )
}

export default NoticiaDetalle
