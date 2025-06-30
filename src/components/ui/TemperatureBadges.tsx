
import React from 'react';

interface TemperatureData {
  hot: number;
  warm: number;
  cold: number;
}

interface TemperatureBadgesProps {
  data: TemperatureData;
}

export const TemperatureBadges: React.FC<TemperatureBadgesProps> = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Temperatura dos Leads</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-6 py-3 rounded-lg font-medium">
          <span className="text-lg">🔥</span>
          <span>Quentes: {data.hot}</span>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-lg font-medium">
          <span className="text-lg">🟡</span>
          <span>Mornos: {data.warm}</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-lg font-medium">
          <span className="text-lg">🔵</span>
          <span>Frios: {data.cold}</span>
        </div>
      </div>
    </div>
  );
};
