
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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6 w-full">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Temperatura dos Leads</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium justify-center sm:justify-start">
          <span className="text-base sm:text-lg">🔥</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Quentes: {data.hot}</span>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium justify-center sm:justify-start">
          <span className="text-base sm:text-lg">🟡</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Mornos: {data.warm}</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium justify-center sm:justify-start">
          <span className="text-base sm:text-lg">🔵</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Frios: {data.cold}</span>
        </div>
      </div>
    </div>
  );
};
