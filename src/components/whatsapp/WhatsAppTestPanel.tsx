
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';
import { IntegrationTestPanel } from './IntegrationTestPanel';
import { WhapiTestPanel } from './WhapiTestPanel';
import { TestTube, Zap, MessageSquare } from 'lucide-react';

export const WhatsAppTestPanel: React.FC = () => {
  return (
    <div className="h-full">
      <Tabs defaultValue="whapi" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
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
