
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';
import { WhapiTestPanel } from '@/components/whatsapp/WhapiTestPanel';
import { IntegrationTestPanel } from '@/components/whatsapp/IntegrationTestPanel';
import { DifyConnectionTest } from '@/components/whatsapp/DifyConnectionTest';
import { GrokConnectionTest } from '@/components/whatsapp/GrokConnectionTest';

export default function DevTools() {
  return (
    <ModernLayout>
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Ferramentas de Desenvolvimento</h1>
                <p className="text-gray-600">Teste e monitore as integrações da plataforma</p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0">
                Ambiente de Desenvolvimento
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Tabs defaultValue="health" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 mb-6 flex-shrink-0">
              <TabsTrigger value="health">Health Check</TabsTrigger>
              <TabsTrigger value="whapi">Whapi Debug</TabsTrigger>
              <TabsTrigger value="integration">Integração</TabsTrigger>
              <TabsTrigger value="grok">Grok AI</TabsTrigger>
              <TabsTrigger value="dify">Dify Bot</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <div className="w-full">
              <TabsContent value="health" className="w-full">
                <PlatformHealthCheck />
              </TabsContent>

              <TabsContent value="whapi" className="w-full">
                <WhapiTestPanel />
              </TabsContent>

              <TabsContent value="integration" className="w-full">
                <IntegrationTestPanel />
              </TabsContent>

              <TabsContent value="grok" className="w-full">
                <GrokConnectionTest />
              </TabsContent>

              <TabsContent value="dify" className="w-full">
                <DifyConnectionTest />
              </TabsContent>

              <TabsContent value="logs" className="w-full">
                <Card className="shadow-sm border-gray-100 max-h-96 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle>Logs do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
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
            </div>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
}
