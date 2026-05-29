import { Circle, Activity } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import './Torneos.css'

type CalEvent = { type: 'futsal' | 'basket' | 'voley'; label: string; title: string }
type CalCell = { date?: number; events?: CalEvent[]; today?: boolean; empty?: boolean }

const calendar: CalCell[] = []

const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function CalendarTab() {
  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="cal-btn">&lt; Mar</button>
        <h2 className="cal-month">Abril 2026</h2>
        <button className="cal-btn">May &gt;</button>
      </div>
      <div className="calendar-grid">
        {dayHeaders.map((d) => (
          <div key={d} className="cal-day-header">
            {d}
          </div>
        ))}
        {calendar.length > 0 ? (
          calendar.map((c, i) => {
            if (c.empty) return <div key={i} className="cal-cell empty" />
            return (
              <div key={i} className={`cal-cell${c.today ? ' today' : ''}`}>
                <span className="cal-date">{c.date}</span>
                {c.events?.map((ev, j) => (
                  <div
                    key={j}
                    className={`cal-event ${ev.type}`}
                    title={ev.title}
                  >
                    {ev.type === 'voley' ? (
                      <Activity size={12} />
                    ) : (
                      <Circle size={12} />
                    )}{' '}
                    {ev.label}
                  </div>
                ))}
              </div>
            )
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#64748b' }}>Vacío</div>
        )}
      </div>
    </div>
  )
}

type StandingRow = {
  pos: number
  team: string
  short: string
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: string
  pts: number
  leader?: boolean
}

const standings: StandingRow[] = []

function StandingsTab() {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th style={{ width: 50 }} className="num">Pos</th>
            <th>Equipo</th>
            <th className="num">PJ</th>
            <th className="num">PG</th>
            <th className="num">PE</th>
            <th className="num">PP</th>
            <th className="num">GF</th>
            <th className="num">GC</th>
            <th className="num">DG</th>
            <th className="num">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.length > 0 ? (
            standings.map((r) => (
              <tr key={r.pos} className={r.leader ? 'leader' : ''}>
                <td className="num">{r.pos}</td>
                <td>
                  <div className="team-cell">
                    <div className="team-logo">{r.short}</div>
                    {r.team}
                  </div>
                </td>
                <td className="num">{r.pj}</td>
                <td className="num">{r.pg}</td>
                <td className="num">{r.pe}</td>
                <td className="num">{r.pp}</td>
                <td className="num">{r.gf}</td>
                <td className="num">{r.gc}</td>
                <td className="num">{r.dg}</td>
                <td className="num pts">{r.pts}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Vacío</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function MatchesTab() {
  const matches: any[] = [] // Empty for now

  return (
    <>
      {matches.length > 0 ? (
        <div className="jornada-group">
          <h3 className="jornada-title">Resultados</h3>
          {/* Matches loop here */}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Vacío</div>
      )}
    </>
  )
}

function StatsTab() {
  const stats: any[] = [] // Empty for now
  
  return (
    <div className="stats-section-grid">
      <div>
        <div className="stats-card-header">Tabla de Goleadores</div>
        <div className="table-container rounded-bottom">
          <table>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th className="num">Goles</th>
              </tr>
            </thead>
            <tbody>
              {stats.length > 0 ? (
                <tr>{/* stats loop */}</tr>
              ) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Vacío</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="stats-card-header alt">Disciplina (Tarjetas)</div>
        <div className="table-container rounded-bottom">
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th className="num" style={{ color: '#eab308' }}>🟨</th>
                <th className="num" style={{ color: '#ef4444' }}>🟥</th>
              </tr>
            </thead>
            <tbody>
              {stats.length > 0 ? (
                <tr>{/* discipline loop */}</tr>
              ) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Vacío</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Torneos() {
  return (
    <>
      <PageHeader
        title="Centro de Competiciones"
        subtitle="Sigue de cerca el rendimiento de los equipos y no te pierdas ningún partido."
        thinBorder
      />
      <div className="container torneos-container">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="torneo">
              <strong>Torneo:</strong>
            </label>
            <select id="torneo">
              <option>Intercarreras 2026</option>
              <option>Liga Universitaria</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="t-disciplina">
              <strong>Disciplina:</strong>
            </label>
            <select id="t-disciplina">
              <option>Todos</option>
              <option>Fútsal</option>
              <option>Básquetbol</option>
            </select>
          </div>
        </div>

        <Tabs
          defaultTab="calendario"
          tabs={[
            { id: 'posiciones', label: 'Tabla de Posiciones', content: <StandingsTab /> },
            { id: 'partidos', label: 'Partidos & Resultados', content: <MatchesTab /> },
            { id: 'estadisticas', label: 'Estadísticas', content: <StatsTab /> },
            { id: 'calendario', label: 'Calendario', content: <CalendarTab /> },
          ]}
        />
      </div>
    </>
  )
}

export default Torneos
