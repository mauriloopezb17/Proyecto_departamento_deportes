import {
  Award,
  ClipboardList,
  Users,
  CheckCircle2,
  FileText,
  MessageCircle,
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
    title: 'Prepara tus Documentos',
    body: 'Ten lista la documentación requerida antes de acercarte al Departamento de Deportes.',
  },
  {
    Icon: Users,
    title: 'Habla con el Personal',
    body: 'Acercate al Departamento de Deportes UCB con tus documentos y te ayudamos a completar la inscripción.',
  },
]

const requirements = [
  'Ser estudiante regular inscrito en el semestre actual.',
  'Fotocopia simple de Cédula de Identidad.',
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
            <div key={i} className="step-card reveal">
              <div className="step-icon">
                <Icon size={28} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="requirements-box reveal">
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
          <div className="cta-icon">
            <MessageCircle size={40} />
          </div>
          <h2>¿Listo para inscribirte?</h2>
          <p>
            Cuando tengas todos tus requisitos listos, acercate al
            <strong> Departamento de Deportes UCB</strong>. Nuestro personal te
            ayudará a completar tu inscripción de forma presencial.
          </p>
          <p className="cta-note">
            La inscripción es realizada por el personal del departamento, no
            hay formulario en línea.
          </p>
        </div>
      </div>
    </>
  )
}

export default Inscribete
