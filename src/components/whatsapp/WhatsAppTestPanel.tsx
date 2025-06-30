
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';
import { IntegrationTestPanel } from './IntegrationTestPanel';
import { TestTube, Zap } from 'lucide-react';

export const WhatsAppTestPanel: React.FC = () => {
  return (
    <div className="h-full">
      <Tabs defaultValue="integration" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Testes Whapi</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Testes Plataforma</span>
          </TabsTrigger>
        </TabsList>

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
