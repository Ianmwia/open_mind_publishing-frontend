import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/context/AuthContext'

import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

// 1. Create a safe Protected Route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              
              {/* 2. Wrap your profile route with the ProtectedRoute guard */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
