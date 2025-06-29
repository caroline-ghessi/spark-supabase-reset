
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail, AlertCircle, Shield } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDevHint, setShowDevHint] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro ao fazer login');
      
      // Se falhar, mostrar dica de dev após 3 tentativas
      const attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
      localStorage.setItem('login_attempts', attempts.toString());
      
      if (attempts >= 3 && import.meta.env.DEV) {
        setShowDevHint(true);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            WhatsApp Sales Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre com suas credenciais para acessar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showDevHint && (
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Dica Dev:</strong> Use caroline@drystore.com.br
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Links de emergência (apenas em dev) */}
            {import.meta.env.DEV && (
              <div className="mt-6 text-center space-y-2">
                <Link
                  to="/emergency-access-2024"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Acesso de Emergência
                </Link>
                <br />
                <Link
                  to="/setup-first-user"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Configurar Primeiro Usuário
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="text-center text-xs text-gray-500">
          <p>Sistema protegido • Acesso restrito a usuários autorizados</p>
          {import.meta.env.DEV && (
            <p className="mt-1 text-orange-500">Modo Desenvolvimento Ativo</p>
          )}
        </div>
      </div>
    </div>
  );
}
