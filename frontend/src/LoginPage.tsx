//pagina de login para el depto de deportes ucb
import { useState, type FormEvent } from 'react'

import './LoginPage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  //manejar envio del formulario
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    //validar que los campos no esten vacios
    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.')
      return
    }

    setLoading(true)

    //simular autenticacion, despues se conecta al backend
    setTimeout(() => {
      setLoading(false)
      console.log('intento de login:', { email, remember })
    }, 1500)
  }

  return (
    <div className="login-page">
      {/* barra dorada de arriba */}
      <div className="login-topbar">
        <img src="/escudo.png" alt="UCB" className="topbar-logo" />
      </div>

      {/* contenido central */}
      <div className="login-content">
        <div className="login-card">
          {/* encabezado con logo */}
          <div className="login-header">
            <img
              src="/escudo.png"
              alt="Universidad Católica Boliviana"
              className="login-logo"
            />
            <h1 className="login-title">Departamento de Deportes</h1>
            <p className="login-subtitle">Iniciá sesión para continuar</p>
          </div>

          {/* error si hay */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* formulario */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* campo de correo */}
            <div className="input-group">
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                className="input-field"
                type="email"
                placeholder="tu.correo@ucb.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* campo de contraseña */}
            <div className="input-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                {/* boton ojo para ver contraseña */}
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* recordarme y olvide contraseña */}
            <div className="login-options">
              <label className="remember-label" htmlFor="remember-check">
                <input
                  id="remember-check"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Recordarme
              </label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            {/* boton de enviar */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* link para pedir acceso */}
          <div className="login-footer">
            <p>¿No tenés cuenta? <a href="#">Solicitar acceso</a></p>
          </div>
        </div>
      </div>

      {/* copyright abajo */}
      <div className="login-copyright">
        © {new Date().getFullYear()} Universidad Católica Boliviana "San Pablo"
      </div>
    </div>
  )
}

export default LoginPage
