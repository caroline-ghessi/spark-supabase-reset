
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function FirstLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Primeiro Acesso
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure sua conta para começar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo à Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">1. Configure seu perfil</h3>
                <p className="text-sm text-blue-700">Complete suas informações pessoais</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">2. Conecte o WhatsApp</h3>
                <p className="text-sm text-green-700">Integre sua conta WhatsApp Business</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900">3. Configure vendedores</h3>
                <p className="text-sm text-purple-700">Adicione sua equipe de vendas</p>
              </div>
            </div>

            <Link to="/settings">
              <Button className="w-full">
                Começar Configuração
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
