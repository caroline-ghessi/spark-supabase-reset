
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function Settings() {
  return (
    <ModernLayout>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Configurações</h1>
            <p className="text-gray-600">Configurações da plataforma de gestão WhatsApp</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-0">
          <SettingsPanel />
        </div>
      </div>
    </ModernLayout>
  );
}
