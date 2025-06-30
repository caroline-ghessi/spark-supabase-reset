
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { VendorMonitoringPanel } from '@/components/whatsapp/VendorMonitoringPanel';

export default function VendorMonitoring() {
  return (
    <ModernLayout>
      <div className="h-full w-full">
        <VendorMonitoringPanel />
      </div>
    </ModernLayout>
  );
}
