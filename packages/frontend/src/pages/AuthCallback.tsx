import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search || window.location.hash.replace(/^#/, ''),
    )
    const token = params.get('token') || params.get('access_token')
    if (token) {
      try {
        localStorage.setItem('ucb_token', token)
      } catch {
        // ignore storage failures
      }
    }
    navigate('/', { replace: true })
  }, [navigate])

  return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ucb-blue)' }}>
      Completando inicio de sesión...
    </div>
  )
}

export default AuthCallback
