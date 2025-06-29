
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/components/users/AuthenticatedUserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Páginas de autenticação
import { Login } from '@/pages/Login';
import { EmergencyAccess } from '@/pages/EmergencyAccess';
import { SetupFirstUser } from '@/pages/SetupFirstUser';

// Páginas principais existentes
import Index from '@/pages/Index';
import HealthCheck from '@/pages/HealthCheck';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>
              <Routes>
                {/* Rotas Públicas - SEMPRE ACESSÍVEIS */}
                <Route path="/login" element={<Login />} />
                <Route path="/emergency-access-2024" element={<EmergencyAccess />} />
                <Route path="/setup-first-user" element={<SetupFirstUser />} />
                <Route path="/health" element={<HealthCheck />} />
                
                {/* Rotas Protegidas */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 para rotas inexistentes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <Toaster />
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
