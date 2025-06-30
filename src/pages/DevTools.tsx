
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';
import { WhatsAppTestPanel } from '@/components/whatsapp/WhatsAppTestPanel';
import { DifyConnectionTest } from '@/components/whatsapp/DifyConnectionTest';

export default function DevTools() {
  return (
    <ModernLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Ferramentas de Desenvolvimento</h1>
            <p className="text-gray-600">Teste e monitore as integrações da plataforma</p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Ambiente de Desenvolvimento
          </Badge>
        </div>

        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="dify">Dify Bot</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <PlatformHealthCheck />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppTestPanel />
          </TabsContent>

          <TabsContent value="dify">
            <DifyConnectionTest />
          </TabsContent>

          <TabsContent value="logs">
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 font-medium">[INFO]</span> Sistema iniciado com sucesso
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 font-medium">[DEBUG]</span> Conexão com Supabase estabelecida
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-600 font-medium">[WARN]</span> Configuração Whapi pendente
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
