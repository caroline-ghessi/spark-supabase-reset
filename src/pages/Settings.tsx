
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function Settings() {
  return (
    <ModernLayout>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <SettingsPanel />
        </div>
      </div>
    </ModernLayout>
  );
}
