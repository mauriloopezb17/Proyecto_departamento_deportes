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
import AdminHub from './pages/admin/AdminHub'
import MisNoticias from './pages/admin/MisNoticias'
import RegistrarUsuario from './pages/admin/RegistrarUsuario'
import AdminDeportistas from './pages/admin/AdminDeportistas'
import AdminGaleria from './pages/admin/AdminGaleria'
import AdminEntrenadores from './pages/admin/AdminEntrenadores'
import AdminHorarios from './pages/admin/AdminHorarios'
import AdminPartidos from './pages/admin/AdminPartidos'
import AdminTorneo from './pages/admin/AdminTorneo'

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
            <Route path="/admin" element={<AdminHub />} />
            <Route path="/admin/mis-noticias" element={<MisNoticias />} />
            <Route path="/admin/registrar-usuario" element={<RegistrarUsuario />} />
            <Route path="/admin/deportistas" element={<AdminDeportistas />} />
            <Route path="/admin/galeria/:tipo" element={<AdminGaleria />} />
            <Route path="/admin/entrenadores" element={<AdminEntrenadores />} />
            <Route path="/admin/horarios" element={<AdminHorarios />} />
            <Route path="/admin/partidos" element={<AdminPartidos />} />
            <Route path="/admin/torneo" element={<AdminTorneo />} />
          </Route>
          <Route path="/noticiasAdmin" element={<AdminNoticias />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
