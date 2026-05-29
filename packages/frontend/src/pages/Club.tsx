import { useState } from 'react'
import {
  Search, User, Flag, Play, X, Camera, Video,
  Clock, MapPin, Award, BookOpen, ChevronRight,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import './Club.css'

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type Vital = { label: string; value: string; flag?: boolean }
type Stat = { label: string; value: string; bg?: string }
type Player = {
  name: string; sport: string; position: string
  vitals: Vital[]; statsHeader: string; stats: Stat[]; statsCols?: number
}
type Photo = {
  id: number; title: string; discipline: string
  color: string; date: string; photographer: string
}
type VideoItem = {
  id: number; title: string; discipline: string
  duration: string; date: string; color: string
  videoUrl: string
}
type Schedule = {
  discipline: string; category: string; level: string
  days: string[]; time: string; location: string; coach: string; color: string
}
type Coach = {
  name: string; role: string; disciplines: string[]
  experience: string; certifications: string[]; bio: string; color: string
}

// ─────────────────────────────────────────
// DATOS HARDCODEADOS — reemplazar con API
// ─────────────────────────────────────────

const players: Player[] = []

const photos: Photo[] = []

const videos: VideoItem[] = []

const schedules: Schedule[] = []

const coaches: Coach[] = []

const ALL_DISCIPLINES = ['Todas', ...Array.from(new Set(schedules.map((s) => s.discipline)))]

// ─────────────────────────────────────────
// TAB: GALERÍA (HU-WEB-08)
// ─────────────────────────────────────────

function GaleriaTab() {
  const [filter, setFilter] = useState<'fotos' | 'videos'>('fotos')
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [disciplineFilter, setDisciplineFilter] = useState('Todas')

  const photoDisciplines = ['Todas', ...Array.from(new Set(photos.map((p) => p.discipline)))]
  const filteredPhotos = disciplineFilter === 'Todas'
    ? photos
    : photos.filter((p) => p.discipline === disciplineFilter)

  return (
    <>
      {/* type toggle */}
      <div className="galeria-header">
        <div className="galeria-type-toggle">
          <button
            className={`galeria-toggle-btn ${filter === 'fotos' ? 'active' : ''}`}
            onClick={() => setFilter('fotos')}
          >
            <Camera size={16} /> Fotos ({photos.length})
          </button>
          <button
            className={`galeria-toggle-btn ${filter === 'videos' ? 'active' : ''}`}
            onClick={() => setFilter('videos')}
          >
            <Video size={16} /> Videos ({videos.length})
          </button>
        </div>

        {filter === 'fotos' && (
          <div className="galeria-discipline-filter">
            {photoDisciplines.map((d) => (
              <button
                key={d}
                className={`galeria-disc-btn ${disciplineFilter === d ? 'active' : ''}`}
                onClick={() => setDisciplineFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* photo grid */}
      {filter === 'fotos' && (
        <div className="galeria-grid">
          {filteredPhotos.length > 0 ? (
            filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                className="galeria-card reveal"
                onClick={() => setLightbox(photo)}
                aria-label={`Ver foto: ${photo.title}`}
              >
                <div className="galeria-thumb" style={{ background: photo.color }}>
                  <Camera size={40} className="galeria-thumb-icon" />
                  <div className="galeria-thumb-overlay">
                    <Search size={24} />
                  </div>
                </div>
                <div className="galeria-card-info">
                  <span className="galeria-disc-tag">{photo.discipline}</span>
                  <p className="galeria-card-title">{photo.title}</p>
                  <span className="galeria-card-date">{photo.date}</span>
                </div>
              </button>
            ))
          ) : (
            <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
          )}
        </div>
      )}

      {/* video grid */}
      {filter === 'videos' && (
        <div className="galeria-grid">
          {videos.length > 0 ? (
            videos.map((v) => (
              <a key={v.id} href={v.videoUrl} className="galeria-card reveal" target="_blank" rel="noreferrer">
                <div className="galeria-thumb" style={{ background: v.color }}>
                  <div className="galeria-play-btn">
                    <Play size={28} fill="white" />
                  </div>
                  <span className="galeria-duration">{v.duration}</span>
                </div>
                <div className="galeria-card-info">
                  <span className="galeria-disc-tag">{v.discipline}</span>
                  <p className="galeria-card-title">{v.title}</p>
                  <span className="galeria-card-date">{v.date}</span>
                </div>
              </a>
            ))
          ) : (
            <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
          )}
        </div>
      )}

      {/* lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>
              <X size={22} />
            </button>
            <div className="lightbox-img" style={{ background: lightbox.color }}>
              <Camera size={80} className="lightbox-icon" />
            </div>
            <div className="lightbox-info">
              <span className="galeria-disc-tag">{lightbox.discipline}</span>
              <h3>{lightbox.title}</h3>
              <p>{lightbox.date} · {lightbox.photographer}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────
// TAB: HORARIOS (HU-WEB-09)
// ─────────────────────────────────────────

const DAY_FULL: Record<string, string> = {
  Lun: 'Lunes', Mar: 'Martes', Mié: 'Miércoles',
  Jue: 'Jueves', Vie: 'Viernes', Sáb: 'Sábado', Dom: 'Domingo',
}

function HorariosTab() {
  const [selected, setSelected] = useState('Todas')

  const filtered = selected === 'Todas'
    ? schedules
    : schedules.filter((s) => s.discipline === selected)

  return (
    <>
      <div className="horarios-filter">
        {ALL_DISCIPLINES.map((d) => (
          <button
            key={d}
            className={`hor-filter-btn ${selected === d ? 'active' : ''}`}
            onClick={() => setSelected(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="horarios-grid">
        {filtered.length > 0 ? (
          filtered.map((s, i) => (
            <div key={i} className="horario-card reveal">
              <div className="horario-card-header" style={{ background: s.color }}>
                <div>
                  <h3 className="horario-discipline">{s.discipline}</h3>
                  <span className="horario-category">{s.category} · {s.level}</span>
                </div>
                <div className="horario-days">
                  {s.days.map((d) => (
                    <span key={d} className="horario-day-chip" title={DAY_FULL[d]}>{d}</span>
                  ))}
                </div>
              </div>
              <div className="horario-card-body">
                <div className="horario-detail">
                  <Clock size={15} />
                  <span>{s.time}</span>
                </div>
                <div className="horario-detail">
                  <MapPin size={15} />
                  <span>{s.location}</span>
                </div>
                <div className="horario-detail">
                  <User size={15} />
                  <span>Entrenador: <strong>{s.coach}</strong></span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
        )}
      </div>

      <p className="horarios-note">
        * Los horarios pueden modificarse en temporada de exámenes. Confirmá con tu entrenador.
      </p>
    </>
  )
}

// ─────────────────────────────────────────
// TAB: ENTRENADORES (HU-WEB-10)
// ─────────────────────────────────────────

function EntrenadoresTab() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="coaches-grid">
      {coaches.length > 0 ? (
        coaches.map((c, i) => (
          <article key={i} className="coach-card reveal">
            <div className="coach-top" style={{ background: c.color }}>
              <div className="coach-photo">
                <User size={56} />
              </div>
              <div className="coach-header-info">
                <h3>{c.name}</h3>
                <span className="coach-role">{c.role}</span>
                <div className="coach-disciplines">
                  {c.disciplines.map((d) => (
                    <span key={d} className="coach-disc-tag">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="coach-body">
              <div className="coach-exp">
                <Award size={15} />
                <span>{c.experience} de experiencia</span>
              </div>

              <p className="coach-bio">{c.bio}</p>

              <button
                className="coach-certs-toggle"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <BookOpen size={14} />
                Certificaciones ({c.certifications.length})
                <ChevronRight
                  size={14}
                  style={{ transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>

              {expanded === i && (
                <ul className="coach-certs-list">
                  {c.certifications.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))
      ) : (
        <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// TAB: JUGADORES (existente)
// ─────────────────────────────────────────

function PlayersTab() {
  return (
    <>
      <div className="roster-filters">
        <div className="search-area">
          <Search size={18} />
          <input type="text" placeholder="Buscar jugador por nombre..." />
        </div>
        <div className="filter-group">
          <label htmlFor="disciplina"><strong>Disciplina:</strong></label>
          <select id="disciplina">
            <option>Todas</option>
            <option>Fútsal</option>
            <option>Básquetbol</option>
            <option>Ajedrez</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="genero"><strong>Género:</strong></label>
          <select id="genero">
            <option>Todos</option>
            <option>Masculino</option>
            <option>Femenino</option>
          </select>
        </div>
      </div>

      <div className="players-grid">
        {players.length > 0 ? (
          players.map((p, i) => (
            <article key={i} className="player-card">
              <div className="player-top">
                <div className="player-photo">
                  <User size={60} />
                </div>
                <div className="player-header-info">
                  <h3>{p.name}</h3>
                  <span className="player-sport">{p.sport}</span>
                  <span className="player-position">{p.position}</span>
                </div>
              </div>
              <div className="player-content">
                <div className="player-vitals">
                  {p.vitals.map((v, j) => (
                    <div
                      className="vital-item"
                      key={j}
                      style={v.label === 'Categoría' ? { flex: 2 } : undefined}
                    >
                      <span className="vital-label">{v.label}</span>
                      <span className="vital-value">
                        {v.flag && <Flag size={14} />} {v.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="player-stats">
                  <div className="stats-header">{p.statsHeader}</div>
                  <div
                    className="stats-grid"
                    style={p.statsCols ? { gridTemplateColumns: `repeat(${p.statsCols}, 1fr)` } : undefined}
                  >
                    {p.stats.map((s, j) => (
                      <div key={j} className="stat-item" style={s.bg ? { backgroundColor: s.bg } : undefined}>
                        <span className="stat-label">{s.label}</span>
                        <span className="stat-value">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────
// PÁGINA CLUB
// ─────────────────────────────────────────

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
            { id: 'jugadores', label: 'Jugadores', content: <PlayersTab /> },
            { id: 'entrenadores', label: 'Cuerpo Técnico', content: <EntrenadoresTab /> },
            { id: 'horarios', label: 'Horarios', content: <HorariosTab /> },
            { id: 'galeria', label: 'Galería', content: <GaleriaTab /> },
          ]}
        />
      </div>
    </>
  )
}

export default Club
