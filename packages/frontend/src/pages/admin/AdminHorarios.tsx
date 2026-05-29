import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { apiFetch } from '../../utils/api'
import '../CSS/Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Disciplina { id_disciplina: number; nombre_disciplina: string }
interface EntrenadorBasic { id_entrenador: number; nombres: string; ape_paterno: string; cargo: string }

interface Horario {
  id_horario: number
  id_disciplina: number
  nombre_disciplina: string
  categoria: string
  nivel: string
  dias: string[]
  hora: string
  ubicacion: string
  id_entrenador: number | null
  nombre_entrenador: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DIAS_OPCIONES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const BLANK_FORM = {
  id_disciplina: '',
  categoria: '',
  nivel: '',
  dias: [] as string[],
  hora: '',
  ubicacion: '',
  id_entrenador: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

function AdminHorarios() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'lista'

  const [horarios, setHorarios] = useState<Horario[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [entrenadores, setEntrenadores] = useState<EntrenadorBasic[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listAlert, setListAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [form, setForm] = useState({ ...BLANK_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [editing, setEditing] = useState<Horario | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK_FORM })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }

    apiFetch<{ disciplinas: Disciplina[] }>('/api/admin/catalogos/inscripcion')
      .then(data => setDisciplinas(data.disciplinas))
      .catch(() => {})

    apiFetch<EntrenadorBasic[]>('/api/admin/entrenadores')
      .then(setEntrenadores)
      .catch(() => {})

    loadHorarios()
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  function loadHorarios() {
    setListLoading(true)
    apiFetch<Horario[]>('/api/admin/horarios')
      .then(setHorarios)
      .catch(() => setHorarios([]))
      .finally(() => setListLoading(false))
  }

  function toggleDia(dia: string, current: string[], setter: (d: string[]) => void) {
    if (current.includes(dia)) {
      setter(current.filter(d => d !== dia))
    } else {
      setter([...current, dia])
    }
  }

  function buildPayload(f: typeof BLANK_FORM) {
    return {
      id_disciplina: parseInt(f.id_disciplina, 10),
      categoria: f.categoria.trim(),
      nivel: f.nivel,
      dias: f.dias,
      hora: f.hora,
      ubicacion: f.ubicacion.trim(),
      id_entrenador: f.id_entrenador ? parseInt(f.id_entrenador, 10) : null,
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.dias.length === 0) {
      setFormAlert({ type: 'error', msg: 'Selecciona al menos un día.' })
      return
    }
    setFormAlert(null)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/horarios', {
        method: 'POST',
        body: JSON.stringify(buildPayload(form)),
      })
      setFormAlert({ type: 'success', msg: 'Horario creado correctamente.' })
      setForm({ ...BLANK_FORM })
      loadHorarios()
      setParams({ tab: 'lista' })
    } catch (err: any) {
      setFormAlert({ type: 'error', msg: err.message ?? 'Error al crear horario.' })
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(h: Horario) {
    setEditing(h)
    setEditError('')
    setEditForm({
      id_disciplina: String(h.id_disciplina),
      categoria: h.categoria,
      nivel: h.nivel,
      dias: [...h.dias],
      hora: h.hora,
      ubicacion: h.ubicacion,
      id_entrenador: h.id_entrenador != null ? String(h.id_entrenador) : '',
    })
  }

  function closeEdit() {
    setEditing(null)
    setEditError('')
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    if (editForm.dias.length === 0) {
      setEditError('Selecciona al menos un día.')
      return
    }
    setEditError('')
    setEditSubmitting(true)
    try {
      await apiFetch(`/api/admin/horarios/${editing.id_horario}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload(editForm)),
      })
      loadHorarios()
      setListAlert({ type: 'success', msg: 'Horario actualizado.' })
      closeEdit()
    } catch (err: any) {
      setEditError(err.message ?? 'No se pudo actualizar el horario.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete(h: Horario) {
    if (!window.confirm(`¿Eliminar el horario de ${h.nombre_disciplina} (${h.nivel})? Esta acción no se puede deshacer.`)) return
    setListAlert(null)
    setDeletingId(h.id_horario)
    try {
      await apiFetch(`/api/admin/horarios/${h.id_horario}`, { method: 'DELETE' })
      setHorarios(prev => prev.filter(x => x.id_horario !== h.id_horario))
      setListAlert({ type: 'success', msg: 'Horario eliminado.' })
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar el horario.' })
    } finally {
      setDeletingId(null)
    }
  }

  // ── Shared form fields renderer ────────────────────────────────────────────

  function renderFormFields(
    f: typeof BLANK_FORM,
    setScalar: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    setDias: (d: string[]) => void,
  ) {
    return (
      <>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Disciplina *</label>
            <select
              name="id_disciplina"
              className="admin-select"
              value={f.id_disciplina}
              onChange={setScalar}
              required
            >
              <option value="">Seleccionar...</option>
              {disciplinas.map(d => (
                <option key={d.id_disciplina} value={d.id_disciplina}>
                  {d.nombre_disciplina}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Categoría *</label>
            <input
              name="categoria"
              className="admin-input"
              value={f.categoria}
              onChange={setScalar}
              required
              placeholder="Ej: Sub-18"
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label>Nivel *</label>
            <select
              name="nivel"
              className="admin-select"
              value={f.nivel}
              onChange={setScalar}
              required
            >
              <option value="">Seleccionar...</option>
              <option>Competitivo</option>
              <option>Recreativo</option>
              <option>Alto rendimiento</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Hora *</label>
            <input
              name="hora"
              type="time"
              className="admin-input"
              value={f.hora}
              onChange={setScalar}
              required
            />
          </div>
        </div>

        <div className="admin-field">
          <label>Días *</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {DIAS_OPCIONES.map(dia => (
              <label
                key={dia}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: `1.5px solid ${f.dias.includes(dia) ? 'var(--ucb-blue)' : 'var(--border-color)'}`,
                  background: f.dias.includes(dia) ? 'var(--ucb-blue-light)' : '#fff',
                  color: f.dias.includes(dia) ? 'var(--ucb-blue)' : 'var(--text-light)',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  style={{ display: 'none' }}
                  checked={f.dias.includes(dia)}
                  onChange={() => toggleDia(dia, f.dias, setDias)}
                />
                {dia}
              </label>
            ))}
          </div>
        </div>

        <div className="admin-field">
          <label>Ubicación *</label>
          <input
            name="ubicacion"
            className="admin-input"
            value={f.ubicacion}
            onChange={setScalar}
            required
            placeholder="Ej: Cancha Principal"
          />
        </div>

        <div className="admin-field">
          <label>Entrenador asignado</label>
          <select
            name="id_entrenador"
            className="admin-select"
            value={f.id_entrenador}
            onChange={setScalar}
          >
            <option value="">Sin entrenador asignado</option>
            {entrenadores.map(e => (
              <option key={e.id_entrenador} value={e.id_entrenador}>
                {e.nombres} {e.ape_paterno} — {e.cargo}
              </option>
            ))}
          </select>
        </div>
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Horarios</h1>
        <p>Gestión de horarios de entrenamiento por disciplina y nivel.</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'lista' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'lista' })}
        >
          Lista
        </button>
        <button
          className={`admin-tab${tab === 'agregar' ? ' active' : ''}`}
          onClick={() => setParams({ tab: 'agregar' })}
        >
          Agregar horario
        </button>
      </div>

      {/* ── Lista ── */}
      {tab === 'lista' && (
        <div className="admin-card">
          {listAlert && (
            <div className={`admin-alert ${listAlert.type}`} style={{ marginBottom: 16 }}>
              {listAlert.msg}
            </div>
          )}
          {listLoading && <p className="admin-empty">Cargando...</p>}
          {!listLoading && horarios.length === 0 && (
            <p className="admin-empty">No hay horarios registrados aún.</p>
          )}
          {!listLoading && horarios.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Nivel</th>
                    <th>Días</th>
                    <th>Hora</th>
                    <th>Ubicación</th>
                    <th>Entrenador</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map(h => {
                    const isDeleting = deletingId === h.id_horario
                    return (
                      <tr key={h.id_horario}>
                        <td style={{ fontWeight: 600 }}>{h.nombre_disciplina}</td>
                        <td>{h.nivel}</td>
                        <td>{h.dias.join(' · ')}</td>
                        <td>{h.hora}</td>
                        <td>{h.ubicacion}</td>
                        <td>{h.nombre_entrenador ?? '—'}</td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-icon-btn edit"
                            onClick={() => openEdit(h)}
                            disabled={isDeleting}
                            title="Editar horario"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn delete"
                            onClick={() => handleDelete(h)}
                            disabled={isDeleting}
                            title="Eliminar horario"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Edit modal ── */}
      {editing && (
        <div className="admin-modal-backdrop" onClick={closeEdit}>
          <div className="admin-modal" onClick={ev => ev.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Editar horario</h2>
              <button type="button" className="admin-modal-close" onClick={closeEdit}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleEditSubmit}>
              {editError && <div className="admin-alert error">{editError}</div>}
              {renderFormFields(
                editForm,
                e => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value })),
                dias => setEditForm(prev => ({ ...prev, dias })),
              )}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeEdit}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Agregar ── */}
      {tab === 'agregar' && (
        <div className="admin-card">
          {formAlert && (
            <div className={`admin-alert ${formAlert.type}`} style={{ marginBottom: 24 }}>
              {formAlert.msg}
            </div>
          )}
          <form className="admin-form" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
            <p className="admin-section-title">Datos del horario</p>
            {renderFormFields(
              form,
              e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value })),
              dias => setForm(prev => ({ ...prev, dias })),
            )}
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="admin-btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Crear horario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminHorarios
