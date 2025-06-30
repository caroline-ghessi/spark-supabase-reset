
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
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-3 w-full">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm font-semibold text-gray-900 mr-4">Temperatura:</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-2 py-1 rounded font-medium text-xs">
            <span>🔥</span>
            <span>{data.hot}</span>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-medium text-xs">
            <span>🟡</span>
            <span>{data.warm}</span>
          </div>
          <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium text-xs">
            <span>🔵</span>
            <span>{data.cold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
