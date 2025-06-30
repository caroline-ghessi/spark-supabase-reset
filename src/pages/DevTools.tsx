
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
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
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
        <div className="flex-1 overflow-hidden px-6 py-6">
          <Tabs defaultValue="health" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 flex-shrink-0">
              <TabsTrigger value="health">Health Check</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="dify">Dify Bot</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="health" className="h-full">
                <PlatformHealthCheck />
              </TabsContent>

              <TabsContent value="whatsapp" className="h-full">
                <WhatsAppTestPanel />
              </TabsContent>

              <TabsContent value="dify" className="h-full">
                <DifyConnectionTest />
              </TabsContent>

              <TabsContent value="logs" className="h-full">
                <Card className="shadow-sm border-gray-100 h-full flex flex-col">
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
