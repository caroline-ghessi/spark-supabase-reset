
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';
import { IntegrationTestPanel } from './IntegrationTestPanel';
import { WhapiTestPanel } from './WhapiTestPanel';
import { IntegrationVerificationPanel } from './IntegrationVerificationPanel';
import { TestTube, Zap, MessageSquare, CheckCircle } from 'lucide-react';

export const WhatsAppTestPanel: React.FC = () => {
  return (
    <div className="h-full">
      <Tabs defaultValue="verification" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="verification" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Verificação</span>
          </TabsTrigger>
          <TabsTrigger value="whapi" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Whapi</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Integração</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Plataforma</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="flex-1 overflow-auto">
          <IntegrationVerificationPanel />
        </TabsContent>

        <TabsContent value="whapi" className="flex-1 overflow-auto">
          <WhapiTestPanel />
        </TabsContent>

        <TabsContent value="integration" className="flex-1 overflow-auto">
          <IntegrationTestPanel />
        </TabsContent>

        <TabsContent value="platform" className="flex-1 overflow-auto">
          <PlatformHealthCheck />
        </TabsContent>
      </Tabs>
    </div>
  );
};
