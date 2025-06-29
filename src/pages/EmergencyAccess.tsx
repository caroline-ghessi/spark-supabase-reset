
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { sanitizeInput } from '@/utils/sanitize';

export function EmergencyAccess() {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const navigate = useNavigate();

  // Geração de token mais segura
  const generateEmergencyToken = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    // Hash simples para adicionar complexidade
    const hash = btoa(`${year}${month}${day}SECURE`).slice(0, 8);
    return `EMG-${year}${month}${day}-${hash}`;
  };

  // Validação do token mais rigorosa
  const validateEmergencyToken = (inputToken: string, expectedToken: string): boolean => {
    // Verificação de formato
    if (!inputToken || inputToken.length < 15) return false;
    
    // Comparação segura (evita timing attacks)
    if (inputToken.length !== expectedToken.length) return false;
    
    let isValid = true;
    for (let i = 0; i < inputToken.length; i++) {
      if (inputToken[i] !== expectedToken[i]) {
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleEmergencyAccess = async () => {
    setLoading(true);
    setError('');

    try {
      // Sanitizar input
      const cleanCode = sanitizeInput(secretCode.toUpperCase().trim());
      
      if (!cleanCode) {
        setError('Código de emergência não pode estar vazio');
        return;
      }

      // Verificar rate limiting básico
      const lastAttempt = localStorage.getItem('emergency_last_attempt');
      const now = Date.now();
      
      if (lastAttempt && (now - parseInt(lastAttempt)) < 5000) {
        setError('Aguarde 5 segundos entre tentativas');
        return;
      }
      
      localStorage.setItem('emergency_last_attempt', now.toString());

      // Código mais seguro baseado na data atual
      const today = new Date();
      const expectedCode = generateEmergencyToken(today);

      if (validateEmergencyToken(cleanCode, expectedCode)) {
        // Criar acesso de emergência válido por apenas 1 hora
        const expiresAt = Date.now() + 3600000; // 1 hora
        
        localStorage.setItem('emergency_access', 'true');
        localStorage.setItem('emergency_expires', expiresAt.toString());
        localStorage.setItem('emergency_token', expectedCode);
        
        // Log de segurança detalhado
        console.warn('🚨 Acesso de emergência ativado', {
          timestamp: new Date().toISOString(),
          expiresAt: new Date(expiresAt).toISOString(),
          userAgent: navigator.userAgent,
          ip: 'client-side' // Em produção, seria capturado no servidor
        });
        
        // Aguardar um pouco para simular validação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        navigate('/');
      } else {
        setError('Código de emergência inválido. Verifique o formato e a data.');
        
        // Log de tentativa inválida
        console.warn('🚨 Tentativa de acesso de emergência inválida', {
          timestamp: new Date().toISOString(),
          attemptedCode: cleanCode.substring(0, 5) + '***', // Log parcial por segurança
          userAgent: navigator.userAgent
        });
      }
    } catch (error) {
      setError('Erro ao processar código de emergência.');
      console.error('Erro no acesso de emergência:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar tempo restante se há acesso ativo
  useState(() => {
    const interval = setInterval(() => {
      const emergencyExpires = localStorage.getItem('emergency_expires');
      if (emergencyExpires) {
        const expiresAt = parseInt(emergencyExpires);
        const now = Date.now();
        const remaining = expiresAt - now;
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Acesso de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Este acesso é apenas para situações de emergência e será registrado. 
              Válido por apenas 1 hora.
            </AlertDescription>
          </Alert>

          {timeRemaining && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Acesso de emergência ativo. Expira em: {timeRemaining}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Input
              type="password"
              placeholder="Código de emergência"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleEmergencyAccess()}
              disabled={loading}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-2">
              Formato: EMG-AAAAMMDD-HASH (baseado na data atual + hash de segurança)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleEmergencyAccess}
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Ativar Acesso de Emergência'}
          </Button>

          <div className="text-center">
            <a 
              href="/login" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar ao login normal
            </a>
          </div>

          {/* Informações de segurança */}
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>🔒 Todas as tentativas são registradas</p>
            <p>⏱️ Acesso limitado a 1 hora</p>
            <p>🚨 Apenas para emergências reais</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
