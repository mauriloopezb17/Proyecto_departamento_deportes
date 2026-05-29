//pagina de login para el depto de deportes ucb
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { API_BASE, apiFetch } from "./utils/api";
import { useAuth } from "./contexts/AuthContext";

const ERROR_MESSAGES: Record<string, string> = {
  no_registrado:
    "Tu cuenta de Google no está registrada en el sistema. Contactá al administrador para solicitar acceso.",
  server_error:
    "Ocurrió un error inesperado. Intentá de nuevo más tarde.",
};

function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const urlError = ERROR_MESSAGES[params.get("error") ?? ""] ?? null;

  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("ucb_token", data.token);
      refreshAuth();
      const dest = data.user?.id_rol === 1 ? "/admin" : "/";
      navigate(dest, { replace: true });
    } catch (err: any) {
      setFormError(err.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* barra dorada de arriba */}
      <div className="login-topbar">
        <img
          src="/ucb-assets/UCB%20escudo.png"
          alt="UCB"
          className="topbar-logo"
        />
      </div>

      {/* contenido central */}
      <div className="login-content">
        <div className="login-card">
          {/* encabezado con logo */}
          <div className="login-header">
            <img
              src="/ucb-assets/UCB%20escudo.png"
              alt="Universidad Católica Boliviana"
              className="login-logo"
            />
            <h1 className="login-title">Departamento de Deportes</h1>
            <p className="login-subtitle">Iniciá sesión para continuar</p>
          </div>

          {/* formulario */}
          <form className="login-form" noValidate onSubmit={handleLogin}>
            {(urlError || formError) && (
              <div className="login-error" role="alert">
                {urlError ?? formError}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="usuario@ucb.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? (
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div className="login-divider"><span>o</span></div>

            <button
              type="button"
              className="google-btn"
              onClick={() =>
                (window.location.href = `${API_BASE}/api/auth/google`)
              }
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <div className="login-footer">
            <Link to="/">← Volver al inicio</Link>
          </div>
        </div>
      </div>

      {/* copyright abajo */}
      <div className="login-copyright">
        © {new Date().getFullYear()} Universidad Católica Boliviana "San Pablo"
      </div>
    </div>
  );
}

export default LoginPage;
