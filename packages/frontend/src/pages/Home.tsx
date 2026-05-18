import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  ArrowRight,
  Trophy,
  Calendar,
  Medal,
  User,
  Newspaper,
} from 'lucide-react'
import { apiFetch } from '../utils/api'
import './Home.css'

const lastResults = [
  { home: 'Sistemas', score: '3 - 1', away: 'Derecho' },
  { home: 'Arquitectura', score: '2 - 2', away: 'Medicina' },
  { home: 'Administración', score: '0 - 1', away: 'Ing. Civil' },
]

const upcomingMatches = [
  {
    meta: 'Mañana • Coliseo Principal • Fútsal',
    home: 'Sistemas',
    time: '18:30',
    away: 'Mecatrónica',
  },
  {
    meta: 'Viernes • Cancha Arq. • Básquetbol',
    home: 'Diseño',
    time: '19:45',
    away: 'Comunicación',
  },
]

const staticNews = [
  {
    Icon: Trophy,
    tag: 'Intercarreras',
    title: 'Sistemas clasifica a la final',
    body: 'El equipo de Ingeniería de Sistemas aseguró su pase a la final tras un agónico partido que se definió en penales.',
  },
  {
    Icon: Calendar,
    tag: 'Avisos',
    title: 'Nuevos horarios de Voleibol',
    body: 'Atención a todas las categorías, los entrenamientos se trasladan al coliseo principal.',
  },
  {
    Icon: Medal,
    tag: 'Logros',
    title: 'Medalla de oro en Nacionales',
    body: 'Nuestros representantes de Taekwondo traen el oro a casa en la última competencia.',
  },
]

const players = [
  { name: 'Alejandro Mendoza', sport: 'Fútsal - Sistemas', stat: 'Goleador del Torneo' },
  { name: 'Camila Vargas', sport: 'Básquetbol - Derecho', stat: 'MVP Semestral' },
  { name: 'Diego Rojas', sport: 'Ajedrez - Civil', stat: 'Campeón Nacional' },
]

interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  categoria_nombre: string
  imagen_portada: string | null
}

function Home() {
  const [noticias, setNoticias] = useState<Noticia[]>([])

  useEffect(() => {
    apiFetch<Noticia[]>('/api/noticias?publicado=true')
      .then((data) => setNoticias(data.slice(0, 3)))
      .catch(() => {})
  }, [])

  const newsItems = noticias.length > 0 ? noticias : null

  return (
    <>
      <header className="hero">
        <h1>El deporte universitario al siguiente nivel.</h1>
        <p>
          Únete a las disciplinas, revisa los fixtures en tiempo real y apoya a
          tu carrera en el torneo oficial de la UCB.
        </p>
        <Link to="/inscribete" className="btn-primary">
          <UserPlus size={18} />
          Inscríbete Ahora
        </Link>
      </header>

      <div className="container">
        <h2 className="section-title">Centro de Partidos</h2>
        <div className="match-center">
          <div className="match-panel">
            <h3>Últimos Resultados</h3>
            {lastResults.map((m, i) => (
              <div key={i} className="match-card">
                <div className="team-info">{m.home}</div>
                <div className="score-box">{m.score}</div>
                <div className="team-info away">{m.away}</div>
              </div>
            ))}
          </div>
          <div className="match-panel">
            <h3>Próximos Partidos (Intercarreras)</h3>
            {upcomingMatches.map((m, i) => (
              <div key={i} className="match-card wrap">
                <span className="match-meta">{m.meta}</span>
                <div className="team-info">{m.home}</div>
                <div className="time-box">{m.time}</div>
                <div className="team-info away">{m.away}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="section-footer">
          <Link to="/torneos" className="btn-more">
            Ver fixture y más información <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title">Noticias del Club</h2>
        <section className="home-news-grid">
          {newsItems
            ? newsItems.map((n) => (
                <article key={n.id_noticia} className="home-news-card">
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
              ))
            : staticNews.map(({ Icon, tag, title, body }, i) => (
                <article key={i} className="home-news-card">
                  <div className="home-news-img">
                    <Icon size={64} />
                  </div>
                  <div className="home-news-content">
                    <span className="home-news-tag">{tag}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
        </section>
        <div className="section-footer">
          <Link to="/noticias" className="btn-more">
            Ver todas las noticias <ArrowRight size={18} />
          </Link>
        </div>

        <h2 className="section-title">Jugadores Destacados</h2>
        <section className="home-players-grid">
          {players.map((p, i) => (
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
          ))}
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
