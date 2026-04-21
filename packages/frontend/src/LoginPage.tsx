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

            {/* divisor y boton de google */}
            <div className="login-divider">
              <span>O</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={() => console.log('Login con Google')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
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
