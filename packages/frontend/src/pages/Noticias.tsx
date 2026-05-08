import { Award, Shirt, Mic, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import './Noticias.css'

type NewsItem = {
  Icon: LucideIcon
  tag: string
  title: string
  body: string
}

const items: NewsItem[] = [
  {
    Icon: Award,
    tag: 'Competición',
    title: 'Gran Victoria en Fútsal',
    body: 'El equipo representativo logró una victoria histórica frente a su rival tradicional en un partido lleno de emociones.',
  },
  {
    Icon: Shirt,
    tag: 'Institucional',
    title: 'Nuevas Equipaciones 2026',
    body: 'Presentamos oficialmente la indumentaria que vestirán nuestros atletas en la próxima temporada universitaria.',
  },
  {
    Icon: Mic,
    tag: 'Entrevista',
    title: 'Liderazgo en el Campo',
    body: 'Conversamos con la capitana del equipo de Voleibol sobre los retos de esta nueva temporada.',
  },
]

function Noticias() {
  return (
    <>
      <PageHeader
        title="Centro de Noticias"
        subtitle="Mantente al día con los eventos y logros de nuestra comunidad deportiva."
        thinBorder
      />
      <div className="container news-container">
        <div className="news-grid">
          {items.map(({ Icon, tag, title, body }, i) => (
            <article key={i} className="news-card">
              <div className="news-img">
                <Icon size={80} />
              </div>
              <div className="news-content">
                <span className="news-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <a href="#" className="btn-read">
                  Leer más <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Noticias
