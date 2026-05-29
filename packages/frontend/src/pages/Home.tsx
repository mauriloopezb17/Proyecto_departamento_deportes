import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  User,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { apiFetch } from '../utils/api'
import './Home.css'

const players: any[] = []

interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  categoria_nombre: string
  imagen_portada: string | null
}

interface Resultado {
  id_partido: number
  fecha: string
  hora_inicio: string
  equipo_local: string
  equipo_visitante: string
  goles_local: number
  goles_visitante: number
  disciplina: string
  torneo_nombre: string
}

interface ProximoPartido {
  id_partido: number
  fecha: string
  hora_inicio: string
  equipo_local: string
  equipo_visitante: string
  torneo_nombre: string
  espacio: string | null
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
}

function fmtHora(t: string) {
  return t?.slice(0, 5) ?? ''
}

function Home() {
  const [noticias, setNoticias]         = useState<Noticia[]>([])
  const [slide, setSlide]               = useState(0)
  const [resultados, setResultados]     = useState<Resultado[]>([])
  const [proximos, setProximos]         = useState<ProximoPartido[]>([])

  useEffect(() => {
    apiFetch<Noticia[]>('/api/noticias?publicado=true')
      .then((data) => setNoticias(data.slice(0, 5)))
      .catch(() => {})
    apiFetch<Resultado[]>('/api/partidos/recientes')
      .then(setResultados)
      .catch(() => {})
    apiFetch<ProximoPartido[]>('/api/partidos/proximos')
      .then(setProximos)
      .catch(() => {})
  }, [])

  // auto-advance every 6s
  useEffect(() => {
    if (noticias.length <= 1) return
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % noticias.length)
    }, 6000)
    return () => clearInterval(id)
  }, [noticias.length])

  const goTo  = (i: number) => setSlide(((i % noticias.length) + noticias.length) % noticias.length)
  const prev  = () => goTo(slide - 1)
  const next  = () => goTo(slide + 1)

  const featuredNoticias = noticias.slice(0, 3)

  return (
    <>
      <header className="hero-carousel">
        {noticias.length > 0 ? (
          <>
            {noticias.map((n, i) => (
              <article
                key={n.id_noticia}
                className={`hero-slide${i === slide ? ' active' : ''}`}
              >
                {n.imagen_portada ? (
                  <img src={n.imagen_portada} alt={n.titulo} className="hero-slide-bg" />
                ) : (
                  <div className="hero-slide-bg hero-slide-bg-placeholder">
                    <Newspaper size={120} />
                  </div>
                )}
                <div className="hero-slide-overlay" />
                <div className="hero-slide-content">
                  <span className="hero-slide-tag">{n.categoria_nombre}</span>
                  <h1>{n.titulo}</h1>
                  {n.resumen && <p>{n.resumen}</p>}
                  <Link to={`/noticias/${n.id_noticia}`} className="btn-primary">
                    Leer noticia <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}

            {noticias.length > 1 && (
              <>
                <button className="hero-arrow prev" onClick={prev} aria-label="Anterior">
                  <ChevronLeft size={28} />
                </button>
                <button className="hero-arrow next" onClick={next} aria-label="Siguiente">
                  <ChevronRight size={28} />
                </button>
                <div className="hero-dots">
                  {noticias.map((_, i) => (
                    <button
                      key={i}
                      className={`hero-dot${i === slide ? ' active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Ir a la noticia ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="hero-empty">
            <Newspaper size={72} />
            <h1>El deporte universitario al siguiente nivel.</h1>
            <p>Únete a las disciplinas, revisa los fixtures y apoya a tu carrera en el torneo oficial de la UCB.</p>
          </div>
        )}
      </header>

      <div className="container">
        <h2 className="section-title reveal">Centro de Partidos</h2>
        <div className="match-center">
          <div className="match-panel">
            <h3>Últimos Resultados</h3>
            {resultados.length > 0 ? (
              resultados.map((m) => (
                <div key={m.id_partido} className="match-card">
                  <div className="team-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <span>{m.equipo_local}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.disciplina}</span>
                  </div>
                  <div className="score-box">{m.goles_local} – {m.goles_visitante}</div>
                  <div className="team-info away">{m.equipo_visitante}</div>
                </div>
              ))
            ) : (
              <p className="empty-state" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No hay resultados disponibles</p>
            )}
          </div>
          <div className="match-panel">
            <h3>Próximos Partidos</h3>
            {proximos.length > 0 ? (
              proximos.map((m) => (
                <div key={m.id_partido} className="match-card wrap">
                  <span className="match-meta">{fmtFecha(m.fecha)} · {m.torneo_nombre}</span>
                  <div className="team-info">{m.equipo_local}</div>
                  <div className="time-box">{fmtHora(m.hora_inicio)}</div>
                  <div className="team-info away">{m.equipo_visitante}</div>
                </div>
              ))
            ) : (
              <p className="empty-state" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No hay partidos programados</p>
            )}
          </div>
        </div>
        <div className="section-footer">
          <Link to="/torneos" className="btn-more">
            Ver fixture y más información <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title reveal">Noticias del Club</h2>
        <section className="home-news-grid">
          {featuredNoticias.length > 0 ? (
            featuredNoticias.map((n) => (
              <Link to={`/noticias/${n.id_noticia}`} key={n.id_noticia} className="home-news-card-link reveal">
                <article className="home-news-card">
                  <div className="home-news-img">
                    {n.imagen_portada ? (
                      <img src={n.imagen_portada} alt={n.titulo} className="home-news-cover" />
                    ) : (
                      <Newspaper size={64} />
                    )}
                  </div>
                  <div className="home-news-content">
                    <span className="home-news-tag">{n.categoria_nombre}</span>
                    <h3>{n.titulo}</h3>
                    <p>{n.resumen ?? ''}</p>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>No hay noticias disponibles</p>
          )}
        </section>
        <div className="section-footer">
          <Link to="/noticias" className="btn-more">
            Ver todas las noticias <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title reveal">Jugadores Destacados</h2>
        <section className="home-players-grid">
          {players.length > 0 ? (
            players.map((p, i) => (
              <article key={i} className="home-player-card">
                <div className="home-player-photo">
                  <User size={80} />
                </div>
                <div className="home-player-info">
                  <h4>{p.name}</h4>
                  <span className="home-player-sport">{p.sport}</span>
                  <span className="home-player-stat">{p.stat}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: '#64748b' }}>Vacío</p>
          )}
        </section>
        <div className="section-footer">
          <Link to="/club" className="btn-more">
            Conoce más sobre el club <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </>
  )
}

export default Home
