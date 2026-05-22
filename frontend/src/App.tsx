import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { UserSchema } from '@/schemas'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ChatPage from '@/pages/ChatPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me')
      return UserSchema.parse(res.data)
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RootRedirect() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me')
      return UserSchema.parse(res.data)
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/chat"
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
