
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, User, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        toast.success(result.message || 'Login realizado com sucesso!');
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Erro ao fazer login');
        toast.error(result.error || 'Erro ao fazer login');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado ao fazer login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (type: 'admin' | 'dev') => {
    if (type === 'admin') {
      setEmail('admin@whatsapp.local');
      setPassword('admin123');
    } else if (type === 'dev') {
      setEmail('dev@admin.local');
      setPassword('DevSecure2024!@#');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Plataforma WhatsApp
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema de gestão
          </p>
        </div>

        {/* Avisos de Desenvolvimento */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Contas de Teste Disponíveis:</strong>
            <div className="mt-2 space-y-1">
              <div>• Admin: admin@whatsapp.local / admin123</div>
              <div>• Dev: dev@admin.local / DevSecure2024!@#</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Entrar na Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>

              {/* Botões de Acesso Rápido */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                >
                  👑 Admin
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('dev')}
                  disabled={loading}
                >
                  🔧 Dev
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema de Gestão de Vendas WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
};
