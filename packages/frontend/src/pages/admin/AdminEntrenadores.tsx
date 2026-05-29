import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { apiFetch } from '../../utils/api'
import '../CSS/Admin.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Entrenador {
  id_entrenador: number
  nombres: string
  ape_paterno: string
  ape_materno: string | null
  cargo: string
  disciplinas: string[]
  experiencia: string
  bio: string | null
}

// ── Blank form ────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  nombres: '',
  ape_paterno: '',
  ape_materno: '',
  cargo: '',
  disciplinas: '',
  experiencia: '',
  bio: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

function AdminEntrenadores() {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'lista'

  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [listAlert, setListAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [form, setForm] = useState({ ...BLANK_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [formAlert, setFormAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [editing, setEditing] = useState<Entrenador | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK_FORM })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/', { replace: true }); return }
    loadEntrenadores()
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  function loadEntrenadores() {
    setListLoading(true)
    apiFetch<Entrenador[]>('/api/admin/entrenadores')
      .then(setEntrenadores)
      .catch(() => setEntrenadores([]))
      .finally(() => setListLoading(false))
  }

  const setField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const setEditField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  function buildPayload(f: typeof BLANK_FORM) {
    return {
      nombres: f.nombres.trim(),
      ape_paterno: f.ape_paterno.trim(),
      ape_materno: f.ape_materno.trim() || null,
      cargo: f.cargo,
      disciplinas: f.disciplinas.split(',').map(s => s.trim()).filter(Boolean),
      experiencia: f.experiencia.trim(),
      bio: f.bio.trim() || null,
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormAlert(null)
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/entrenadores', {
        method: 'POST',
        body: JSON.stringify(buildPayload(form)),
      })
      setFormAlert({ type: 'success', msg: 'Entrenador agregado correctamente.' })
      setForm({ ...BLANK_FORM })
      loadEntrenadores()
      setParams({ tab: 'lista' })
    } catch (err: any) {
      setFormAlert({ type: 'error', msg: err.message ?? 'Error al agregar entrenador.' })
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(e: Entrenador) {
    setEditing(e)
    setEditError('')
    setEditForm({
      nombres: e.nombres,
      ape_paterno: e.ape_paterno,
      ape_materno: e.ape_materno ?? '',
      cargo: e.cargo,
      disciplinas: e.disciplinas.join(', '),
      experiencia: e.experiencia,
      bio: e.bio ?? '',
    })
  }

  function closeEdit() {
    setEditing(null)
    setEditError('')
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setEditError('')
    setEditSubmitting(true)
    try {
      await apiFetch(`/api/admin/entrenadores/${editing.id_entrenador}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload(editForm)),
      })
      setEntrenadores(prev =>
        prev.map(x =>
          x.id_entrenador === editing.id_entrenador
            ? { ...x, ...buildPayload(editForm) }
            : x
        )
      )
      setListAlert({ type: 'success', msg: 'Entrenador actualizado.' })
      closeEdit()
    } catch (err: any) {
      setEditError(err.message ?? 'No se pudo actualizar al entrenador.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete(e: Entrenador) {
    const nombre = `${e.nombres} ${e.ape_paterno}`.trim()
    if (!window.confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    setListAlert(null)
    setDeletingId(e.id_entrenador)
    try {
      await apiFetch(`/api/admin/entrenadores/${e.id_entrenador}`, { method: 'DELETE' })
      setEntrenadores(prev => prev.filter(x => x.id_entrenador !== e.id_entrenador))
      setListAlert({ type: 'success', msg: `${nombre} fue eliminado.` })
    } catch (err: any) {
      setListAlert({ type: 'error', msg: err.message ?? 'No se pudo eliminar al entrenador.' })
    } finally {
      setDeletingId(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>

      <div className="admin-page-header">
        <h1>Entrenadores</h1>
        <p>Gestión del cuerpo técnico del departamento de deportes.</p>
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
          Agregar entrenador
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
          {listError && <p className="admin-empty" style={{ color: '#dc2626' }}>{listError}</p>}
          {!listLoading && !listError && entrenadores.length === 0 && (
            <p className="admin-empty">No hay entrenadores registrados aún.</p>
          )}
          {!listLoading && entrenadores.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre completo</th>
                    <th>Cargo</th>
                    <th>Disciplinas</th>
                    <th>Experiencia</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entrenadores.map(e => {
                    const isDeleting = deletingId === e.id_entrenador
                    return (
                      <tr key={e.id_entrenador}>
                        <td style={{ fontWeight: 600 }}>
                          {e.nombres} {e.ape_paterno}{e.ape_materno ? ` ${e.ape_materno}` : ''}
                        </td>
                        <td>{e.cargo}</td>
                        <td>{e.disciplinas.length > 0 ? e.disciplinas.join(', ') : '—'}</td>
                        <td>{e.experiencia || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-icon-btn edit"
                            onClick={() => openEdit(e)}
                            disabled={isDeleting}
                            title="Editar entrenador"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn delete"
                            onClick={() => handleDelete(e)}
                            disabled={isDeleting}
                            title="Eliminar entrenador"
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
              <h2>Editar entrenador</h2>
              <button type="button" className="admin-modal-close" onClick={closeEdit}>
                <X size={18} />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleEditSubmit}>
              {editError && <div className="admin-alert error">{editError}</div>}

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Nombres *</label>
                  <input
                    name="nombres"
                    className="admin-input"
                    value={editForm.nombres}
                    onChange={setEditField}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label>Apellido paterno *</label>
                  <input
                    name="ape_paterno"
                    className="admin-input"
                    value={editForm.ape_paterno}
                    onChange={setEditField}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Apellido materno</label>
                  <input
                    name="ape_materno"
                    className="admin-input"
                    value={editForm.ape_materno}
                    onChange={setEditField}
                  />
                </div>
                <div className="admin-field">
                  <label>Cargo *</label>
                  <select
                    name="cargo"
                    className="admin-select"
                    value={editForm.cargo}
                    onChange={setEditField}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option>Entrenador Principal</option>
                    <option>Asistente Técnico</option>
                    <option>Preparador Físico</option>
                    <option>Médico Deportivo</option>
                    <option>Nutricionista</option>
                    <option>Psicólogo Deportivo</option>
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label>Disciplinas (separadas por coma)</label>
                <input
                  name="disciplinas"
                  className="admin-input"
                  value={editForm.disciplinas}
                  onChange={setEditField}
                  placeholder="Ej: Fútbol, Básquetbol"
                />
              </div>

              <div className="admin-field">
                <label>Experiencia</label>
                <input
                  name="experiencia"
                  className="admin-input"
                  value={editForm.experiencia}
                  onChange={setEditField}
                  placeholder="Ej: 5 años"
                />
              </div>

              <div className="admin-field">
                <label>Biografía</label>
                <textarea
                  name="bio"
                  className="admin-input"
                  value={editForm.bio}
                  onChange={setEditField}
                  rows={3}
                />
              </div>

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
            <p className="admin-section-title">Datos del entrenador</p>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Nombres *</label>
                <input
                  name="nombres"
                  className="admin-input"
                  value={form.nombres}
                  onChange={setField}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Apellido paterno *</label>
                <input
                  name="ape_paterno"
                  className="admin-input"
                  value={form.ape_paterno}
                  onChange={setField}
                  required
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Apellido materno</label>
                <input
                  name="ape_materno"
                  className="admin-input"
                  value={form.ape_materno}
                  onChange={setField}
                />
              </div>
              <div className="admin-field">
                <label>Cargo *</label>
                <select
                  name="cargo"
                  className="admin-select"
                  value={form.cargo}
                  onChange={setField}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option>Entrenador Principal</option>
                  <option>Asistente Técnico</option>
                  <option>Preparador Físico</option>
                  <option>Médico Deportivo</option>
                  <option>Nutricionista</option>
                  <option>Psicólogo Deportivo</option>
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label>Disciplinas (separadas por coma)</label>
              <input
                name="disciplinas"
                className="admin-input"
                value={form.disciplinas}
                onChange={setField}
                placeholder="Ej: Fútbol, Básquetbol"
              />
            </div>

            <div className="admin-field">
              <label>Experiencia</label>
              <input
                name="experiencia"
                className="admin-input"
                value={form.experiencia}
                onChange={setField}
                placeholder="Ej: 5 años"
              />
            </div>

            <div className="admin-field">
              <label>Biografía</label>
              <textarea
                name="bio"
                className="admin-input"
                value={form.bio}
                onChange={setField}
                rows={3}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button type="submit" className="admin-btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Agregar entrenador'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminEntrenadores
