
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function Settings() {
  return (
    <ModernLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Configurações da plataforma de gestão WhatsApp</p>
        </div>
        <SettingsPanel />
      </div>
    </ModernLayout>
  );
}
