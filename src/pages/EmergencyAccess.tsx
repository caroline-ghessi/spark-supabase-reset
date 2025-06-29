
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
  const navigate = useNavigate();

  const handleEmergencyAccess = () => {
    // Código baseado na data atual
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const expectedCode = `EMERGENCY-${day}${month}-CAROLINE`;

    if (secretCode.toUpperCase() === expectedCode) {
      // Criar acesso de emergência válido por 1 hora
      localStorage.setItem('emergency_access', 'true');
      localStorage.setItem('emergency_expires', (Date.now() + 3600000).toString());
      
      // Log de segurança
      console.warn('🚨 Acesso de emergência ativado às', new Date().toISOString());
      
      navigate('/');
    } else {
      setError('Código inválido. Formato: EMERGENCY-DDMM-CAROLINE');
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
            </AlertDescription>
          </Alert>

          <div>
            <Input
              type="password"
              placeholder="Código de emergência"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmergencyAccess()}
            />
            <p className="text-xs text-gray-500 mt-2">
              Formato: EMERGENCY-[DIA][MÊS]-CAROLINE
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
          >
            Ativar Acesso de Emergência
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
