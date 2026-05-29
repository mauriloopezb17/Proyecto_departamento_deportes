import {
  ClipboardList,
  CheckCircle2,
  FileText,
  MessageCircle,
  Key,
  MapPin
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import './Inscribete.css'

type Step = { Icon: LucideIcon; title: string; body: string }

const steps: Step[] = [
  {
    Icon: MapPin,
    title: 'Ve al Departamento',
    body: 'Ve al departamento de deportes de la universidad y habla con el encargado.',
  },
  {
    Icon: ClipboardList,
    title: 'Entrega tus Datos',
    body: 'Entrégale los datos al encargado de deportes de la universidad. Si es que hubiese un tutor, entrégale los datos de él también.',
  },
  {
    Icon: Key,
    title: 'Inicia Sesión',
    body: 'Inicia tu sesión en el sistema. La contraseña inicial es tu número de documento, y luego cambia tu contraseña.',
  },
]

const requirements = [
  'Documento de identidad.',
  'Carnet del seguro médico (si es que tuviese).',
  'Historial de experiencia deportiva, en caso que hayas participado en algún otro club.',
]

function Inscribete() {
  return (
    <>
      <PageHeader
        title="Únete al Club Deportivo"
        subtitle="Representa a tu carrera, compite al más alto nivel y forma parte de la comunidad deportiva más grande de la UCB."
      />

      <div className="container inscribete-container">
        <div className="inscribete-layout">
          
          {/* Left Column: Steps */}
          <div className="inscribete-steps-section reveal">
            <h2>Pasos de Inscripción</h2>
            <div className="vertical-steps">
              {steps.map(({ Icon, title, body }, i) => (
                <div key={i} className="vertical-step">
                  <div className="vertical-step-icon">
                    <Icon size={24} />
                  </div>
                  <div className="vertical-step-content">
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info Cards */}
          <div className="inscribete-info-section reveal">
            
            {/* Requirements Card */}
            <div className="info-card">
              <div className="info-card-header">
                <FileText size={24} />
                <h3>Requisitos Obligatorios</h3>
              </div>
              <div className="info-card-body">
                <p className="req-intro">
                  Ten los siguientes datos presentes antes de acercarte al departamento (<strong>no es necesario que traigas los documentos originales</strong>):
                </p>
                <ul className="req-list">
                  {requirements.map((r, i) => (
                    <li key={i}>
                      <CheckCircle2 size={18} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className="info-card">
              <div className="info-card-header" style={{ background: 'var(--ucb-yellow)', color: 'var(--ucb-blue)' }}>
                <MapPin size={24} />
                <h3 style={{ color: 'var(--ucb-blue)' }}>¿Dónde nos encontramos?</h3>
              </div>
              <div className="info-card-body" style={{ padding: 0 }}>
                <img 
                  src="/ucb-assets/mapa.png" 
                  alt="Mapa de ubicación del Departamento de Deportes UCB" 
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </>
  )
}

export default Inscribete
