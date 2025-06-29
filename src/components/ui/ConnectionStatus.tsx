
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const channel = supabase
      .channel('connection-status')
      .subscribe((status) => {
        console.log('🔌 Status de conexão:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setShowStatus(false);
          reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          setShowStatus(true);
          
          // Tentar reconectar automaticamente
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
              console.log(`🔄 Tentativa de reconexão ${reconnectAttempts}/${maxReconnectAttempts}`);
              channel.subscribe();
            }, 2000 * reconnectAttempts);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isConnected && !showStatus) return null;

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all duration-300 ${
      isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Reconectando...</span>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
        </>
      )}
    </div>
  );
};
