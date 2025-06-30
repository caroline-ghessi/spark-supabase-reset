
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { VendorMonitoringPanel } from '@/components/whatsapp/VendorMonitoringPanel';

export default function VendorMonitoring() {
  return (
    <ModernLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Monitoramento de Vendedores</h1>
          <p className="text-gray-600">Acompanhe a qualidade do atendimento em tempo real</p>
        </div>
        <VendorMonitoringPanel />
      </div>
    </ModernLayout>
  );
}
