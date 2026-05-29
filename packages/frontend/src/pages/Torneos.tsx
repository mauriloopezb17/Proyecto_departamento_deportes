import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import { apiFetch } from '../utils/api'
import './Torneos.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Torneo {
  id_torneo: number
  nombre: string
  id_disciplina: number
}

interface PosicionRow {
  id_equipo: number
  nombre_equipo: string
  pj: number; pg: number; pe: number; pp: number
  gf: number; gc: number; dg: number; pts: number
}

interface Partido {
  id_partido: number
  fecha: string
  hora_inicio: string
  goles_local: number | null
  goles_visitante: number | null
  estado: string
  fase_torneo: string | null
  equipo_local: string
  equipo_visitante: string
  espacio: string | null
  torneo_nombre: string
  nombre_disciplina: string | null
}

interface Goleador {
  id_deportista: number
  jugador: string
  equipo: string
  goles: number
}

interface TarjetaRow {
  id_equipo: number
  equipo: string
  amarillas: number
  rojas: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtHora(t: string | null) {
  return t?.slice(0, 5) ?? '—'
}

function short(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 3).toUpperCase()
  return words.map(w => w[0]).join('').slice(0, 3).toUpperCase()
}

function LoadingRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando...</td></tr>
}

function EmptyRow({ cols, msg = 'Sin datos' }: { cols: number; msg?: string }) {
  return <tr><td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>{msg}</td></tr>
}

// ── Tab: Posiciones ───────────────────────────────────────────────────────────

function StandingsTab({ idTorneo }: { idTorneo: number }) {
  const [rows, setRows]       = useState<PosicionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch<PosicionRow[]>(`/api/partidos/posiciones/${idTorneo}`)
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [idTorneo])

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
          {loading ? <LoadingRow cols={10} /> :
           rows.length === 0 ? <EmptyRow cols={10} msg="No hay datos de posiciones aún." /> :
           rows.map((r, idx) => (
            <tr key={r.id_equipo} className={idx === 0 ? 'leader' : ''}>
              <td className="num">{idx + 1}</td>
              <td>
                <div className="team-cell">
                  <div className="team-logo">{short(r.nombre_equipo)}</div>
                  {r.nombre_equipo}
                </div>
              </td>
              <td className="num">{r.pj}</td>
              <td className="num">{r.pg}</td>
              <td className="num">{r.pe}</td>
              <td className="num">{r.pp}</td>
              <td className="num">{r.gf}</td>
              <td className="num">{r.gc}</td>
              <td className="num">{r.dg > 0 ? `+${r.dg}` : r.dg}</td>
              <td className="num pts">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tab: Partidos & Resultados ────────────────────────────────────────────────

function MatchesTab({ idTorneo }: { idTorneo: number }) {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'todos' | 'Finalizado' | 'Programado'>('todos')

  useEffect(() => {
    setLoading(true)
    apiFetch<Partido[]>(`/api/partidos/torneo/${idTorneo}`)
      .then(setPartidos).catch(() => setPartidos([])).finally(() => setLoading(false))
  }, [idTorneo])

  const visible = filter === 'todos' ? partidos : partidos.filter(p => p.estado === filter)

  const grouped = visible.reduce<Record<string, Partido[]>>((acc, p) => {
    const key = p.fase_torneo ?? 'Partidos'
    ;(acc[key] = acc[key] ?? []).push(p)
    return acc
  }, {})

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['todos', 'Finalizado', 'Programado'] as const).map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            borderColor: filter === f ? 'var(--ucb-blue)' : 'var(--border-color)',
            background: filter === f ? 'var(--ucb-blue)' : 'white',
            color: filter === f ? 'white' : 'var(--text-light)',
          }}>
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando...</p>
      ) : visible.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay partidos disponibles.</p>
      ) : (
        Object.entries(grouped).map(([fase, ps]) => (
          <div key={fase} className="jornada-group">
            <h3 className="jornada-title">{fase}</h3>
            {ps.map(p => (
              <div key={p.id_partido} className={`match-row ${p.estado === 'Finalizado' ? 'played' : 'upcoming'}`}>
                <div className="match-date">
                  <span>{fmtFecha(p.fecha)}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.espacio ?? ''}</span>
                </div>
                <div className="match-teams">
                  <div className="team-home">{p.equipo_local}</div>
                  {p.estado === 'Finalizado'
                    ? <div className="score-badge">{p.goles_local} – {p.goles_visitante}</div>
                    : <div className="time-badge">{fmtHora(p.hora_inicio)}</div>
                  }
                  <div className="team-away">{p.equipo_visitante}</div>
                </div>
                <div className="match-location">
                  <span>{p.nombre_disciplina ?? ''}</span>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  )
}

// ── Tab: Estadísticas ─────────────────────────────────────────────────────────

function StatsTab({ idTorneo }: { idTorneo: number }) {
  const [goleadores, setGoleadores] = useState<Goleador[]>([])
  const [tarjetas, setTarjetas]     = useState<TarjetaRow[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch<Goleador[]>(`/api/partidos/goleadores/${idTorneo}`).catch(() => []),
      apiFetch<TarjetaRow[]>(`/api/partidos/tarjetas/${idTorneo}`).catch(() => []),
    ]).then(([g, t]) => { setGoleadores(g); setTarjetas(t) })
      .finally(() => setLoading(false))
  }, [idTorneo])

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
              {loading ? <LoadingRow cols={4} /> :
               goleadores.length === 0 ? <EmptyRow cols={4} msg="Sin goleadores registrados." /> :
               goleadores.map((g, i) => (
                <tr key={g.id_deportista}>
                  <td className="num">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{g.jugador}</td>
                  <td>{g.equipo}</td>
                  <td className="num pts">{g.goles}</td>
                </tr>
              ))}
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
                <th className="num">🟨 Amarillas</th>
                <th className="num">🟥 Rojas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow cols={3} /> :
               tarjetas.length === 0 ? <EmptyRow cols={3} msg="Sin tarjetas registradas." /> :
               tarjetas.map(t => (
                <tr key={t.id_equipo}>
                  <td style={{ fontWeight: 600 }}>{t.equipo}</td>
                  <td className="num">{t.amarillas}</td>
                  <td className="num" style={{ color: t.rojas > 0 ? '#ef4444' : undefined, fontWeight: t.rojas > 0 ? 700 : undefined }}>
                    {t.rojas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Calendario ───────────────────────────────────────────────────────────

function CalendarTab({ idTorneo }: { idTorneo: number }) {
  const [proximos, setProximos] = useState<Partido[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch<Partido[]>(`/api/partidos/fixture/${idTorneo}`)
      .then(setProximos).catch(() => setProximos([])).finally(() => setLoading(false))
  }, [idTorneo])

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Cargando...</p>
  if (proximos.length === 0) return <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay partidos programados.</p>

  const byDate = proximos.reduce<Record<string, Partido[]>>((acc, p) => {
    ;(acc[p.fecha] = acc[p.fecha] ?? []).push(p)
    return acc
  }, {})

  return (
    <>
      {Object.entries(byDate).map(([fecha, ps]) => (
        <div key={fecha} className="jornada-group">
          <h3 className="jornada-title">{fmtFecha(fecha)}</h3>
          {ps.map(p => (
            <div key={p.id_partido} className="match-row upcoming">
              <div className="match-date">
                <span style={{ fontWeight: 600 }}>{fmtHora(p.hora_inicio)}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.espacio ?? ''}</span>
              </div>
              <div className="match-teams">
                <div className="team-home">{p.equipo_local}</div>
                <div className="time-badge">VS</div>
                <div className="team-away">{p.equipo_visitante}</div>
              </div>
              <div className="match-location">{p.fase_torneo ?? ''}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Disciplina {
  id_disciplina: number
  nombre_disciplina: string
}

function Torneos() {
  const [torneos, setTorneos]     = useState<Torneo[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<number | null>(null)
  const [torneosLoading, setTorneosLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<Torneo[]>('/api/partidos/torneos'),
      apiFetch<Disciplina[]>('/api/partidos/disciplinas').catch(() => [])
    ])
      .then(([tData, dData]) => {
        setTorneos(tData)
        setDisciplinas(dData)
        if (tData.length > 0) setSelectedId(tData[0].id_torneo)
      })
      .catch(() => {})
      .finally(() => setTorneosLoading(false))
  }, [])

  const filteredTorneos = selectedDisciplinaId 
    ? torneos.filter(t => t.id_disciplina === selectedDisciplinaId)
    : torneos;

  useEffect(() => {
    if (selectedDisciplinaId !== null || selectedDisciplinaId === null) {
      if (filteredTorneos.length > 0 && !filteredTorneos.find(t => t.id_torneo === selectedId)) {
        setSelectedId(filteredTorneos[0].id_torneo)
      } else if (filteredTorneos.length === 0) {
        setSelectedId(null)
      }
    }
  }, [selectedDisciplinaId, torneos])

  return (
    <>
      <PageHeader
        title="Centro de Competiciones"
        subtitle="Sigue de cerca el rendimiento de los equipos y no te pierdas ningún partido."
        thinBorder
      />
      <div className="container torneos-container">
        <div className="filters" style={{ display: 'flex', gap: '20px' }}>
          <div className="filter-group">
            <label htmlFor="disciplina"><strong>Disciplina:</strong></label>
            <select
              id="disciplina"
              value={selectedDisciplinaId ?? ''}
              onChange={e => setSelectedDisciplinaId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todas</option>
              {disciplinas.map(d => (
                <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre_disciplina}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="torneo"><strong>Torneo:</strong></label>
            {torneosLoading ? (
              <span style={{ color: '#94a3b8', fontSize: 14 }}>Cargando...</span>
            ) : filteredTorneos.length === 0 ? (
              <span style={{ color: '#94a3b8', fontSize: 14 }}>No hay torneos activos</span>
            ) : (
              <select
                id="torneo"
                value={selectedId ?? ''}
                onChange={e => setSelectedId(Number(e.target.value))}
              >
                {filteredTorneos.map(t => (
                  <option key={t.id_torneo} value={t.id_torneo}>{t.nombre}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedId == null ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Seleccioná un torneo para ver la información.
          </p>
        ) : (
          <Tabs
            defaultTab="posiciones"
            tabs={[
              { id: 'posiciones',   label: 'Tabla de Posiciones',  content: <StandingsTab idTorneo={selectedId} /> },
              { id: 'partidos',     label: 'Partidos & Resultados', content: <MatchesTab   idTorneo={selectedId} /> },
              { id: 'estadisticas', label: 'Estadísticas',          content: <StatsTab     idTorneo={selectedId} /> },
              { id: 'calendario',   label: 'Calendario',            content: <CalendarTab  idTorneo={selectedId} /> },
            ]}
          />
        )}
      </div>
    </>
  )
}

export default Torneos
