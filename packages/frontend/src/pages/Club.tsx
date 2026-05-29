import { useState, useEffect } from 'react'
import {
  Search, User, Play, X, Camera, Video,
  Clock, MapPin,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import { apiFetch } from '../utils/api'
import './Club.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EntrenadorRow {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string
}

interface Entrenador {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  asignaciones: { nombre_disciplina: string; nombre_categoria: string }[]
}

interface Horario {
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  nombre_disciplina: string
  nombre_espacio: string
  entrenador_nombres: string | null
  entrenador_apellido: string | null
}

interface GaleriaEvento {
  id_multimedia: number
  url_archivo: string
  tipo_archivo: string
  id_torneo: number | null
  id_partido: number | null
  fecha_subida: string
}

interface JugadorDestacado {
  id_deportista: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  url_foto: string | null
  nombre_disciplina: string
  nombre_categoria: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DISC_COLORS = ['#1e40af', '#166534', '#9a3412', '#6d28d9', '#0e7490', '#b45309', '#be185d']

function discColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return DISC_COLORS[Math.abs(h) % DISC_COLORS.length]
}

function fmtHora(t: string) {
  return t?.slice(0, 5) ?? ''
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function groupEntrenadores(rows: EntrenadorRow[]): Entrenador[] {
  const map = new Map<number, Entrenador>()
  for (const r of rows) {
    if (!map.has(r.id_entrenador)) {
      map.set(r.id_entrenador, {
        id_entrenador: r.id_entrenador,
        nombres: r.nombres,
        ape_paterno: r.ape_paterno,
        ape_materno: r.ape_materno,
        url_foto: r.url_foto,
        asignaciones: [],
      })
    }
    map.get(r.id_entrenador)!.asignaciones.push({
      nombre_disciplina: r.nombre_disciplina,
      nombre_categoria: r.nombre_categoria,
    })
  }
  return Array.from(map.values())
}

// ── Tab: Galería ──────────────────────────────────────────────────────────────

function GaleriaTab() {
  const [items, setItems]     = useState<GaleriaEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'fotos' | 'videos'>('fotos')
  const [lightbox, setLightbox] = useState<GaleriaEvento | null>(null)

  useEffect(() => {
    apiFetch<GaleriaEvento[]>('/api/info/galeria-eventos')
      .then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  const fotos  = items.filter(i => i.tipo_archivo === 'foto')
  const videos = items.filter(i => i.tipo_archivo === 'video')
  const visible = filter === 'fotos' ? fotos : videos

  return (
    <>
      <div className="galeria-header">
        <div className="galeria-type-toggle">
          <button className={`galeria-toggle-btn ${filter === 'fotos' ? 'active' : ''}`} onClick={() => setFilter('fotos')}>
            <Camera size={16} /> Fotos ({loading ? '…' : fotos.length})
          </button>
          <button className={`galeria-toggle-btn ${filter === 'videos' ? 'active' : ''}`} onClick={() => setFilter('videos')}>
            <Video size={16} /> Videos ({loading ? '…' : videos.length})
          </button>
        </div>
      </div>

      <div className="galeria-grid">
        {loading ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Sin contenido disponible.</p>
        ) : filter === 'fotos' ? (
          fotos.map(item => (
            <button
              key={item.id_multimedia}
              className="galeria-card reveal"
              onClick={() => setLightbox(item)}
              aria-label="Ver foto"
            >
              <div className="galeria-thumb" style={{ background: '#1e293b' }}>
                <img src={item.url_archivo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="galeria-thumb-overlay">
                  <Search size={24} />
                </div>
              </div>
              <div className="galeria-card-info">
                <span className="galeria-card-date">{fmtFecha(item.fecha_subida)}</span>
              </div>
            </button>
          ))
        ) : (
          videos.map(item => (
            <a key={item.id_multimedia} href={item.url_archivo} className="galeria-card reveal" target="_blank" rel="noreferrer">
              <div className="galeria-thumb" style={{ background: '#1e293b', position: 'relative' }}>
                <div className="galeria-play-btn" style={{ position: 'absolute' }}>
                  <Play size={28} fill="white" />
                </div>
              </div>
              <div className="galeria-card-info">
                <span className="galeria-card-date">{fmtFecha(item.fecha_subida)}</span>
              </div>
            </a>
          ))
        )}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-box" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={22} /></button>
            <div className="lightbox-img" style={{ background: '#0f172a', height: 340 }}>
              <img src={lightbox.url_archivo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div className="lightbox-info">
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{fmtFecha(lightbox.fecha_subida)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Tab: Horarios ─────────────────────────────────────────────────────────────

function HorariosTab() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState('Todas')

  useEffect(() => {
    apiFetch<Horario[]>('/api/info/horarios')
      .then(setHorarios).catch(() => setHorarios([])).finally(() => setLoading(false))
  }, [])

  const disciplines = ['Todas', ...Array.from(new Set(horarios.map(h => h.nombre_disciplina)))]
  const filtered = selected === 'Todas' ? horarios : horarios.filter(h => h.nombre_disciplina === selected)

  return (
    <>
      <div className="horarios-filter">
        {disciplines.map(d => (
          <button key={d} className={`hor-filter-btn ${selected === d ? 'active' : ''}`} onClick={() => setSelected(d)}>
            {d}
          </button>
        ))}
      </div>

      <div className="horarios-grid">
        {loading ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Sin horarios disponibles.</p>
        ) : filtered.map((h, i) => (
          <div key={i} className="horario-card reveal">
            <div className="horario-card-header" style={{ background: discColor(h.nombre_disciplina) }}>
              <div>
                <h3 className="horario-discipline">{h.nombre_disciplina}</h3>
                <span className="horario-category">{h.dia_semana}</span>
              </div>
            </div>
            <div className="horario-card-body">
              <div className="horario-detail">
                <Clock size={15} />
                <span>{fmtHora(h.hora_inicio)} – {fmtHora(h.hora_fin)}</span>
              </div>
              <div className="horario-detail">
                <MapPin size={15} />
                <span>{h.nombre_espacio}</span>
              </div>
              {(h.entrenador_nombres || h.entrenador_apellido) && (
                <div className="horario-detail">
                  <User size={15} />
                  <span>Entrenador: <strong>{[h.entrenador_nombres, h.entrenador_apellido].filter(Boolean).join(' ')}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="horarios-note">
        * Los horarios pueden modificarse en temporada de exámenes. Confirmá con tu entrenador.
      </p>
    </>
  )
}

// ── Tab: Entrenadores ─────────────────────────────────────────────────────────

function EntrenadoresTab() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    apiFetch<EntrenadorRow[]>('/api/info/entrenadores')
      .then(rows => setEntrenadores(groupEntrenadores(rows)))
      .catch(() => setEntrenadores([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando...</p>
  if (entrenadores.length === 0) return <p className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Sin entrenadores registrados.</p>

  return (
    <div className="coaches-grid">
      {entrenadores.map(e => {
        const nombre = `${e.nombres} ${e.ape_paterno}${e.ape_materno ? ` ${e.ape_materno}` : ''}`
        return (
          <article key={e.id_entrenador} className="coach-card reveal">
            <div className="coach-top">
              <div className="coach-photo">
                {e.url_foto
                  ? <img src={e.url_foto} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <User size={56} />
                }
              </div>
              <div className="coach-header-info">
                <h3>{nombre}</h3>
                <div className="coach-disciplines">
                  {e.asignaciones.map((a, i) => (
                    <span key={i} className="coach-disc-tag">{a.nombre_disciplina}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="coach-body">
              {e.asignaciones.map((a, i) => (
                <p key={i} style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {a.nombre_disciplina} — {a.nombre_categoria}
                </p>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}

// ── Tab: Jugadores ────────────────────────────────────────────────────────────

function PlayersTab() {
  const [jugadores, setJugadores] = useState<JugadorDestacado[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [discFilter, setDiscFilter] = useState('Todas')

  useEffect(() => {
    apiFetch<JugadorDestacado[]>('/api/deportistas/destacados')
      .then(setJugadores).catch(() => setJugadores([])).finally(() => setLoading(false))
  }, [])

  const disciplines = ['Todas', ...Array.from(new Set(jugadores.map(j => j.nombre_disciplina)))]
  const visible = jugadores.filter(j => {
    const nombre = `${j.nombres} ${j.ape_paterno}`.toLowerCase()
    const matchSearch = nombre.includes(search.toLowerCase())
    const matchDisc   = discFilter === 'Todas' || j.nombre_disciplina === discFilter
    return matchSearch && matchDisc
  })

  return (
    <>
      <div className="roster-filters">
        <div className="search-area">
          <Search size={18} />
          <input type="text" placeholder="Buscar jugador por nombre..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <label htmlFor="disciplina"><strong>Disciplina:</strong></label>
          <select id="disciplina" value={discFilter} onChange={e => setDiscFilter(e.target.value)}>
            {disciplines.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="players-grid">
        {loading ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Sin jugadores destacados.</p>
        ) : visible.map(j => {
          const nombre = `${j.nombres} ${j.ape_paterno}${j.ape_materno ? ` ${j.ape_materno}` : ''}`
          return (
            <article key={j.id_deportista} className="player-card">
              <div className="player-top">
                <div className="player-photo">
                  {j.url_foto
                    ? <img src={j.url_foto} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <User size={60} />
                  }
                </div>
                <div className="player-header-info">
                  <h3>{nombre}</h3>
                  <span className="player-sport">{j.nombre_disciplina}</span>
                  {j.nombre_categoria && <span className="player-position">{j.nombre_categoria}</span>}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Club() {
  return (
    <>
      <PageHeader
        title="Conoce a tu Club"
        subtitle="Nuestro roster oficial, cuerpo técnico, horarios y los mejores momentos de nuestros atletas."
      />
      <div className="container club-container">
        <Tabs
          align="center"
          defaultTab="jugadores"
          tabs={[
            { id: 'jugadores',    label: 'Jugadores',      content: <PlayersTab /> },
            { id: 'entrenadores', label: 'Cuerpo Técnico', content: <EntrenadoresTab /> },
            { id: 'horarios',     label: 'Horarios',       content: <HorariosTab /> },
            { id: 'galeria',      label: 'Galería',        content: <GaleriaTab /> },
          ]}
        />
      </div>
    </>
  )
}

export default Club
