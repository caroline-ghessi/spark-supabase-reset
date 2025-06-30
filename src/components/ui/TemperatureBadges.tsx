
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
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8 w-full">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Temperatura dos Leads</h3>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex-shrink-0">
          <span className="text-base sm:text-lg">🔥</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Quentes: {data.hot}</span>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex-shrink-0">
          <span className="text-base sm:text-lg">🟡</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Mornos: {data.warm}</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex-shrink-0">
          <span className="text-base sm:text-lg">🔵</span>
          <span className="text-sm sm:text-base whitespace-nowrap">Frios: {data.cold}</span>
        </div>
      </div>
    </div>
  );
};
