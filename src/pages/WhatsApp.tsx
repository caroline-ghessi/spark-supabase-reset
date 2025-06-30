
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';

export default function WhatsApp() {
  return (
    <MainLayout>
      <WhatsAppDashboard />
    </MainLayout>
  );
}
