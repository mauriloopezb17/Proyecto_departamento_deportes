import {
  Award,
  ClipboardList,
  Edit3,
  CheckCircle2,
  FileText,
  Play,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import './Inscribete.css'

type Step = { Icon: LucideIcon; title: string; body: string }

const steps: Step[] = [
  {
    Icon: Award,
    title: 'Elige tu Disciplina',
    body: 'Revisa los horarios de entrenamiento y asegúrate de que se ajusten a tu carga académica semestral.',
  },
  {
    Icon: ClipboardList,
    title: 'Prepara tus Datos',
    body: 'Ten a mano tu matrícula vigente y tu información médica básica para agilizar el proceso de registro.',
  },
  {
    Icon: Edit3,
    title: 'Llena el Formulario',
    body: 'Completa la solicitud digital. Nuestro equipo validará tu información y te contactará en 48 horas.',
  },
]

const requirements = [
  'Ser estudiante regular inscrito en el semestre actual.',
  'Fotocopia simple de Cédula de Identidad.',
  'Certificado médico de aptitud física (vigencia máx. 3 meses).',
  'Seguro contra accidentes vigente (Universitario o Privado).',
]

function Inscribete() {
  return (
    <>
      <PageHeader
        title="Únete al Club Deportivo"
        subtitle="Representa a tu carrera, compite al más alto nivel y forma parte de la comunidad deportiva más grande de la UCB."
      />

      <div className="container inscribete-container">
        <div className="steps-grid">
          {steps.map(({ Icon, title, body }, i) => (
            <div key={i} className="step-card">
              <div className="step-icon">
                <Icon size={28} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="requirements-box">
          <div className="req-text">
            <h2>Requisitos Obligatorios</h2>
            <p>
              Para garantizar un entorno seguro y competitivo, todos los
              atletas deben cumplir con los siguientes requisitos antes de la
              primera práctica:
            </p>
            <ul className="req-list">
              {requirements.map((r, i) => (
                <li key={i}>
                  <CheckCircle2 size={20} /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="req-icon-side">
            <FileText size={100} />
          </div>
        </div>

        <div className="cta-section">
          <h2>¿Listo para entrar a la cancha?</h2>
          <p>
            El periodo de inscripciones para el Torneo Intercarreras 2026
            cierra este viernes. No dejes a tu equipo con un jugador menos.
          </p>
          <a href="#" className="btn-mega">
            Comenzar Inscripción <Play size={18} />
          </a>
        </div>
      </div>
    </>
  )
}

export default Inscribete
