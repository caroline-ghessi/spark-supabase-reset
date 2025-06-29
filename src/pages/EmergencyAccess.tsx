
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export function EmergencyAccess() {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateEmergencyToken = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `EMG-${year}${month}${day}-SECURE`;
  };

  const handleEmergencyAccess = async () => {
    setLoading(true);
    setError('');

    try {
      // Código mais seguro baseado na data atual
      const today = new Date();
      const expectedCode = generateEmergencyToken(today);

      if (secretCode.toUpperCase().trim() === expectedCode) {
        // Criar acesso de emergência válido por apenas 1 hora
        const expiresAt = Date.now() + 3600000; // 1 hora
        
        localStorage.setItem('emergency_access', 'true');
        localStorage.setItem('emergency_expires', expiresAt.toString());
        localStorage.setItem('emergency_token', expectedCode);
        
        // Log de segurança
        console.warn('🚨 Acesso de emergência ativado às', new Date().toISOString());
        
        // Aguardar um pouco para simular validação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        navigate('/');
      } else {
        setError('Código de emergência inválido. Verifique o formato e a data.');
      }
    } catch (error) {
      setError('Erro ao processar código de emergência.');
    } finally {
      setLoading(false);
    }
  };

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

          <div>
            <Input
              type="password"
              placeholder="Código de emergência"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleEmergencyAccess()}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Formato: EMG-AAAAMMDD-SECURE (baseado na data atual)
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
        </CardContent>
      </Card>
    </div>
  );
}
