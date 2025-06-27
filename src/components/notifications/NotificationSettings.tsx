
import React, { useState } from 'react';
import { Bell, Smartphone, Mail, Volume2, VolumeX, Save } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationConfig } from '@/data/notificationsData';

export const NotificationSettings: React.FC = () => {
  const { config, updateConfig } = useNotifications();
  const [localConfig, setLocalConfig] = useState<NotificationConfig>(config);

  const handleSave = () => {
    updateConfig(localConfig);
    // Show success message
    alert('Configurações salvas com sucesso!');
  };

  const handleConfigChange = (section: keyof NotificationConfig, key: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">Configurações de Notificações</h2>
      </div>

      <div className="space-y-8">
        {/* In-App Notifications */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">Notificações In-App</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {localConfig.inApp.sons ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-sm">Sons habilitados</span>
              </div>
              <input
                type="checkbox"
                checked={localConfig.inApp.sons}
                onChange={(e) => handleConfigChange('inApp', 'sons', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Toast notifications</span>
              <input
                type="checkbox"
                checked={localConfig.inApp.toast}
                onChange={(e) => handleConfigChange('inApp', 'toast', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Badges nos menus</span>
              <input
                type="checkbox"
                checked={localConfig.inApp.badges}
                onChange={(e) => handleConfigChange('inApp', 'badges', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Modais de alerta</span>
              <input
                type="checkbox"
                checked={localConfig.inApp.modal}
                onChange={(e) => handleConfigChange('inApp', 'modal', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notifications */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Smartphone className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">Notificações WhatsApp</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">WhatsApp ativo</span>
              <input
                type="checkbox"
                checked={localConfig.whatsapp.ativo}
                onChange={(e) => handleConfigChange('whatsapp', 'ativo', e.target.checked)}
                className="rounded"
              />
            </div>
            
            {localConfig.whatsapp.ativo && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipos de notificação
                  </label>
                  <div className="space-y-2">
                    {['novo_cliente', 'recomendacao_ia', 'alerta_tempo', 'meta_atingida'].map(tipo => (
                      <div key={tipo} className="flex items-center">
                        <input
                          type="checkbox"
                          id={tipo}
                          checked={localConfig.whatsapp.tipos.includes(tipo)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...localConfig.whatsapp.tipos, tipo]
                              : localConfig.whatsapp.tipos.filter(t => t !== tipo);
                            handleConfigChange('whatsapp', 'tipos', newTypes);
                          }}
                          className="rounded mr-2"
                        />
                        <label htmlFor={tipo} className="text-sm capitalize">
                          {tipo.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário ativo
                    </label>
                    <input
                      type="text"
                      value={localConfig.whatsapp.horario}
                      onChange={(e) => handleConfigChange('whatsapp', 'horario', e.target.value)}
                      placeholder="08:00-18:00"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                
                {localConfig.whatsapp.dias && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da semana
                    </label>
                    <div className="flex space-x-2">
                      {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map(dia => (
                        <button
                          key={dia}
                          onClick={() => {
                            const newDays = localConfig.whatsapp.dias?.includes(dia)
                              ? localConfig.whatsapp.dias.filter(d => d !== dia)
                              : [...(localConfig.whatsapp.dias || []), dia];
                            handleConfigChange('whatsapp', 'dias', newDays);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            localConfig.whatsapp.dias?.includes(dia)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {dia.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">Notificações Email</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email ativo</span>
              <input
                type="checkbox"
                checked={localConfig.email.ativo}
                onChange={(e) => handleConfigChange('email', 'ativo', e.target.checked)}
                className="rounded"
              />
            </div>
            
            {localConfig.email.ativo && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipos de email
                  </label>
                  <div className="space-y-2">
                    {['relatorio_diario', 'relatorio_semanal', 'backup', 'escalacao'].map(tipo => (
                      <div key={tipo} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`email_${tipo}`}
                          checked={localConfig.email.tipos?.includes(tipo) || false}
                          onChange={(e) => {
                            const currentTypes = localConfig.email.tipos || [];
                            const newTypes = e.target.checked
                              ? [...currentTypes, tipo]
                              : currentTypes.filter(t => t !== tipo);
                            handleConfigChange('email', 'tipos', newTypes);
                          }}
                          className="rounded mr-2"
                        />
                        <label htmlFor={`email_${tipo}`} className="text-sm capitalize">
                          {tipo.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequência
                  </label>
                  <select
                    value={localConfig.email.frequencia || 'diario'}
                    onChange={(e) => handleConfigChange('email', 'frequencia', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Configurações</span>
        </button>
      </div>
    </div>
  );
};
