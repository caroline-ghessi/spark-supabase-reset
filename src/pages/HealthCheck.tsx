
import React from 'react';
import { PlatformHealthCheck } from '@/components/testing/PlatformHealthCheck';

const HealthCheck: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PlatformHealthCheck />
      </div>
    </div>
  );
};

export default HealthCheck;
