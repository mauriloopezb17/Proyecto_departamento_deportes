import { Circle, Activity } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import './Torneos.css'

type CalEvent = { type: 'futsal' | 'basket' | 'voley'; label: string; title: string }
type CalCell = { date?: number; events?: CalEvent[]; today?: boolean; empty?: boolean }

const calendar: CalCell[] = [
  { empty: true },
  { empty: true },
  { date: 1 },
  { date: 2 },
  { date: 3 },
  {
    date: 4,
    events: [{ type: 'basket', label: 'ARQ vs DER', title: 'Básquetbol: ARQ vs DER (15:00)' }],
  },
  { date: 5 },
  { date: 6 },
  { date: 7 },
  { date: 8 },
  { date: 9 },
  { date: 10 },
  {
    date: 11,
    events: [
      { type: 'futsal', label: 'MED vs MEC', title: 'Fútsal: MED vs MEC (18:00)' },
      { type: 'voley', label: 'SIS vs CIV', title: 'Voleibol: SIS vs CIV (20:00)' },
    ],
  },
  { date: 12 },
  { date: 13 },
  { date: 14 },
  { date: 15 },
  { date: 16 },
  { date: 17 },
  {
    date: 18,
    events: [
      { type: 'futsal', label: 'SIS vs DER', title: 'Fútsal: SIS vs DER (18:30)' },
      { type: 'futsal', label: 'MED vs MEC', title: 'Fútsal: MED vs MEC (20:00)' },
    ],
  },
  { date: 19 },
  { date: 20 },
  { date: 21 },
  { date: 22 },
  { date: 23 },
  { date: 24, today: true },
  {
    date: 25,
    events: [
      { type: 'basket', label: 'ARQ vs MED', title: 'Básquetbol: ARQ vs MED (18:30)' },
      { type: 'futsal', label: 'CIV vs SIS', title: 'Fútsal: CIV vs SIS (20:00)' },
    ],
  },
  { date: 26 },
  { date: 27 },
  { date: 28 },
  { date: 29 },
  { date: 30 },
  { empty: true },
  { empty: true },
  { empty: true },
]

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
        {calendar.map((c, i) => {
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
        })}
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

const standings: StandingRow[] = [
  { pos: 1, team: 'Ing. de Sistemas', short: 'SIS', pj: 5, pg: 4, pe: 1, pp: 0, gf: 15, gc: 4, dg: '+11', pts: 13, leader: true },
  { pos: 2, team: 'Medicina', short: 'MED', pj: 5, pg: 4, pe: 0, pp: 1, gf: 12, gc: 5, dg: '+7', pts: 12, leader: true },
  { pos: 3, team: 'Arquitectura', short: 'ARQ', pj: 5, pg: 2, pe: 2, pp: 1, gf: 8, gc: 7, dg: '+1', pts: 8 },
]

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
          {standings.map((r) => (
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MatchesTab() {
  return (
    <>
      <div className="jornada-group">
        <h3 className="jornada-title">Jornada 5 (Resultados)</h3>
        <div className="match-row played">
          <div className="match-date">
            Sáb, 18 Abr<br />
            <strong>Finalizado</strong>
          </div>
          <div className="match-teams">
            <span className="team-home">Ing. de Sistemas</span>
            <div className="score-badge">3 - 1</div>
            <span className="team-away">Derecho</span>
          </div>
          <div className="match-location">
            <span>Coliseo Principal</span>
          </div>
        </div>
      </div>
      <div className="jornada-group">
        <h3 className="jornada-title">Jornada 6 (Próximos)</h3>
        <div className="match-row upcoming">
          <div className="match-date">
            Sáb, 25 Abr<br />
            <strong>Por jugar</strong>
          </div>
          <div className="match-teams">
            <span className="team-home">Arquitectura</span>
            <div className="time-badge">18:30</div>
            <span className="team-away">Medicina</span>
          </div>
          <div className="match-location">
            <span>Coliseo Principal</span>
          </div>
        </div>
      </div>
    </>
  )
}

function StatsTab() {
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
              <tr>
                <td className="num">1</td>
                <td>Alejandro M.</td>
                <td>Sistemas</td>
                <td className="num pts">8</td>
              </tr>
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
              <tr>
                <td>Derecho</td>
                <td className="num">12</td>
                <td className="num">2</td>
              </tr>
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
