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

const players: Player[] = [
  {
    name: 'Alejandro Mendoza',
    sport: 'Fútsal Masculino',
    position: 'Pivot / Goleador',
    vitals: [
      { label: 'Edad', value: '22 años' },
      { label: 'Altura', value: '1.82 m' },
      { label: 'Peso', value: '78 kg' },
      { label: 'Nac.', value: 'BOL', flag: true },
    ],
    statsHeader: 'Estadísticas de Temporada',
    stats: [
      { label: 'PJ', value: '15' }, { label: 'Goles', value: '22' },
      { label: 'Asist', value: '6' }, { label: '🟨', value: '2' },
      { label: '🟥', value: '0' },
    ],
  },
  {
    name: 'Camila Vargas',
    sport: 'Básquetbol Femenino',
    position: 'Base / MVP',
    vitals: [
      { label: 'Edad', value: '20 años' },
      { label: 'Altura', value: '1.75 m' },
      { label: 'Peso', value: '65 kg' },
      { label: 'Nac.', value: 'BOL', flag: true },
    ],
    statsHeader: 'Estadísticas de Temporada',
    stats: [
      { label: 'PJ', value: '12' }, { label: 'PPP', value: '18.5' },
      { label: 'RPP', value: '7.2' }, { label: 'APP', value: '5.1' },
      { label: 'FP', value: '1.8' },
    ],
  },
  {
    name: 'Diego Rojas',
    sport: 'Ajedrez',
    position: 'Gran Maestro Nacional',
    vitals: [
      { label: 'Edad', value: '24 años' },
      { label: 'Nac.', value: 'BOL', flag: true },
      { label: 'Categoría', value: 'Internacional' },
    ],
    statsHeader: 'Rendimiento Histórico',
    statsCols: 3,
    stats: [
      { label: 'Puntaje ELO', value: '2350', bg: '#334155' },
      { label: 'Ranking Nacional', value: '#3', bg: '#334155' },
      { label: 'Títulos Nac.', value: '4', bg: '#334155' },
    ],
  },
]

const photos: Photo[] = [
  { id: 1, title: 'Final Intercarreras Fútsal', discipline: 'Fútsal', color: 'linear-gradient(135deg,#013F62,#1e6fa0)', date: '12 May 2025', photographer: 'Dpto. Comunicación' },
  { id: 2, title: 'Selección Femenina de Básquetbol', discipline: 'Básquetbol', color: 'linear-gradient(135deg,#7c3aed,#a78bfa)', date: '8 May 2025', photographer: 'Dpto. Comunicación' },
  { id: 3, title: 'Torneo de Voleibol UCB', discipline: 'Voleibol', color: 'linear-gradient(135deg,#059669,#34d399)', date: '3 May 2025', photographer: 'Dpto. Comunicación' },
  { id: 4, title: 'Premiación Natación', discipline: 'Natación', color: 'linear-gradient(135deg,#0891b2,#67e8f9)', date: '28 Abr 2025', photographer: 'Dpto. Deportes' },
  { id: 5, title: 'Campeonato Nacional de Ajedrez', discipline: 'Ajedrez', color: 'linear-gradient(135deg,#334155,#64748b)', date: '20 Abr 2025', photographer: 'Club Ajedrez UCB' },
  { id: 6, title: 'Entrenamiento Fútsal Masculino', discipline: 'Fútsal', color: 'linear-gradient(135deg,#013F62,#1e6fa0)', date: '15 Abr 2025', photographer: 'Dpto. Comunicación' },
  { id: 7, title: 'Debut Equipo Femenino Voleibol', discipline: 'Voleibol', color: 'linear-gradient(135deg,#059669,#34d399)', date: '10 Abr 2025', photographer: 'Estudiante Comunicación' },
  { id: 8, title: 'Gran Premio de Natación Estilo Libre', discipline: 'Natación', color: 'linear-gradient(135deg,#0891b2,#67e8f9)', date: '5 Abr 2025', photographer: 'Dpto. Deportes' },
  { id: 9, title: 'Torneo Relámpago Básquetbol', discipline: 'Básquetbol', color: 'linear-gradient(135deg,#7c3aed,#a78bfa)', date: '1 Abr 2025', photographer: 'Dpto. Comunicación' },
]

const videos: VideoItem[] = [
  { id: 1, title: 'Resumen Final Fútsal 2025', discipline: 'Fútsal', duration: '4:32', date: '14 May 2025', color: 'linear-gradient(135deg,#013F62,#1e6fa0)', videoUrl: '#' },
  { id: 2, title: 'Mejores jugadas — Básquetbol Femenino', discipline: 'Básquetbol', duration: '3:15', date: '9 May 2025', color: 'linear-gradient(135deg,#7c3aed,#a78bfa)', videoUrl: '#' },
  { id: 3, title: 'Highlights Torneo Voleibol', discipline: 'Voleibol', duration: '5:48', date: '4 May 2025', color: 'linear-gradient(135deg,#059669,#34d399)', videoUrl: '#' },
  { id: 4, title: 'Rueda de prensa — Campeones Nacionales', discipline: 'Ajedrez', duration: '8:01', date: '22 Abr 2025', color: 'linear-gradient(135deg,#334155,#64748b)', videoUrl: '#' },
]

const schedules: Schedule[] = [
  { discipline: 'Fútsal', category: 'Masculino', level: 'Competitivo', days: ['Lun', 'Mié', 'Vie'], time: '18:00 – 20:00', location: 'Coliseo Principal', coach: 'Carlos Méndez', color: '#013F62' },
  { discipline: 'Fútsal', category: 'Femenino', level: 'Competitivo', days: ['Mar', 'Jue'], time: '17:00 – 19:00', location: 'Coliseo Principal', coach: 'Laura Chávez', color: '#013F62' },
  { discipline: 'Básquetbol', category: 'Masculino', level: 'Competitivo', days: ['Lun', 'Mié'], time: '19:00 – 21:00', location: 'Cancha Arquitectura', coach: 'Roberto Soria', color: '#7c3aed' },
  { discipline: 'Básquetbol', category: 'Femenino', level: 'Competitivo', days: ['Mar', 'Jue'], time: '19:00 – 21:00', location: 'Cancha Arquitectura', coach: 'Laura Chávez', color: '#7c3aed' },
  { discipline: 'Voleibol', category: 'Mixto', level: 'Formativo', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], time: '07:00 – 09:00', location: 'Coliseo Secundario', coach: 'Roberto Soria', color: '#059669' },
  { discipline: 'Natación', category: 'Mixto', level: 'Competitivo', days: ['Mar', 'Jue', 'Sáb'], time: '06:00 – 08:00', location: 'Piscina Olímpica UCB', coach: 'Diego Flores', color: '#0891b2' },
  { discipline: 'Ajedrez', category: 'Mixto', level: 'Todos los niveles', days: ['Mié', 'Vie'], time: '17:00 – 19:00', location: 'Sala de Juegos — Bloque C', coach: 'María Quispe', color: '#334155' },
  { discipline: 'Atletismo', category: 'Mixto', level: 'Formativo', days: ['Lun', 'Mié', 'Vie'], time: '06:30 – 08:00', location: 'Pista Atlética UCB', coach: 'Carlos Méndez', color: '#b45309' },
]

const coaches: Coach[] = [
  {
    name: 'Carlos Méndez', role: 'Entrenador Principal',
    disciplines: ['Fútsal', 'Atletismo'], experience: '10 años',
    certifications: ['CONMEBOL Licencia B', 'Entrenador Deportivo INEF', 'Primeros Auxilios'],
    bio: 'Ex jugador profesional con trayectoria en ligas nacionales. Especialista en formación de jóvenes talentos y preparación física integral.',
    color: 'linear-gradient(135deg,#013F62,#1e6fa0)',
  },
  {
    name: 'Laura Chávez', role: 'Entrenadora',
    disciplines: ['Básquetbol', 'Fútsal Femenino'], experience: '7 años',
    certifications: ['FIBA Coaching Level 2', 'Licenciada en Ciencias del Deporte'],
    bio: 'Especialista en desarrollo del baloncesto femenino. Ha llevado al equipo a tres campeonatos regionales consecutivos.',
    color: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
  },
  {
    name: 'Roberto Soria', role: 'Entrenador',
    disciplines: ['Voleibol', 'Básquetbol Masculino'], experience: '5 años',
    certifications: ['FIVB Coaching Certificate', 'Preparación Física Avanzada'],
    bio: 'Enfocado en el voleibol formativo y la táctica de equipo. Impulsa la participación de nuevas carreras en el deporte universitario.',
    color: 'linear-gradient(135deg,#059669,#34d399)',
  },
  {
    name: 'Diego Flores', role: 'Entrenador',
    disciplines: ['Natación'], experience: '8 años',
    certifications: ['FINA Level 1 Coach', 'Lifeguard Internacional', 'Nutrición Deportiva'],
    bio: 'Ex nadador olímpico juvenil. Experto en técnica de nado y planificación de ciclos de entrenamiento de alto rendimiento.',
    color: 'linear-gradient(135deg,#0891b2,#67e8f9)',
  },
  {
    name: 'María Quispe', role: 'Entrenadora',
    disciplines: ['Ajedrez'], experience: '12 años',
    certifications: ['FIDE Trainer', 'Maestra Nacional FIDE', 'Pedagogía Deportiva'],
    bio: 'Maestra nacional y ex campeona sudamericana. Ha formado a varios jugadores clasificados en torneos internacionales.',
    color: 'linear-gradient(135deg,#334155,#64748b)',
  },
]

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
          {filteredPhotos.map((photo) => (
            <button
              key={photo.id}
              className="galeria-card"
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
          ))}
        </div>
      )}

      {/* video grid */}
      {filter === 'videos' && (
        <div className="galeria-grid">
          {videos.map((v) => (
            <a key={v.id} href={v.videoUrl} className="galeria-card" target="_blank" rel="noreferrer">
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
          ))}
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
        {filtered.map((s, i) => (
          <div key={i} className="horario-card">
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
        ))}
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
      {coaches.map((c, i) => (
        <article key={i} className="coach-card">
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
      ))}
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
        {players.map((p, i) => (
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
        ))}
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
