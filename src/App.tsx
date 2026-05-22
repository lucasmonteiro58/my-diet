import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from './components/ui/Toaster'
import { AuthProvider } from './contexts/AuthContext'
import { DietProvider } from './contexts/DietContext'
import { EditModeProvider } from './contexts/EditModeContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <ThemeProvider>
    <EditModeProvider>
    <AuthProvider>
      <DietProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </DietProvider>
    </AuthProvider>
    </EditModeProvider>
    </ThemeProvider>
  )
}
