import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Torneos from './pages/Torneos'
import Club from './pages/Club'
import Noticias from './pages/Noticias'
import NoticiaDetalle from './pages/NoticiaDetalle'
import Inscribete from './pages/Inscribete'
import LoginPage from './LoginPage'
import AuthCallback from './pages/AuthCallback'
import AdminNoticias from './pages/AdminNoticias'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/club" element={<Club />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:id" element={<NoticiaDetalle />} />
            <Route path="/inscribete" element={<Inscribete />} />
          </Route>
          <Route path="/noticiasAdmin" element={<AdminNoticias />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
