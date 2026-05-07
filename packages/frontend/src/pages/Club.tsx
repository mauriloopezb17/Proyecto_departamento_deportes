import { Search, User, Flag } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import './Club.css'

type Vital = { label: string; value: string; flag?: boolean }
type Stat = { label: string; value: string; bg?: string }
type Player = {
  name: string
  sport: string
  position: string
  vitals: Vital[]
  statsHeader: string
  stats: Stat[]
  statsCols?: number
}

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
      { label: 'PJ', value: '15' },
      { label: 'Goles', value: '22' },
      { label: 'Asist', value: '6' },
      { label: '🟨', value: '2' },
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
      { label: 'PJ', value: '12' },
      { label: 'PPP', value: '18.5' },
      { label: 'RPP', value: '7.2' },
      { label: 'APP', value: '5.1' },
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

function PlayersTab() {
  return (
    <>
      <div className="roster-filters">
        <div className="search-area">
          <Search size={18} />
          <input type="text" placeholder="Buscar jugador por nombre..." />
        </div>
        <div className="filter-group">
          <label htmlFor="disciplina">
            <strong>Disciplina:</strong>
          </label>
          <select id="disciplina">
            <option>Todas</option>
            <option>Fútsal</option>
            <option>Básquetbol</option>
            <option>Ajedrez</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="genero">
            <strong>Género:</strong>
          </label>
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
                  style={
                    p.statsCols
                      ? { gridTemplateColumns: `repeat(${p.statsCols}, 1fr)` }
                      : undefined
                  }
                >
                  {p.stats.map((s, j) => (
                    <div
                      key={j}
                      className="stat-item"
                      style={s.bg ? { backgroundColor: s.bg } : undefined}
                    >
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

function Placeholder({ text }: { text: string }) {
  return <div className="club-placeholder">{text}</div>
}

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
            {
              id: 'horarios',
              label: 'Horarios',
              content: <Placeholder text="Próximamente: horarios de entrenamiento." />,
            },
            {
              id: 'entrenadores',
              label: 'Cuerpo Técnico',
              content: <Placeholder text="Próximamente: cuerpo técnico." />,
            },
            {
              id: 'galeria',
              label: 'Galería',
              content: <Placeholder text="Próximamente: galería de imágenes." />,
            },
            { id: 'jugadores', label: 'Jugadores', content: <PlayersTab /> },
          ]}
        />
      </div>
    </>
  )
}

export default Club
