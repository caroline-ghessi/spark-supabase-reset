
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, validateEmail } from '@/utils/sanitize';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDevHint, setShowDevHint] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Verificar bloqueio ao carregar componente
  useEffect(() => {
    const blockedUntil = localStorage.getItem('login_blocked_until');
    if (blockedUntil) {
      const blockedTime = parseInt(blockedUntil);
      const now = Date.now();
      
      if (now < blockedTime) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((blockedTime - now) / 1000));
        
        const interval = setInterval(() => {
          const remaining = Math.ceil((blockedTime - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            localStorage.removeItem('login_blocked_until');
            clearInterval(interval);
          } else {
            setBlockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('login_blocked_until');
      }
    }

    // Recuperar tentativas de login
    const attempts = localStorage.getItem('login_attempts_count');
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Login bloqueado. Tente novamente em ${Math.ceil(blockTimeRemaining / 60)} minutos.`);
      return;
    }

    setError('');
    setLoading(true);

    // Sanitizar inputs
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    // Validações básicas
    if (!cleanEmail || !cleanPassword) {
      setError('Email e senha são obrigatórios');
      setLoading(false);
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    const result = await signIn(cleanEmail, cleanPassword);

    if (result.success) {
      // Limpar tentativas em caso de sucesso
      localStorage.removeItem('login_attempts_count');
      localStorage.removeItem('login_attempts');
      setLoginAttempts(0);
      navigate('/');
    } else {
      // Incrementar tentativas
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('login_attempts_count', newAttempts.toString());
      localStorage.setItem('login_attempts', newAttempts.toString());
      
      // Bloquear após 5 tentativas
      if (newAttempts >= 5) {
        const blockUntil = Date.now() + (30 * 60 * 1000); // 30 minutos
        localStorage.setItem('login_blocked_until', blockUntil.toString());
        setIsBlocked(true);
        setBlockTimeRemaining(30 * 60); // 30 minutos em segundos
        setError('Muitas tentativas de login. Conta bloqueada por 30 minutos.');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
      
      // Mostrar dica de dev após 3 tentativas em ambiente de desenvolvimento
      if (newAttempts >= 3 && import.meta.env.DEV) {
        setShowDevHint(true);
      }
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                    disabled={loading || isBlocked}
                    maxLength={254}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                    disabled={loading || isBlocked}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isBlocked}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginAttempts > 0 && !isBlocked && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tentativa {loginAttempts} de 5. {5 - loginAttempts} tentativas restantes.
                  </AlertDescription>
                </Alert>
              )}

              {isBlocked && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Login bloqueado por segurança. Tempo restante: {formatTime(blockTimeRemaining)}
                  </AlertDescription>
                </Alert>
              )}

              {error && !isBlocked && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showDevHint && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Ambiente de Desenvolvimento:</strong> Use dev@admin.local com senha DevSecure2024!@#
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || isBlocked}
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

        {/* Informação adicional de segurança */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🔒 Sistema protegido • Acesso restrito a usuários autorizados</p>
          <p>🛡️ Monitoramento de segurança ativo</p>
          {import.meta.env.DEV && (
            <p className="text-orange-500">⚠️ Modo Desenvolvimento Ativo</p>
          )}
        </div>
      </div>
    </div>
  );
}
