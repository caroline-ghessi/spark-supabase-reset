
import React from 'react';
import { TrendingUp, Send, Eye, MousePointer, Clock } from 'lucide-react';
import { notificationMetrics } from '@/data/notificationsData';

export const NotificationMetrics: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Métricas de Notificações</h3>
        <span className="text-sm text-gray-500">{notificationMetrics.periodo}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Enviadas</p>
              <p className="text-2xl font-bold text-blue-900">
                {notificationMetrics.envios.total.toLocaleString()}
              </p>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Taxa de Abertura</p>
              <p className="text-2xl font-bold text-green-900">
                {notificationMetrics.engagement.taxa_abertura}%
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Taxa de Ação</p>
              <p className="text-2xl font-bold text-orange-900">
                {notificationMetrics.engagement.taxa_acao}%
              </p>
            </div>
            <MousePointer className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-purple-900">
                {notificationMetrics.engagement.tempo_medio_resposta}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Distribuição por Canal</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In-App</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(notificationMetrics.envios.inApp / notificationMetrics.envios.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {notificationMetrics.envios.inApp}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">WhatsApp</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(notificationMetrics.envios.whatsapp / notificationMetrics.envios.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {notificationMetrics.envios.whatsapp}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(notificationMetrics.envios.email / notificationMetrics.envios.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {notificationMetrics.envios.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Eficácia por Tipo</h4>
          <div className="space-y-3">
            {notificationMetrics.eficacia_por_tipo.map((tipo, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {tipo.tipo.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tipo.enviadas} enviadas
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Taxa de resposta</span>
                  <span className="text-sm font-semibold text-green-600">
                    {tipo.taxa_resposta}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full"
                    style={{ width: `${tipo.taxa_resposta}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
          Insights de Performance
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-green-800 mb-1">✅ Melhor Performance</h5>
            <p className="text-xs text-green-600">
              Notificações de "cliente aguardando" têm 93.2% de taxa de resposta
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-800 mb-1">📊 Insight IA</h5>
            <p className="text-xs text-blue-600">
              Recomendações da IA resultaram em 89 conversões diretas
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-orange-800 mb-1">⚡ Tempo Médio</h5>
            <p className="text-xs text-orange-600">
              Resposta em 3.2 min em média - 40% mais rápido que o trimestre anterior
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
