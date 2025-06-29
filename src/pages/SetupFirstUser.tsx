
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function SetupFirstUser() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasUsers, setHasUsers] = useState(false);
  const [formData, setFormData] = useState({
    email: 'caroline@drystore.com.br',
    password: '',
    confirmPassword: '',
    name: 'Caroline Ghessi'
  });
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingUsers();
  }, []);

  const checkExistingUsers = async () => {
    try {
      // Usar query customizada para contornar limitações de tipos
      const { count } = await supabase
        .from('users' as any)
        .select('*', { count: 'exact', head: true });
      
      setHasUsers((count ?? 0) > 0);
    } catch (error) {
      console.error('Erro ao verificar usuários:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, formData.name);

      if (result.success) {
        setSuccess(true);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando sistema...</p>
      </div>
    );
  }

  if (hasUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sistema já configurado</CardTitle>
            <CardDescription>
              Já existem usuários cadastrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Usuário criado com sucesso!</CardTitle>
            <CardDescription>
              Redirecionando para o login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            Crie o primeiro usuário administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
